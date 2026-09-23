// Shared data types for recipes and the central lists (SPEC.md §4).

export type UnitCategory = 'weight' | 'volume' | 'spoon' | 'count';

export interface UnitDef {
  unit: string; // singular, as written in recipes
  plural: string;
  category: UnitCategory;
  /** shopping list line as one word, "3 Knoblauchzehen" instead of "3 Zehen Knoblauch" (SPEC.md §6.4) */
  compound?: boolean;
}

export interface Person {
  id: string;
  name: string;
  avatar?: string;
  color: string;
}

export interface Tag {
  id: string;
  label: string;
}

export interface TagCategory {
  category: string;
  tags: Tag[];
}

export interface Lists {
  units: UnitDef[];
  people: Person[];
  tags: TagCategory[];
}

/** A single number or a range [min, max]. */
export type Amount = number | [number, number];

export interface Ingredient {
  id: string;
  name: string;
  plural?: string;
  amount?: Amount;
  unit?: string;
  note?: string;
  optional?: boolean;
  whole?: boolean;
}

/** Ingredients are always handled as groups; a flat list becomes one group without a heading. */
export interface IngredientGroup {
  group?: string;
  items: Ingredient[];
}

export interface StepGroup {
  group?: string;
  items: string[];
}

/** One meal in the weekly plan (MEAL_PLANNER.md §14): a recipe, leftovers of an earlier day, or free text. */
export type PlanEntry = { recipe: string } | { leftovers: Date } | { text: string };

export interface PlanDay {
  date: Date;
  lunch?: PlanEntry;
  dinner?: PlanEntry;
}

export interface Plan {
  note?: string;
  days: PlanDay[];
}
