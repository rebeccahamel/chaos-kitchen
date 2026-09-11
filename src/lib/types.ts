// Shared data types for recipes and the central lists (SPEC.md §4).

export type UnitCategory = 'weight' | 'volume' | 'spoon' | 'count';

export interface UnitDef {
  unit: string; // singular, as written in recipes
  plural: string;
  category: UnitCategory;
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
