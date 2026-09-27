// schema.org Recipe data for the <script type="application/ld+json"> block on a recipe page
// (SPEC.md §6.4, §6.8). Bring! reads it to import the ingredients into a shopping list.
// Pure functions; the Recipe type import is type-only and disappears at runtime.

import type { Recipe } from './recipe-schema.ts';
import type { BringRule, Ingredient, Lists, UnitDef } from './types.ts';
import { BASE_TO_LARGE, findUnit, unitLabel } from './units.ts';
import { normalizeForSearch } from './search.ts';
import { flattenIngredients, flattenSteps, ingredientsById, totalTime } from './recipe.ts';
import { renderStep } from './placeholders.ts';
import { tagLabel } from './tags.ts';

export interface PageInfo {
  /** absolute URL of the recipe page */
  url: string;
  /** absolute URL of the preview picture */
  image: string;
}

/** Plain number for machines: decimal point, no fraction glyphs, at most three decimals. */
function plainNumber(value: number): string {
  return String(Math.round(value * 1000) / 1000);
}

/** The learned rule for an ingredient name, if any (src/data/bring.yaml). */
function bringRuleFor(name: string, rules: BringRule[]): BringRule | undefined {
  const key = normalizeForSearch(name);
  return rules.find((rule) => normalizeForSearch(rule.name) === key);
}

/**
 * One ingredient as a machine-readable line at base yield, the name first and the amount
 * behind a comma: "Basmatireis, 300 g", "Hackfleisch, 1.5 kg", "Zwiebeln, 2",
 * "Petersilie, 0.5 Bund, glatt", "Butter, 1 EL, optional", "Salz". Bring! takes the words
 * before the first comma as the item and everything after it as the specification, and it
 * scales the amount in there (checked 2026-09-27). With the amount in front, Bring! had to guess
 * where the unit ends and the name begins, which produced "Porreestangen" and
 * "Reispapierblätter" (SPEC.md §6.4). The learned rules in bring.yaml still force the singular
 * ("Kopfsalat, 2") or another name when Bring! does not know the name as written.
 */
export function ingredientLine(ingredient: Ingredient, units: UnitDef[], rules: BringRule[] = []): string {
  const rule = bringRuleFor(ingredient.name, rules);
  let name = rule?.as ?? ingredient.name;
  let line: string;

  if (ingredient.amount === undefined) {
    line = name;
  } else {
    let values = Array.isArray(ingredient.amount) ? [...ingredient.amount] : [ingredient.amount];
    let unitName = ingredient.unit;
    const max = Math.max(...values);

    // g and ml switch to kg and l from 1000 upwards, both ends of a range together (as on the page)
    if (unitName && unitName in BASE_TO_LARGE && max >= 1000) {
      values = values.map((v) => v / 1000);
      unitName = BASE_TO_LARGE[unitName];
    }

    // Counted items (no unit) take the plural above 1, like the ingredient list, unless a rule says otherwise
    if (!ingredient.unit && max > 1 && !rule?.singular && !rule?.as) name = ingredient.plural ?? ingredient.name;

    const unitDef = unitName ? findUnit(units, unitName) : undefined;
    const unit = unitName ? (unitDef ? unitLabel(unitDef, max) : unitName) : undefined;
    line = `${name}, ${values.map(plainNumber).join('-')}${unit ? ` ${unit}` : ''}`;
  }

  if (ingredient.note) line += `, ${ingredient.note}`;
  if (ingredient.optional) line += ', optional';
  return line;
}

/** ISO 8601 duration for schema.org: 20 → "PT20M", 60 → "PT1H", 90 → "PT1H30M". */
export function isoDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `PT${rest}M`;
  if (rest === 0) return `PT${hours}H`;
  return `PT${hours}H${rest}M`;
}

/** The schema.org Recipe object for one recipe page. */
export function recipeJsonLd(recipe: Recipe, lists: Lists, page: PageInfo): Record<string, unknown> {
  const { units } = lists;
  const author = lists.people.find((p) => p.id === recipe.author)?.name ?? recipe.author;
  const yieldUnit = findUnit(units, recipe.yield.unit);
  const yieldLabel = yieldUnit ? unitLabel(yieldUnit, recipe.yield.amount) : recipe.yield.unit;
  const byId = ingredientsById(recipe.ingredients);

  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Recipe',
    name: recipe.title,
    description: recipe.description,
    author: { '@type': 'Person', name: author },
    image: page.image,
    url: page.url,
    datePublished: recipe.added.toISOString().slice(0, 10),
    recipeYield: `${recipe.yield.amount} ${yieldLabel}`,
    prepTime: isoDuration(recipe.time.prep),
  };
  if (recipe.time.cook !== undefined) data.cookTime = isoDuration(recipe.time.cook);
  data.totalTime = isoDuration(totalTime(recipe.time));
  if (recipe.tags.length > 0) data.keywords = recipe.tags.map((tag) => tagLabel(lists.tags, tag)).join(', ');
  data.recipeIngredient = flattenIngredients(recipe.ingredients).map((ingredient) => ingredientLine(ingredient, units, lists.bring));
  data.recipeInstructions = flattenSteps(recipe.steps).map((step) => ({
    '@type': 'HowToStep',
    text: renderStep(step, byId, units),
  }));

  return data;
}
