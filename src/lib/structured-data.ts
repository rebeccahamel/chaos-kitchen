// schema.org Recipe data for the <script type="application/ld+json"> block on a recipe page
// (SPEC.md §6.4, §6.8). Bring! reads it to import the ingredients into a shopping list.
// Pure functions; the Recipe type import is type-only and disappears at runtime.

import type { Recipe } from './recipe-schema.ts';
import type { Ingredient, Lists, UnitDef } from './types.ts';
import { BASE_TO_LARGE, findUnit, unitLabel } from './units.ts';
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

/**
 * One ingredient as a machine-readable line at base yield: "300 g Basmatireis",
 * "1.5 kg Hackfleisch", "0.5 Bund Petersilie, glatt", "1 EL Butter, optional", "Salz".
 * Text after a comma becomes the note in Bring!. Two Bring!-specific rules (SPEC.md §6.4):
 * counted items keep the singular ("2 Kopfsalat"), and units with compound: true are glued onto
 * the name ("1-2 Knoblauchzehen"), because Bring! matches its catalogue on such words.
 */
export function ingredientLine(ingredient: Ingredient, units: UnitDef[]): string {
  const parts: string[] = [];

  if (ingredient.amount === undefined) {
    parts.push(ingredient.name);
  } else {
    let values = Array.isArray(ingredient.amount) ? [...ingredient.amount] : [ingredient.amount];
    let unitName = ingredient.unit;
    const max = Math.max(...values);

    // g and ml switch to kg and l from 1000 upwards, both ends of a range together (as on the page)
    if (unitName && unitName in BASE_TO_LARGE && max >= 1000) {
      values = values.map((v) => v / 1000);
      unitName = BASE_TO_LARGE[unitName];
    }

    parts.push(values.map(plainNumber).join('-'));

    const unitDef = unitName ? findUnit(units, unitName) : undefined;
    if (unitDef?.compound) {
      // "3 Knoblauchzehen": name plus the lower-cased unit as one word
      parts.push(ingredient.name + unitLabel(unitDef, Math.max(...values)).toLowerCase());
    } else {
      if (unitName) parts.push(unitDef ? unitLabel(unitDef, Math.max(...values)) : unitName);
      // Counted items keep the singular name; Bring! knows "Kopfsalat", not "Kopfsalate"
      parts.push(ingredient.name);
    }
  }

  let line = parts.join(' ');
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
  data.recipeIngredient = flattenIngredients(recipe.ingredients).map((ingredient) => ingredientLine(ingredient, units));
  data.recipeInstructions = flattenSteps(recipe.steps).map((step) => ({
    '@type': 'HowToStep',
    text: renderStep(step, byId, units),
  }));

  return data;
}
