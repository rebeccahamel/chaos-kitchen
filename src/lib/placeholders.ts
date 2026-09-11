// Step placeholders: {id}, {id:2/3}, {id:0.5}, {id:name} (SPEC.md §4.6).
// parseStep / validateStep run at build time, renderStep also in the browser.

import type { Ingredient, UnitDef } from './types.ts';
import { formatIngredient, formatIngredientName } from './format.ts';

export interface Placeholder {
  id: string;
  mode: 'full' | 'name';
  /** only for mode 'full': part of the amount, e.g. 2/3 */
  fraction?: number;
}

export type StepPart =
  | { kind: 'text'; text: string }
  | { kind: 'placeholder'; placeholder: Placeholder; raw: string };

export type RenderedPart =
  | { kind: 'text'; text: string }
  | { kind: 'ingredient'; id: string; text: string };

const ID_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** Splits a step into text and placeholders. Throws on invalid syntax. */
export function parseStep(step: string): StepPart[] {
  const parts: StepPart[] = [];
  let text = '';
  let i = 0;

  const flushText = () => {
    if (text) parts.push({ kind: 'text', text });
    text = '';
  };

  while (i < step.length) {
    const char = step[i];
    if (char === '}') {
      throw new Error(`einzelne schließende Klammer „}“ an Position ${i + 1}`);
    }
    if (char !== '{') {
      text += char;
      i += 1;
      continue;
    }
    const end = step.indexOf('}', i);
    const nextOpen = step.indexOf('{', i + 1);
    if (end === -1 || (nextOpen !== -1 && nextOpen < end)) {
      throw new Error(`Platzhalter an Position ${i + 1} wird nicht mit „}“ geschlossen`);
    }
    const raw = step.slice(i, end + 1);
    flushText();
    parts.push({ kind: 'placeholder', placeholder: parsePlaceholder(step.slice(i + 1, end), raw), raw });
    i = end + 1;
  }
  flushText();
  return parts;
}

function parsePlaceholder(body: string, raw: string): Placeholder {
  const [id, argument, ...rest] = body.split(':');
  if (rest.length > 0) {
    throw new Error(`${raw}: nur ein Doppelpunkt erlaubt, z. B. {mehl:2/3}`);
  }
  if (!ID_PATTERN.test(id)) {
    throw new Error(`${raw}: ungültige Zutaten-Id (erlaubt sind a-z, 0-9 und „-“)`);
  }
  if (argument === undefined) return { id, mode: 'full' };
  if (argument === 'name') return { id, mode: 'name' };
  const fraction = parseFraction(argument);
  if (fraction === undefined) {
    throw new Error(`${raw}: ungültiger Anteil „${argument}“ (erlaubt sind name, ein Bruch wie 2/3 oder eine Zahl wie 0.5)`);
  }
  return { id, mode: 'full', fraction };
}

function parseFraction(text: string): number | undefined {
  const ratio = /^(\d+)\/(\d+)$/.exec(text);
  if (ratio) {
    const value = Number(ratio[1]) / Number(ratio[2]);
    return Number.isFinite(value) && value > 0 ? value : undefined;
  }
  if (/^\d+(\.\d+)?$/.test(text)) {
    const value = Number(text);
    return value > 0 ? value : undefined;
  }
  return undefined;
}

/** All ingredient ids referenced by a step. Returns [] for invalid syntax. */
export function placeholderIds(step: string): string[] {
  try {
    return parseStep(step)
      .filter((p) => p.kind === 'placeholder')
      .map((p) => p.placeholder.id);
  } catch {
    return [];
  }
}

/** Problems with the placeholders of one step, as German messages. Empty when the step is fine. */
export function validateStep(step: string, ingredients: Map<string, Ingredient>): string[] {
  let parts: StepPart[];
  try {
    parts = parseStep(step);
  } catch (error) {
    return [(error as Error).message];
  }
  const errors: string[] = [];
  for (const part of parts) {
    if (part.kind !== 'placeholder') continue;
    const { id, fraction } = part.placeholder;
    const ingredient = ingredients.get(id);
    if (!ingredient) {
      errors.push(`${part.raw}: unbekannte Zutaten-Id „${id}“`);
    } else if (fraction !== undefined && ingredient.amount === undefined) {
      errors.push(`${part.raw}: die Zutat „${id}“ hat keine Menge, ein Anteil ist hier nicht möglich`);
    }
  }
  return errors;
}

/** Renders a step as parts, so the UI can mark ingredient mentions. Expects a validated step. */
export function renderStepParts(step: string, ingredients: Map<string, Ingredient>, units: UnitDef[], factor = 1): RenderedPart[] {
  return parseStep(step).map((part) => {
    if (part.kind === 'text') return part;
    const { id, mode, fraction } = part.placeholder;
    const ingredient = ingredients.get(id);
    if (!ingredient) throw new Error(`${part.raw}: unbekannte Zutaten-Id „${id}“`);
    const text =
      mode === 'name'
        ? formatIngredientName(ingredient, units, { factor })
        : formatIngredient(ingredient, units, { factor, fraction });
    return { kind: 'ingredient', id, text };
  });
}

/** Renders a step as plain text with all placeholders replaced. */
export function renderStep(step: string, ingredients: Map<string, Ingredient>, units: UnitDef[], factor = 1): string {
  return renderStepParts(step, ingredients, units, factor)
    .map((p) => p.text)
    .join('');
}
