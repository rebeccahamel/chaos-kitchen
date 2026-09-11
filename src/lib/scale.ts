// Scaling, rounding and number formatting (SPEC.md §5.1).
// Pure functions, also used in the browser when the yield changes.

import type { UnitCategory } from './types.ts';

/** Which rounding rule applies: the unit category, or 'none' for counted items without a unit. */
export type RoundingRule = UnitCategory | 'none';

export interface RoundedAmount {
  value: number;
  /** true when the amount should be shown in kg / l instead of g / ml */
  large: boolean;
}

export interface RoundingOptions {
  /** Always whole numbers, halves round up (eggs). */
  whole?: boolean;
  /** The unit can switch to kg / l from 1000 upwards (only g and ml). */
  convertible?: boolean;
}

export function scaleFactor(chosenYield: number, baseYield: number): number {
  return chosenYield / baseYield;
}

/** Rounds to the nearest multiple of `step` and removes floating-point noise. */
export function roundToStep(value: number, step: number): number {
  return Number((Math.round(value / step) * step).toFixed(4));
}

export function roundAmount(value: number, rule: RoundingRule, options: RoundingOptions = {}): RoundedAmount {
  if (options.whole) {
    return { value: Math.max(1, Math.round(value + 1e-9)), large: false };
  }

  switch (rule) {
    case 'weight':
    case 'volume': {
      if (value >= 1000 && options.convertible) {
        return { value: roundToStep(value / 1000, 0.05), large: true };
      }
      let rounded: number;
      if (value < 10) rounded = Math.max(1, Math.round(value));
      else if (value < 100) rounded = roundToStep(value, 5);
      else rounded = roundToStep(value, 10);
      // e.g. 997 g rounds up to 1000 g, which is shown as 1 kg
      if (rounded >= 1000 && options.convertible) {
        return { value: roundToStep(rounded / 1000, 0.05), large: true };
      }
      return { value: rounded, large: false };
    }
    case 'spoon':
      return { value: Math.max(0.25, roundToStep(value, 0.25)), large: false };
    case 'count':
    case 'none':
      return { value: Math.max(0.5, roundToStep(value, 0.5)), large: false };
  }
}

/** Number style: fractions (¼ ½ ¾) for spoons and counted items, decimal comma for weights and volumes. */
export type NumberStyle = 'fraction' | 'decimal';

export function numberStyleFor(rule: RoundingRule): NumberStyle {
  return rule === 'weight' || rule === 'volume' ? 'decimal' : 'fraction';
}

const FRACTION_GLYPHS: Record<string, string> = { '0.25': '¼', '0.5': '½', '0.75': '¾' };

/** Formats a number for display: "1½", "¾", "1,25", "270". */
export function formatNumber(value: number, style: NumberStyle): string {
  if (style === 'fraction') {
    const whole = Math.floor(value);
    const rest = Number((value - whole).toFixed(2));
    if (rest === 0) return String(whole);
    const glyph = FRACTION_GLYPHS[String(rest)];
    if (glyph) return whole === 0 ? glyph : `${whole}${glyph}`;
  }
  return formatDecimal(value);
}

/** Decimal comma, at most two decimals, trailing zeros dropped: "1,25", "2". */
export function formatDecimal(value: number): string {
  return String(Number(value.toFixed(2))).replace('.', ',');
}

/** Ranges use an en dash without spaces: "4–6". */
export const RANGE_DASH = '–';
