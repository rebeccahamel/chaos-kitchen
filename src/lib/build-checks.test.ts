// File-level checks from SPEC.md §7: slugs, photos, avatars.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkRecipeFileNames, missingAvatars, missingPhotos, runDataChecks } from './build-checks.ts';

test('recipe file names must be lowercase kebab-case .yaml; "_" files are skipped', () => {
  const { slugs, errors } = checkRecipeFileNames([
    '_vorlage.yaml',
    'fischcurry-mit-reis.yaml',
    'Omas Kuchen.yaml',
    'kürbissuppe.yaml',
    'kuchen.yml',
    'notizen.txt',
  ]);
  assert.deepEqual(slugs, ['fischcurry-mit-reis']);
  assert.equal(errors.length, 4);
  assert.match(errors[0], /^Omas Kuchen\.yaml: Dateiname/);
  assert.match(errors[1], /^kürbissuppe\.yaml: Dateiname/);
  assert.match(errors[2], /^kuchen\.yml: .*\.yaml/);
  assert.match(errors[3], /^notizen\.txt: .*\.yaml/);
});

test('two files with the same slug are an error', () => {
  const { slugs, errors } = checkRecipeFileNames(['a.yaml', 'a.yaml']);
  assert.deepEqual(slugs, ['a']);
  assert.deepEqual(errors, ['a.yaml: es gibt schon ein Rezept mit dem Namen „a“']);
});

test('recipes without a photo produce a warning', () => {
  const warnings = missingPhotos(['a', 'b', 'c', 'd'], ['a.jpg', 'c.webp', 'x.png', 'd_1.jpg', 'd_2.jpg']);
  assert.deepEqual(warnings, ['Rezept „b“ hat noch kein Foto (src/assets/recipes/b.jpg)']);
});

test('people with a missing avatar file produce a warning', () => {
  const people = [
    { id: 'mama', name: 'Mama', avatar: 'mama.webp', color: '#000000' },
    { id: 'oma', name: 'Oma', color: '#000000' },
    { id: 'opa', name: 'Opa', avatar: 'opa.png', color: '#000000' },
  ];
  assert.deepEqual(missingAvatars(people, ['mama.webp']), ['Person „opa“: Avatar-Datei opa.png fehlt in src/assets/avatars/']);
});

test('the real project has no file-level errors', () => {
  const { errors } = runDataChecks(new URL('../../', import.meta.url));
  assert.deepEqual(errors, []);
});
