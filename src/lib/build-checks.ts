// File-level checks that a schema cannot do (SPEC.md §7): recipe file names,
// duplicate slugs, missing photos, missing avatar files, and the weekly plan (§6.9).
// Runs as a small Astro integration at the start of `astro dev` and `astro build`.

import { existsSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { AstroIntegration } from 'astro';
import { ID_PATTERN, loadLists } from './lists.ts';
import { forgottenTrials, loadPlan, readTrialSlugs, unmergedWarnings } from './plan.ts';
import type { Person } from './types.ts';

export const PHOTO_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'];

export interface CheckResult {
  errors: string[];
  warnings: string[];
}

/** Checks the file names in src/content/recipes/. Files starting with "_" are skipped. */
export function checkRecipeFileNames(fileNames: string[]): { slugs: string[]; errors: string[] } {
  const slugs: string[] = [];
  const errors: string[] = [];
  for (const file of fileNames) {
    if (file.startsWith('_')) continue;
    const dot = file.lastIndexOf('.');
    const base = dot === -1 ? file : file.slice(0, dot);
    const extension = dot === -1 ? '' : file.slice(dot + 1);
    if (extension !== 'yaml') {
      errors.push(`${file}: Rezeptdateien müssen auf .yaml enden`);
    } else if (!ID_PATTERN.test(base)) {
      errors.push(`${file}: Dateiname nur aus Kleinbuchstaben a-z, Ziffern und „-“ (ä→ae, ö→oe, ü→ue, ß→ss)`);
    } else if (slugs.includes(base)) {
      errors.push(`${file}: es gibt schon ein Rezept mit dem Namen „${base}“`);
    } else {
      slugs.push(base);
    }
  }
  return { slugs, errors };
}

/** The recipe slug a picture file belongs to: "<slug>.jpg" or "<slug>_<n>.jpg" (SPEC.md §4.1). */
export function photoSlug(fileName: string): string | undefined {
  const match = /^(.+?)(?:_\d+)?\.([a-z0-9]+)$/i.exec(fileName);
  return match && PHOTO_EXTENSIONS.includes(match[2].toLowerCase()) ? match[1] : undefined;
}

/** One warning per recipe without a picture in src/assets/recipes/. */
export function missingPhotos(slugs: string[], photoFiles: string[]): string[] {
  const withPhoto = new Set(photoFiles.map(photoSlug));
  return slugs
    .filter((slug) => !withPhoto.has(slug))
    .map((slug) => `Rezept „${slug}“ hat noch kein Foto (src/assets/recipes/${slug}.jpg)`);
}

/** One warning per person whose avatar file is missing in src/assets/avatars/. */
export function missingAvatars(people: Person[], avatarFiles: string[]): string[] {
  const avatars = new Set(avatarFiles);
  return people
    .filter((person) => person.avatar !== undefined && !avatars.has(person.avatar))
    .map((person) => `Person „${person.id}“: Avatar-Datei ${person.avatar} fehlt in src/assets/avatars/`);
}

function listDir(dir: URL): string[] {
  return existsSync(dir) ? readdirSync(dir) : [];
}

/** Runs all file-level checks for a project root. */
export function runDataChecks(root: URL): CheckResult {
  const recipesDir = fileURLToPath(new URL('src/content/recipes/', root));
  const dataDir = fileURLToPath(new URL('src/data/', root));
  const { slugs, errors } = checkRecipeFileNames(listDir(new URL('src/content/recipes/', root)));
  const lists = loadLists(dataDir);
  const warnings = [
    ...missingPhotos(slugs, listDir(new URL('src/assets/recipes/', root))),
    ...missingAvatars(lists.people, listDir(new URL('src/assets/avatars/', root))),
  ];

  // The weekly plan: a wrong plan file stops the build like a wrong recipe file would.
  try {
    const plan = loadPlan(slugs, dataDir);
    warnings.push(...forgottenTrials(plan, readTrialSlugs(recipesDir)), ...unmergedWarnings(plan, recipesDir, lists));
  } catch (error) {
    errors.push((error as Error).message);
  }
  return { errors, warnings };
}

/** Astro integration: warnings go to the log, errors stop the build. */
export function dataChecks(): AstroIntegration {
  return {
    name: 'data-checks',
    hooks: {
      'astro:config:setup': ({ config, logger }) => {
        const { errors, warnings } = runDataChecks(config.root);
        for (const warning of warnings) logger.warn(warning);
        if (errors.length > 0) {
          throw new Error(`Rezeptdateien fehlerhaft:\n- ${errors.join('\n- ')}`);
        }
      },
    },
  };
}
