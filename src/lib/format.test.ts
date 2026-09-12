// Ingredient display rules from SPEC.md §4.6, §5.1 and §5.2.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { describeIngredient, formatIngredient, formatIngredientName } from './format.ts';
import { lists } from './test-support.ts';
import type { Ingredient } from './types.ts';

const { units } = lists;

// Ingredients from _vorlage.yaml and fischcurry-mit-reis.yaml
const zwiebel: Ingredient = { id: 'zwiebel', amount: 2, name: 'Zwiebel', plural: 'Zwiebeln' };
const knoblauch: Ingredient = { id: 'knoblauch', amount: [1, 2], unit: 'Zehe', name: 'Knoblauch' };
const butter: Ingredient = { id: 'butter', amount: 40, unit: 'g', name: 'Butter' };
const ei: Ingredient = { id: 'ei', amount: 2, name: 'Ei', plural: 'Eier', whole: true };
const petersilie: Ingredient = { id: 'petersilie', amount: 2, unit: 'EL', name: 'Petersilie', note: 'gehackt', optional: true };
const salz: Ingredient = { id: 'salz', name: 'Salz', note: 'nach Geschmack' };
const kokosmilch: Ingredient = { id: 'kokosmilch', amount: 1, unit: 'Dose', name: 'Kokosmilch' };
const bruehe: Ingredient = { id: 'gemuesebruehe', amount: 500, unit: 'ml', name: 'Gemüsebrühe' };
const currypaste: Ingredient = { id: 'currypaste', amount: [2, 3], unit: 'EL', name: 'rote Currypaste' };
const fisch: Ingredient = { id: 'fisch', amount: [400, 600], unit: 'g', name: 'Fisch' };

test('amount, unit and name', () => {
  assert.equal(formatIngredient(butter, units), '40 g Butter');
  assert.equal(formatIngredient(butter, units, { factor: 1.5 }), '60 g Butter');
});

test('counted items switch to the plural above 1', () => {
  assert.equal(formatIngredient(zwiebel, units), '2 Zwiebeln');
  assert.equal(formatIngredient(zwiebel, units, { factor: 0.5 }), '1 Zwiebel');
  assert.equal(formatIngredient(zwiebel, units, { factor: 0.25 }), '½ Zwiebel');
  assert.equal(formatIngredient(zwiebel, units, { factor: 1 / 16 }), '⅛ Zwiebel');
  assert.equal(formatIngredient(zwiebel, units, { factor: 0.75 }), '1½ Zwiebeln');
});

test('the unit takes the plural, the name stays unchanged', () => {
  assert.equal(formatIngredient(kokosmilch, units), '1 Dose Kokosmilch');
  assert.equal(formatIngredient(kokosmilch, units, { factor: 2 }), '2 Dosen Kokosmilch');
  assert.equal(formatIngredient(kokosmilch, units, { factor: 0.5 }), '½ Dose Kokosmilch');
});

test('ranges: both ends scaled and rounded, en dash without spaces', () => {
  assert.equal(formatIngredient(currypaste, units), '2–3 EL rote Currypaste');
  assert.equal(formatIngredient(currypaste, units, { factor: 2 }), '4–6 EL rote Currypaste');
  assert.equal(formatIngredient(fisch, units, { factor: 0.5 }), '200–300 g Fisch');
  assert.equal(formatIngredient(knoblauch, units, { factor: 0.5 }), '½–1 Zehe Knoblauch');
});

test('a range collapses when both ends round to the same value', () => {
  const eier: Ingredient = { id: 'eier', amount: [1, 2], name: 'Ei', plural: 'Eier', whole: true };
  assert.equal(formatIngredient(eier, units, { factor: 0.5 }), '1 Ei');
});

test('fraction of the listed amount ({id:2/3})', () => {
  assert.equal(formatIngredient(butter, units, { fraction: 1 / 2 }), '20 g Butter');
  const zucker: Ingredient = { id: 'zucker', amount: 150, unit: 'g', name: 'Zucker' };
  assert.equal(formatIngredient(zucker, units, { fraction: 2 / 3 }), '100 g Zucker');
  assert.equal(formatIngredient(zucker, units, { fraction: 2 / 3, factor: 2 }), '200 g Zucker');
});

test('ingredients without amount show the name only and are never scaled', () => {
  assert.equal(formatIngredient(salz, units), 'Salz');
  assert.equal(formatIngredient(salz, units, { factor: 3 }), 'Salz');
  assert.deepEqual(describeIngredient(salz, units), { amount: null, unit: null, name: 'Salz', optional: false });
});

test('optional ingredients get the marker, the note is never part of the text', () => {
  assert.equal(formatIngredient(petersilie, units), '2 EL Petersilie (optional)');
  assert.equal(formatIngredient(petersilie, units, { factor: 0.5 }), '1 EL Petersilie (optional)');
});

test('whole: eggs are always whole numbers', () => {
  assert.equal(formatIngredient(ei, units, { factor: 0.75 }), '2 Eier');
  assert.equal(formatIngredient(ei, units, { factor: 0.5 }), '1 Ei');
  assert.equal(formatIngredient(ei, units, { factor: 0.25 }), '1 Ei');
  assert.equal(formatIngredient(ei, units, { factor: 2.5 }), '5 Eier');
});

test('from 1000 g / ml the amount switches to kg / l', () => {
  const mehl: Ingredient = { id: 'mehl', amount: 500, unit: 'g', name: 'Mehl' };
  assert.equal(formatIngredient(mehl, units, { factor: 2 }), '1 kg Mehl');
  assert.equal(formatIngredient(mehl, units, { factor: 2.5 }), '1,25 kg Mehl');
  assert.equal(formatIngredient(bruehe, units, { factor: 3 }), '1,5 l Gemüsebrühe');
  // a range is shown in one unit
  assert.equal(formatIngredient(fisch, units, { factor: 2 }), '0,8–1,2 kg Fisch');
});

test('spoon amounts use quarters', () => {
  const oel: Ingredient = { id: 'oel', amount: 2, unit: 'EL', name: 'Öl' };
  assert.equal(formatIngredient(oel, units, { factor: 0.75 }), '1½ EL Öl');
  assert.equal(formatIngredient(oel, units, { factor: 1 / 8 }), '¼ EL Öl');
});

test('name only ({id:name}) follows singular / plural of the current amount', () => {
  const zitrone: Ingredient = { id: 'zitrone', amount: 1, name: 'Bio-Zitrone', plural: 'Bio-Zitronen' };
  assert.equal(formatIngredientName(zitrone, units), 'Bio-Zitrone');
  assert.equal(formatIngredientName(zitrone, units, { factor: 2 }), 'Bio-Zitronen');
  // with a unit the name is used unchanged
  assert.equal(formatIngredientName(kokosmilch, units, { factor: 2 }), 'Kokosmilch');
  // without amount: the name
  assert.equal(formatIngredientName(salz, units, { factor: 2 }), 'Salz');
});
