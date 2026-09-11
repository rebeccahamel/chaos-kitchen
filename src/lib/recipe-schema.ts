// Zod schema for one recipe file (SPEC.md §4 and §7). Build time only.
//
// Structural checks (required fields, types) come from Zod itself.
// Cross-checks against the central lists, duplicate ids, ranges and step
// placeholders are done in the superRefine at the bottom, with German messages
// because Becci reads them in the build log when a recipe file has a mistake.

import { z } from 'astro/zod';
import type { Ingredient, Lists } from './types.ts';
import { idSchema } from './lists.ts';
import { findUnit, LARGE_TO_BASE } from './units.ts';
import { placeholderIds, validateStep } from './placeholders.ts';
import { flattenIngredients, ingredientsById } from './recipe.ts';

export type WarnFn = (message: string) => void;

const text = z.string().min(1, 'darf nicht leer sein');
const minutes = z.number().int().nonnegative();
const positive = z.number().positive();

const amountSchema = z.union([positive, z.tuple([positive, positive])], {
  error: 'Menge muss eine Zahl (z. B. 250) oder eine Spanne (z. B. [1, 2]) sein',
});

const ingredientSchema = z.strictObject({
  id: idSchema,
  name: text,
  plural: text.optional(),
  amount: amountSchema.optional(),
  unit: text.optional(),
  note: text.optional(),
  optional: z.boolean().optional(),
  whole: z.boolean().optional(),
});

type Group<Item> = { group?: string; items: Item[] };

/**
 * Accepts either a flat list of items or a list of groups ({ group, items }) and
 * always returns groups; a flat list becomes one group without a heading (SPEC.md §4.5).
 */
function listOrGroups<Item>(itemSchema: z.ZodType<Item>) {
  const groupSchema = z.strictObject({
    group: text,
    items: z.array(itemSchema).min(1, 'mindestens ein Eintrag'),
  });
  const isGroup = (entry: unknown) =>
    typeof entry === 'object' && entry !== null && ('group' in entry || 'items' in entry);

  return z
    .array(z.unknown())
    .min(1, 'mindestens ein Eintrag')
    .transform((entries, ctx): Group<Item>[] => {
      const groupCount = entries.filter(isGroup).length;
      if (groupCount > 0 && groupCount < entries.length) {
        ctx.addIssue({ code: 'custom', message: 'entweder eine einfache Liste oder nur Gruppen (group + items), nicht gemischt' });
        return [];
      }
      const result = groupCount === 0 ? z.array(itemSchema).safeParse(entries) : z.array(groupSchema).safeParse(entries);
      if (!result.success) {
        for (const issue of result.error.issues) {
          ctx.addIssue({ code: 'custom', message: issue.message, path: [...issue.path] });
        }
        return [];
      }
      return groupCount === 0 ? [{ items: result.data as Item[] }] : (result.data as Group<Item>[]);
    });
}

/** kg → g and l → ml, so scaling works on one base unit (SPEC.md §5.1). */
function normalizeIngredient(ingredient: Ingredient): Ingredient {
  const large = ingredient.unit ? LARGE_TO_BASE[ingredient.unit] : undefined;
  if (!large || ingredient.amount === undefined) return ingredient;
  const amount = Array.isArray(ingredient.amount)
    ? ([ingredient.amount[0] * large.factor, ingredient.amount[1] * large.factor] as [number, number])
    : ingredient.amount * large.factor;
  return { ...ingredient, amount, unit: large.base };
}

export function createRecipeSchema(lists: Lists, warn: WarnFn = (message) => console.warn(message)) {
  const tagIds = new Set(lists.tags.flatMap((category) => category.tags.map((tag) => tag.id)));

  return z
    .strictObject({
      title: text,
      description: text,
      author: text,
      added: z.coerce.date({ error: 'Datum im Format YYYY-MM-DD erwartet' }),
      yield: z.strictObject({
        amount: positive,
        unit: text,
        note: text.optional(),
      }),
      time: z.strictObject({
        prep: minutes,
        cook: minutes.optional(),
        rest: minutes.optional(),
      }),
      tags: z.array(z.string()),
      ingredients: listOrGroups(ingredientSchema).transform((groups) =>
        groups.map((group) => ({ ...group, items: group.items.map(normalizeIngredient) })),
      ),
      steps: listOrGroups(text),
    })
    .superRefine((recipe, ctx) => {
      const issue = (path: (string | number)[], message: string) => ctx.addIssue({ code: 'custom', path, message });

      if (!lists.people.some((person) => person.id === recipe.author)) {
        issue(['author'], `Person „${recipe.author}“ steht nicht in people.yaml`);
      }
      recipe.tags.forEach((tag, index) => {
        if (!tagIds.has(tag)) issue(['tags', index], `Tag „${tag}“ steht nicht in tags.yaml`);
      });
      if (!findUnit(lists.units, recipe.yield.unit)) {
        issue(['yield', 'unit'], `Einheit „${recipe.yield.unit}“ steht nicht in units.yaml`);
      }

      // Earlier structural errors leave these empty; nothing more to check then.
      if (recipe.ingredients.length === 0 || recipe.steps.length === 0) return;

      const ingredients = flattenIngredients(recipe.ingredients);
      const seen = new Set<string>();
      for (const ingredient of ingredients) {
        if (seen.has(ingredient.id)) issue(['ingredients'], `Zutaten-Id „${ingredient.id}“ kommt mehrfach vor`);
        seen.add(ingredient.id);
        if (ingredient.unit && !findUnit(lists.units, ingredient.unit)) {
          issue(['ingredients'], `Zutat „${ingredient.id}“: Einheit „${ingredient.unit}“ steht nicht in units.yaml`);
        }
        if (Array.isArray(ingredient.amount) && ingredient.amount[0] >= ingredient.amount[1]) {
          issue(['ingredients'], `Zutat „${ingredient.id}“: bei einer Spanne muss der erste Wert kleiner als der zweite sein`);
        }
      }

      const byId = ingredientsById(recipe.ingredients);
      const used = new Set<string>();
      let number = 0;
      for (const group of recipe.steps) {
        for (const step of group.items) {
          number += 1;
          for (const error of validateStep(step, byId)) issue(['steps'], `Schritt ${number}: ${error}`);
          for (const id of placeholderIds(step)) used.add(id);
        }
      }

      for (const ingredient of ingredients) {
        if (!used.has(ingredient.id)) {
          warn(`Rezept „${recipe.title}“: Zutat „${ingredient.id}“ wird in keinem Schritt verwendet.`);
        }
      }
    });
}

export type Recipe = z.output<ReturnType<typeof createRecipeSchema>>;
