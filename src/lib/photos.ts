// Finds recipe photos and avatar files by name (SPEC.md §4.1, §6.5).
// Astro only: import.meta.glob is resolved by the bundler.

import type { ImageMetadata } from 'astro';

const photoFiles = import.meta.glob<{ default: ImageMetadata }>('../assets/recipes/*.{jpg,jpeg,png,webp}', {
  eager: true,
});
const avatarFiles = import.meta.glob<{ default: ImageMetadata }>('../assets/avatars/*.{png,webp,svg}', {
  eager: true,
});

function byFileName(files: Record<string, { default: ImageMetadata }>, stripExtension: boolean): Map<string, ImageMetadata> {
  const map = new Map<string, ImageMetadata>();
  for (const [path, module] of Object.entries(files)) {
    const fileName = path.split('/').pop() ?? path;
    map.set(stripExtension ? fileName.replace(/\.[^.]+$/, '') : fileName, module.default);
  }
  return map;
}

const photosBySlug = byFileName(photoFiles, true);
const avatarsByFile = byFileName(avatarFiles, false);

/** The photo for a recipe slug, or undefined when there is none yet. */
export function recipePhoto(slug: string): ImageMetadata | undefined {
  return photosBySlug.get(slug);
}

/** The avatar image for a file name from people.yaml, or undefined when the file is missing. */
export function avatarImage(fileName: string | undefined): ImageMetadata | undefined {
  return fileName ? avatarsByFile.get(fileName) : undefined;
}
