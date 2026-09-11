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
