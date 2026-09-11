// Turns an ingredient plus scale factor into display text (SPEC.md §4.6, §5).
// Pure functions, also used in the browser when the yield changes.

import type { Ingredient, UnitDef } from './types.ts';
import { BASE_TO_LARGE, findUnit, unitLabel } from './units.ts';
import { formatNumber, numberStyleFor, roundAmount, roundToStep, RANGE_DASH, type RoundingRule } from './scale.ts';

export interface FormatOptions {
  /** chosen yield ÷ base yield, default 1 */
  factor?: number;
  /** part of the listed amount, e.g. 2/3 for {id:2/3} */
  fraction?: number;
}

export interface IngredientText {
  /** "250", "1½", "4–6" or null when the ingredient has no amount */
  amount: string | null;
  /** "g", "Dosen", "kg" or null when there is no unit or no amount */
  unit: string | null;
  /** singular or plural, matching the displayed amount */
  name: string;
  optional: boolean;
}

/** Builds the display parts for an ingredient at the given scale. */
export function describeIngredient(ingredient: Ingredient, units: UnitDef[], options: FormatOptions = {}): IngredientText {
  const optional = ingredient.optional === true;
  const unitDef = ingredient.unit ? findUnit(units, ingredient.unit) : undefined;

  if (ingredient.amount === undefined) {
    return { amount: null, unit: null, name: ingredient.name, optional };
  }

  const factor = (options.factor ?? 1) * (options.fraction ?? 1);
  const rule: RoundingRule = unitDef ? unitDef.category : 'none';
  const convertible = unitDef !== undefined && unitDef.unit in BASE_TO_LARGE;
  const scaled = (Array.isArray(ingredient.amount) ? ingredient.amount : [ingredient.amount]).map((v) => v * factor);

  let rounded = scaled.map((v) => roundAmount(v, rule, { whole: ingredient.whole, convertible }));
  const large = rounded.some((r) => r.large);
  if (large) {
    // both ends of a range in the same unit: "0,8–1,2 kg" rather than "800 g–1,2 kg"
    rounded = scaled.map((v) => ({ value: roundToStep(v / 1000, 0.05), large: true }));
  }

  let values = rounded.map((r) => r.value);
  if (values.length === 2 && values[0] === values[1]) values = [values[0]];
  const max = Math.max(...values);
  const style = numberStyleFor(rule);
  const amount = values.map((v) => formatNumber(v, style)).join(RANGE_DASH);

  let unit: string | null = null;
  if (unitDef) {
    if (large) {
      const largeName = BASE_TO_LARGE[unitDef.unit];
      const largeDef = findUnit(units, largeName);
      unit = largeDef ? unitLabel(largeDef, max) : largeName;
    } else {
      unit = unitLabel(unitDef, max);
    }
  } else if (ingredient.unit) {
    unit = ingredient.unit; // unknown unit: never reached after validation, but never crash
  }

  // With a unit the name stays unchanged; counted items switch to the plural above 1.
  const counted = !ingredient.unit;
  const name = counted && max > 1 ? (ingredient.plural ?? ingredient.name) : ingredient.name;

  return { amount, unit, name, optional };
}

/** "250 g Mehl", "1½ Zwiebeln", "50 g Rosinen (optional)", "Salz". */
export function formatIngredient(ingredient: Ingredient, units: UnitDef[], options: FormatOptions = {}): string {
  const parts = describeIngredient(ingredient, units, options);
  const text = [parts.amount, parts.unit, parts.name].filter((p) => p !== null).join(' ');
  return parts.optional ? `${text} (optional)` : text;
}

/** Name only, singular or plural matching the displayed amount ({id:name}). */
export function formatIngredientName(ingredient: Ingredient, units: UnitDef[], options: FormatOptions = {}): string {
  return describeIngredient(ingredient, units, options).name;
}
