import type { UnitDef } from './types.ts';

/** Finds a unit by its singular or plural form. */
export function findUnit(units: UnitDef[], name: string): UnitDef | undefined {
  return units.find((u) => u.unit === name || u.plural === name);
}

/** Singular or plural label for a displayed amount (SPEC.md §5.2). */
export function unitLabel(unit: UnitDef, displayedAmount: number): string {
  return displayedAmount > 1 ? unit.plural : unit.unit;
}

/** Units that are stored in a smaller base unit internally (kg → g, l → ml). */
export const LARGE_TO_BASE: Record<string, { base: string; factor: number }> = {
  kg: { base: 'g', factor: 1000 },
  l: { base: 'ml', factor: 1000 },
};

/** The reverse: base units that switch to a larger unit from 1000 upwards. */
export const BASE_TO_LARGE: Record<string, string> = {
  g: 'kg',
  ml: 'l',
};
