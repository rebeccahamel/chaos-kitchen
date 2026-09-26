// Shared data types for recipes and the central lists (SPEC.md §4).

export type UnitCategory = 'weight' | 'volume' | 'spoon' | 'count';

export interface UnitDef {
  unit: string; // singular, as written in recipes
  plural: string;
  category: UnitCategory;
  /**
   * Bring! line for units Bring! does not know (SPEC.md §6.4): "compound" glues the unit onto the
   * name ("3 Knoblauchzehen"), "note" puts amount and unit into the specification ("Porree, 2 Stangen").
   */
  bring?: 'compound' | 'note';
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

/** One learned rule for the Bring! shopping list line (src/data/bring.yaml, SPEC.md §6.4). */
export interface BringRule {
  /** ingredient name as written in recipes */
  name: string;
  /** always the singular name on the Bring! line */
  singular?: boolean;
  /** replace the name on the Bring! line with this text */
  as?: string;
}

export interface Lists {
  units: UnitDef[];
  people: Person[];
  tags: TagCategory[];
  bring: BringRule[];
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

/** One planned week: an optional sentence for the family and the days in order. */
export interface Week {
  note?: string;
  days: PlanDay[];
}

/** The plan file: this week and, once planned, the next one (SPEC.md §6.9). */
export interface Plan {
  weeks: Week[];
}
