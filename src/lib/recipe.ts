// Small helpers for working with a validated recipe. Pure, usable in the browser.

import type { Ingredient, IngredientGroup, StepGroup } from './types.ts';

export function flattenIngredients(groups: IngredientGroup[]): Ingredient[] {
  return groups.flatMap((g) => g.items);
}

export function ingredientsById(groups: IngredientGroup[]): Map<string, Ingredient> {
  return new Map(flattenIngredients(groups).map((i) => [i.id, i]));
}

export function flattenSteps(groups: StepGroup[]): string[] {
  return groups.flatMap((g) => g.items);
}

/** true when the recipe uses group headings (a flat list becomes one group without a heading). */
export function hasGroups(groups: { group?: string }[]): boolean {
  return groups.some((g) => g.group !== undefined);
}

export function totalTime(time: { prep: number; cook?: number; rest?: number }): number {
  return time.prep + (time.cook ?? 0) + (time.rest ?? 0);
}

/** "30 min", "1 h", "1 h 30 min" (SPEC.md §13.3) */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${rest} min`;
  if (rest === 0) return `${hours} h`;
  return `${hours} h ${rest} min`;
}
