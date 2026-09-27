// schema.org Recipe data for the <script type="application/ld+json"> block on a recipe page
// (SPEC.md §6.4, §6.8). Bring! reads it to import the ingredients into a shopping list; the
// ingredient line itself lives in shopping.ts next to the merge rules.
// Pure functions; the Recipe type import is type-only and disappears at runtime.

import type { Recipe } from './recipe-schema.ts';
import type { Lists } from './types.ts';
import { findUnit, unitLabel } from './units.ts';
import { flattenIngredients, flattenSteps, ingredientsById, totalTime } from './recipe.ts';
import { renderStep } from './placeholders.ts';
import { tagLabel } from './tags.ts';
import { consolidateIngredients, ingredientLine } from './shopping.ts';

export interface PageInfo {
  /** absolute URL of the recipe page */
  url: string;
  /** absolute URL of the preview picture */
  image: string;
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
  // The same ingredient in two groups (Wasser for the rice and for the sauce) is one line for Bring!
  data.recipeIngredient = consolidateIngredients([flattenIngredients(recipe.ingredients)], units, { keepNotes: true })
    .map((ingredient) => ingredientLine(ingredient, units, lists.bring));
  data.recipeInstructions = flattenSteps(recipe.steps).map((step) => ({
    '@type': 'HowToStep',
    text: renderStep(step, byId, units),
  }));

  return data;
}
