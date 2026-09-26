// Reads and validates the central lists in src/data/ (SPEC.md §4.7).
// Build time only: uses the file system.

import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import yaml from 'js-yaml';
import { z } from 'astro/zod';
import type { Lists } from './types.ts';

/** Ids and slugs: lowercase kebab-case, ASCII only. */
export const ID_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;
export const idSchema = z.string().regex(ID_PATTERN, 'nur Kleinbuchstaben a-z, Ziffern und „-“ erlaubt');

const text = z.string().min(1, 'darf nicht leer sein');

const unitSchema = z.strictObject({
  unit: text,
  plural: text,
  category: z.enum(['weight', 'volume', 'spoon', 'count']),
  // For the Bring! import (SPEC.md §6.4): glue the unit onto the name ("3 Knoblauchzehen") or
  // move amount and unit into the specification ("Porree, 2 Stangen")
  bring: z.enum(['compound', 'note'], { error: 'bring ist "compound" oder "note"' }).optional(),
});

export const unitsSchema = z.array(unitSchema).superRefine((units, ctx) => {
  const seen = new Map<string, number>();
  units.forEach((unit, index) => {
    for (const name of new Set([unit.unit, unit.plural])) {
      const first = seen.get(name);
      if (first !== undefined && first !== index) {
        ctx.addIssue({ code: 'custom', path: [index], message: `Einheit „${name}“ kommt mehrfach vor` });
      }
      seen.set(name, index);
    }
  });
});

const personSchema = z.strictObject({
  id: idSchema,
  name: text,
  avatar: text.optional(),
  color: z.string().regex(/^#[0-9a-f]{6}$/i, 'Farbe als Hex-Code, z. B. "#8a5a44"'),
});

export const peopleSchema = z.array(personSchema).superRefine((people, ctx) => {
  const seen = new Set<string>();
  people.forEach((person, index) => {
    if (seen.has(person.id)) ctx.addIssue({ code: 'custom', path: [index, 'id'], message: `Id „${person.id}“ kommt mehrfach vor` });
    seen.add(person.id);
  });
});

const tagSchema = z.strictObject({ id: idSchema, label: text });

export const tagCategoriesSchema = z
  .array(z.strictObject({ category: text, tags: z.array(tagSchema) }))
  .superRefine((categories, ctx) => {
    const seen = new Set<string>();
    categories.forEach((category, ci) => {
      category.tags.forEach((tag, ti) => {
        if (seen.has(tag.id)) ctx.addIssue({ code: 'custom', path: [ci, 'tags', ti, 'id'], message: `Tag-Id „${tag.id}“ kommt mehrfach vor` });
        seen.add(tag.id);
      });
    });
  });

const bringRuleSchema = z
  .strictObject({ name: text, singular: z.boolean().optional(), as: text.optional() })
  .refine((rule) => rule.singular !== undefined || rule.as !== undefined, 'eine Regel braucht singular: true oder as: <Text>');

export const bringRulesSchema = z.array(bringRuleSchema).superRefine((rules, ctx) => {
  const seen = new Set<string>();
  rules.forEach((rule, index) => {
    const key = rule.name.toLowerCase();
    if (seen.has(key)) ctx.addIssue({ code: 'custom', path: [index, 'name'], message: `„${rule.name}“ kommt mehrfach vor` });
    seen.add(key);
  });
});

/** Reads one YAML file and validates it. Throws with a message that names the file and the field. */
export function loadYamlFile<T>(file: string, schema: z.ZodType<T>): T {
  let raw: unknown;
  try {
    raw = yaml.load(readFileSync(file, 'utf8'));
  } catch (error) {
    throw new Error(`${file}: ${(error as Error).message}`);
  }
  const result = schema.safeParse(raw);
  if (!result.success) {
    const lines = result.error.issues.map((issue) => `  ${issue.path.join('.') || '(Datei)'}: ${issue.message}`);
    throw new Error(`Fehler in ${file}:\n${lines.join('\n')}`);
  }
  return result.data;
}

/**
 * src/data/ relative to the project root (the working directory of `astro build`
 * and `npm test`). Not relative to this file: Astro bundles it elsewhere during the build.
 */
export const DEFAULT_DATA_DIR = resolve('src/data');

export function loadLists(dataDir: string = DEFAULT_DATA_DIR): Lists {
  const bringFile = join(dataDir, 'bring.yaml');
  return {
    units: loadYamlFile(join(dataDir, 'units.yaml'), unitsSchema),
    people: loadYamlFile(join(dataDir, 'people.yaml'), peopleSchema),
    tags: loadYamlFile(join(dataDir, 'tags.yaml'), tagCategoriesSchema),
    // the Bring! rules are optional: no file means no rules
    bring: existsSync(bringFile) ? (loadYamlFile(bringFile, bringRulesSchema) ?? []) : [],
  };
}
