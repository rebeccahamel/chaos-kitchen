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

const photosByName = byFileName(photoFiles, true);
const avatarsByFile = byFileName(avatarFiles, false);

/** "<slug>" or "<slug>_<n>": the recipe slug and the picture number (0 without suffix). */
export function splitPhotoName(name: string): { slug: string; index: number } {
  const match = /^(.*)_(\d+)$/.exec(name);
  return match ? { slug: match[1], index: Number(match[2]) } : { slug: name, index: 0 };
}

const photosBySlug = new Map<string, ImageMetadata[]>();
for (const [name, image] of [...photosByName.entries()].sort(
  (a, b) => splitPhotoName(a[0]).index - splitPhotoName(b[0]).index,
)) {
  const { slug } = splitPhotoName(name);
  photosBySlug.set(slug, [...(photosBySlug.get(slug) ?? []), image]);
}

/** All pictures of a recipe in order: "<slug>.jpg" first, then "<slug>_1.jpg", "<slug>_2.jpg", … */
export function recipePhotos(slug: string): ImageMetadata[] {
  return photosBySlug.get(slug) ?? [];
}

/** The first picture of a recipe (cards, link previews), or undefined when there is none yet. */
export function recipePhoto(slug: string): ImageMetadata | undefined {
  return recipePhotos(slug)[0];
}

/** The avatar image for a file name from people.yaml, or undefined when the file is missing. */
export function avatarImage(fileName: string | undefined): ImageMetadata | undefined {
  return fileName ? avatarsByFile.get(fileName) : undefined;
}
