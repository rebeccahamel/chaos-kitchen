// The weekly plan in src/data/plan.yaml (MEAL_PLANNER.md §14, SPEC.md §6.9): up to two weeks,
// this week and the next. Build time only: reads files. The homepage and the hidden week pages
// call loadPlan(); build-checks.ts runs the same validation at the start of every dev and build.

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import yaml from 'js-yaml';
import { z } from 'astro/zod';
import { DEFAULT_DATA_DIR, idSchema, loadYamlFile } from './lists.ts';
import { createRecipeSchema } from './recipe-schema.ts';
import { flattenIngredients } from './recipe.ts';
import { unmergedNames } from './shopping.ts';
import type { Lists, Plan, PlanDay, PlanEntry, Week } from './types.ts';

/**
 * Upper limit of different recipes in one week. Every possible selection of them gets its own
 * hidden page for Bring! (2^n − 1 pages), so 10 recipes mean 1023 small pages per week.
 */
export const MAX_PLAN_RECIPES = 10;

/** This week and the next: enough to plan ahead, and it bounds the number of hidden pages. */
export const MAX_PLAN_WEEKS = 2;

export const PLAN_FILE = 'plan.yaml';

const text = z.string().min(1, 'darf nicht leer sein');
const date = z.coerce.date({ error: 'Datum im Format YYYY-MM-DD erwartet' });

const entrySchema = z.union(
  [z.strictObject({ recipe: idSchema }), z.strictObject({ leftovers: date }), z.strictObject({ text })],
  { error: 'eine Mahlzeit ist { recipe: <slug> }, { leftovers: <Datum> } oder { text: "…" }' },
);

const daySchema = z.strictObject({
  date,
  lunch: entrySchema.optional(),
  dinner: entrySchema.optional(),
});

/** "2026-09-28" for a date, so days can be compared and shown without time zone surprises. */
export function isoDate(value: Date): string {
  return value.toISOString().slice(0, 10);
}

/** The lunch and dinner entries of a day that point at a recipe. */
function recipeEntries(day: PlanDay): { recipe: string }[] {
  return [day.lunch, day.dinner].filter((entry): entry is { recipe: string } => entry !== undefined && 'recipe' in entry);
}

/** All recipe slugs of a week in plan order (lunch before dinner), each once. */
export function weekRecipes(week: Week): string[] {
  const slugs: string[] = [];
  for (const day of week.days) {
    for (const entry of recipeEntries(day)) {
      if (!slugs.includes(entry.recipe)) slugs.push(entry.recipe);
    }
  }
  return slugs;
}

/** All recipe slugs of the whole plan, each once. */
export function planRecipes(plan: Plan): string[] {
  return [...new Set(plan.weeks.flatMap(weekRecipes))];
}

/**
 * The first day of a week as "2026-09-28": the week's identity in the hidden page addresses and
 * in the visitor's browser storage for the ticks.
 */
export function weekKey(week: Week): string {
  return isoDate(week.days[0].date);
}

const dayMonth = new Intl.DateTimeFormat('de-DE', { day: 'numeric', month: 'long', timeZone: 'UTC' });
const weekday = new Intl.DateTimeFormat('de-DE', { weekday: 'long', timeZone: 'UTC' });

/** "23.–25. September", "28. September – 2. Oktober", or one date when the week has a single day. */
export function weekTitle(week: Week): string {
  const first = week.days[0].date;
  const last = week.days[week.days.length - 1].date;
  if (isoDate(first) === isoDate(last)) return dayMonth.format(first);
  const sameMonth = isoDate(first).slice(0, 7) === isoDate(last).slice(0, 7);
  return sameMonth ? `${first.getUTCDate()}.–${dayMonth.format(last)}` : `${dayMonth.format(first)} – ${dayMonth.format(last)}`;
}

/** "Montag" for a plan date (UTC, because YAML dates carry no time zone). */
export function weekdayName(date: Date): string {
  return weekday.format(date);
}

/** true when the plan has at least one week; an empty plan hides the section on the homepage. */
export function hasPlan(plan: Plan | undefined): plan is Plan {
  return plan !== undefined && plan.weeks.length > 0;
}

/** The rules within one week: sorted unique days, known recipes each once, leftovers of an earlier cooked day, the cap. */
function createWeekSchema(known: Set<string>) {
  return z
    .strictObject({
      note: text.optional(),
      days: z.array(daySchema).min(1, 'eine Woche braucht mindestens einen Tag'),
    })
    .superRefine((week, ctx) => {
      const issue = (path: (string | number)[], message: string) => ctx.addIssue({ code: 'custom', path, message });

      const seenDates = new Set<string>();
      const seenRecipes = new Set<string>();
      week.days.forEach((day, index) => {
        const today = isoDate(day.date);
        const previous = index > 0 ? isoDate(week.days[index - 1].date) : '';
        if (seenDates.has(today)) issue(['days', index, 'date'], `der ${today} kommt zweimal vor`);
        else if (today < previous) issue(['days', index, 'date'], `die Tage müssen aufsteigend sortiert sein (${today} nach ${previous})`);
        seenDates.add(today);

        for (const meal of ['lunch', 'dinner'] as const) {
          const entry = day[meal];
          if (!entry) continue;
          if ('recipe' in entry) {
            if (!known.has(entry.recipe)) {
              issue(['days', index, meal], `Rezept „${entry.recipe}“ gibt es nicht (src/content/recipes/${entry.recipe}.yaml)`);
            } else if (seenRecipes.has(entry.recipe)) {
              issue(['days', index, meal], `Rezept „${entry.recipe}“ kommt schon vor; für Reste { leftovers: <Datum> } verwenden`);
            }
            seenRecipes.add(entry.recipe);
          } else if ('leftovers' in entry) {
            const from = isoDate(entry.leftovers);
            const source = week.days.find((d) => isoDate(d.date) === from);
            if (!source || from >= today) {
              issue(['days', index, meal], `leftovers: der ${from} ist kein früherer Tag dieser Woche`);
            } else if (recipeEntries(source).length === 0) {
              issue(['days', index, meal], `leftovers: am ${from} wird kein Rezept gekocht`);
            }
          }
        }
      });

      if (seenRecipes.size > MAX_PLAN_RECIPES) {
        issue(['days'], `höchstens ${MAX_PLAN_RECIPES} verschiedene Rezepte pro Woche (es sind ${seenRecipes.size})`);
      }
    });
}

/**
 * The schema for plan.yaml: a list of weeks. Like the recipe schema it needs the central data,
 * here the slugs of all recipes, so that a plan can only point at recipes that exist.
 */
export function createPlanSchema(recipeSlugs: Iterable<string>) {
  const known = new Set(recipeSlugs);

  return z
    .strictObject({
      weeks: z.array(createWeekSchema(known)),
    })
    .superRefine((plan, ctx) => {
      const issue = (path: (string | number)[], message: string) => ctx.addIssue({ code: 'custom', path, message });

      if (plan.weeks.length > MAX_PLAN_WEEKS) {
        issue(['weeks'], `höchstens ${MAX_PLAN_WEEKS} Wochen im Plan (es sind ${plan.weeks.length})`);
      }
      plan.weeks.forEach((week, index) => {
        if (index === 0) return;
        const previous = plan.weeks[index - 1];
        const lastBefore = isoDate(previous.days[previous.days.length - 1].date);
        const first = weekKey(week);
        if (first <= lastBefore) {
          issue(
            ['weeks', index, 'days', 0, 'date'],
            `die Wochen müssen aufsteigend sortiert sein und dürfen sich nicht überschneiden (${first} nach ${lastBefore})`,
          );
        }
      });
    });
}

/**
 * Reads and validates src/data/plan.yaml. Throws with a German message naming the field when
 * the file is wrong. Returns undefined when there is no plan file at all.
 */
export function loadPlan(recipeSlugs: Iterable<string>, dataDir: string = DEFAULT_DATA_DIR): Plan | undefined {
  const file = join(dataDir, PLAN_FILE);
  if (!existsSync(file)) return undefined;
  return loadYamlFile(file, createPlanSchema(recipeSlugs));
}

/**
 * Slugs of the recipe files marked `trial: true`. Reads the raw files, because this runs before
 * Astro's content collection; a file that does not parse is reported by the collection anyway.
 */
export function readTrialSlugs(recipesDir: string): string[] {
  if (!existsSync(recipesDir)) return [];
  const slugs: string[] = [];
  for (const file of readdirSync(recipesDir)) {
    if (file.startsWith('_') || !file.endsWith('.yaml')) continue;
    try {
      const raw = yaml.load(readFileSync(join(recipesDir, file), 'utf8'));
      if (typeof raw === 'object' && raw !== null && (raw as { trial?: unknown }).trial === true) {
        slugs.push(file.slice(0, -'.yaml'.length));
      }
    } catch {
      // invalid YAML: the content collection reports it with a proper message
    }
  }
  return slugs;
}

/**
 * One warning per week and ingredient name that the week's recipes use with different units,
 * because such lines do not merge on the shopping list (SPEC.md §6.9). Reads and validates the
 * recipe files with the real schema; a file that fails validation is skipped here and reported
 * by the collection.
 */
export function unmergedWarnings(plan: Plan | undefined, recipesDir: string, lists: Lists): string[] {
  if (!plan) return [];
  const schema = createRecipeSchema(lists, () => {});
  return plan.weeks.flatMap((week) => {
    const ingredientLists = weekRecipes(week).flatMap((slug) => {
      try {
        const result = schema.safeParse(yaml.load(readFileSync(join(recipesDir, `${slug}.yaml`), 'utf8')));
        return result.success ? [flattenIngredients(result.data.ingredients)] : [];
      } catch {
        return [];
      }
    });
    return unmergedNames(ingredientLists, lists.units).map(
      ({ name, units }) =>
        `Wochenplan ${weekTitle(week)}: „${name}“ kommt mit verschiedenen Einheiten vor (${units.join(', ')}) und wird auf der Einkaufsliste nicht zusammengefasst.`,
    );
  });
}

/** One warning per trial recipe that no week of the plan uses (MEAL_PLANNER.md §14). */
export function forgottenTrials(plan: Plan | undefined, trialSlugs: string[]): string[] {
  const planned = new Set(plan ? planRecipes(plan) : []);
  return trialSlugs
    .filter((slug) => !planned.has(slug))
    .map((slug) => `Rezept „${slug}“ ist mit trial: true markiert, steht aber nicht im Wochenplan. Behalten (trial entfernen) oder Datei löschen.`);
}

export type { Plan, PlanDay, PlanEntry, Week };
