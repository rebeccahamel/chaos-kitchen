// Consolidated shopping list for several recipes (MEAL_PLANNER.md §14, SPEC.md §6.9) and the
// ingredient line Bring! reads (SPEC.md §6.4). Pure functions, also used in the browser: the
// homepage merges the ticked recipes on the fly, the hidden week pages carry the same list as
// JSON-LD for Bring!, and a recipe page merges its own duplicate lines the same way.

import type { Amount, BringRule, Ingredient, UnitDef } from './types.ts';
import { BASE_TO_LARGE, findUnit, unitLabel } from './units.ts';
import { normalizeForSearch } from './search.ts';

/** Ingredients of one recipe, already flattened (see flattenIngredients in recipe.ts). */
export type IngredientList = Ingredient[];

/** "zwiebel|" for counted items, "knoblauch|Zehe" with the unit's singular; singular and plural merge. */
function mergeKey(ingredient: Ingredient, units: UnitDef[]): string {
  const unit = ingredient.unit ? (findUnit(units, ingredient.unit)?.unit ?? ingredient.unit) : '';
  return `${normalizeForSearch(ingredient.name)}|${unit}`;
}

function asRange(amount: Amount): [number, number] {
  return Array.isArray(amount) ? amount : [amount, amount];
}

/** Adds two amounts; a range plus a number widens the range: [1, 2] + 1 = [2, 3]. */
export function addAmounts(a: Amount | undefined, b: Amount | undefined): Amount | undefined {
  if (a === undefined) return b;
  if (b === undefined) return a;
  const [aMin, aMax] = asRange(a);
  const [bMin, bMax] = asRange(b);
  const min = Number((aMin + bMin).toFixed(4));
  const max = Number((aMax + bMax).toFixed(4));
  return min === max ? min : [min, max];
}

/**
 * Merges the ingredients of several recipes into one list, at each recipe's base yield.
 * Same name (case and umlauts ignored) and same unit add up; an item is optional only when it
 * is optional everywhere; the order is the order of first appearance. Ids are made from the
 * merge key and unique in the result. Notes are dropped because they belong to one recipe;
 * with keepNotes (used for the duplicates within a single recipe) a note survives when every
 * merged line carries the same one.
 */
export function consolidateIngredients(lists: IngredientList[], units: UnitDef[], options: { keepNotes?: boolean } = {}): Ingredient[] {
  const merged = new Map<string, Ingredient>();
  const notes = new Map<string, Set<string | undefined>>();
  for (const list of lists) {
    for (const ingredient of list) {
      const key = mergeKey(ingredient, units);
      if (!notes.has(key)) notes.set(key, new Set());
      notes.get(key)!.add(ingredient.note);
      const existing = merged.get(key);
      if (!existing) {
        const { note: _note, ...rest } = ingredient;
        merged.set(key, { ...rest, id: key.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'zutat' });
        continue;
      }
      merged.set(key, {
        ...existing,
        amount: addAmounts(existing.amount, ingredient.amount),
        plural: existing.plural ?? ingredient.plural,
        optional: existing.optional === true && ingredient.optional === true ? true : undefined,
        whole: existing.whole || ingredient.whole ? true : undefined,
      });
    }
  }
  if (options.keepNotes) {
    for (const [key, ingredient] of merged) {
      const seen = notes.get(key) ?? new Set();
      const [only] = seen;
      if (seen.size === 1 && only !== undefined) ingredient.note = only;
    }
  }
  return [...merged.values()];
}

/**
 * Names that appear with different units across the recipes and therefore stay separate lines
 * ("Minze" once without unit, once in Bund). Each entry: name plus the units, for a build warning.
 */
export function unmergedNames(lists: IngredientList[], units: UnitDef[]): { name: string; units: string[] }[] {
  const byName = new Map<string, { name: string; units: Set<string> }>();
  for (const list of lists) {
    for (const ingredient of list) {
      const [name, unit] = mergeKey(ingredient, units).split('|');
      const entry = byName.get(name) ?? { name: ingredient.name, units: new Set<string>() };
      entry.units.add(unit === '' ? 'ohne Einheit' : unit);
      byName.set(name, entry);
    }
  }
  return [...byName.values()].filter((entry) => entry.units.size > 1).map((entry) => ({ name: entry.name, units: [...entry.units] }));
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

/** The merged list as plain schema.org lines ("Basmatireis, 300 g"), the format Bring! reads. */
export function shoppingLines(lists: IngredientList[], units: UnitDef[], rules: BringRule[] = []): string[] {
  return consolidateIngredients(lists, units).map((ingredient) => ingredientLine(ingredient, units, rules));
}

/**
 * A selection of the plan's recipes as a string of 0 and 1 in plan order, e.g. "1011":
 * the first, third and fourth recipe are ticked. This is the address of the hidden week page.
 */
export function selectionMask(selected: boolean[]): string {
  return selected.map((on) => (on ? '1' : '0')).join('');
}

/** Every non-empty selection of n recipes, "0…01" to "1…1": the hidden pages the build creates. */
export function allSelectionMasks(count: number): string[] {
  const masks: string[] = [];
  for (let bits = 1; bits < 2 ** count; bits += 1) masks.push(bits.toString(2).padStart(count, '0'));
  return masks;
}

/** The recipes a mask ticks, in plan order. Undefined when the mask does not fit the plan. */
export function selectedByMask<T>(mask: string, recipes: T[]): T[] | undefined {
  if (mask.length !== recipes.length || !/^[01]+$/.test(mask) || !mask.includes('1')) return undefined;
  return recipes.filter((_, index) => mask[index] === '1');
}

export interface WeekListInfo {
  /** "Wochenplan 28. September – 2. Oktober" */
  name: string;
  description: string;
  /** absolute URL of the hidden page itself */
  url: string;
  /** absolute URL of a picture, when the week has one */
  image?: string;
}

/**
 * schema.org Recipe data for a hidden week page: one "recipe" whose ingredients are the merged
 * list of the selected recipes. Bring! imports it as one shopping list (SPEC.md §6.8).
 */
export function weekListJsonLd(info: WeekListInfo, lists: IngredientList[], units: UnitDef[], rules: BringRule[] = []): Record<string, unknown> {
  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Recipe',
    name: info.name,
    description: info.description,
    url: info.url,
  };
  if (info.image) data.image = info.image;
  data.recipeIngredient = shoppingLines(lists, units, rules);
  return data;
}
