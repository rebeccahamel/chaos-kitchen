// Merge rules for the week's shopping list (MEAL_PLANNER.md §14) and the selection masks
// that address the hidden week pages.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  addAmounts,
  allSelectionMasks,
  consolidateIngredients,
  selectedByMask,
  selectionMask,
  shoppingLines,
  weekListJsonLd,
} from './shopping.ts';
import { flattenIngredients } from './recipe.ts';
import { lists, loadRecipe } from './test-support.ts';
import type { Ingredient } from './types.ts';

const { units } = lists;

test('amounts add up; a range plus a number widens the range', () => {
  assert.equal(addAmounts(1, 2), 3);
  assert.deepEqual(addAmounts([1, 2], 1), [2, 3]);
  assert.deepEqual(addAmounts([1, 2], [1, 2]), [2, 4]);
  assert.equal(addAmounts(0.1, 0.2), 0.3);
  assert.equal(addAmounts(undefined, 2), 2);
  assert.equal(addAmounts(2, undefined), 2);
  assert.equal(addAmounts(undefined, undefined), undefined);
});

test('same name and unit merge, case and umlauts ignored, order of first appearance', () => {
  const a: Ingredient[] = [
    { id: 'zwiebel', amount: 1, name: 'Zwiebel', plural: 'Zwiebeln' },
    { id: 'mehl', amount: 200, unit: 'g', name: 'Mehl' },
  ];
  const b: Ingredient[] = [
    { id: 'kaese', amount: 100, unit: 'g', name: 'Käse' },
    { id: 'zwiebel', amount: 2, name: 'zwiebel' },
    { id: 'mehl', amount: 900, unit: 'g', name: 'mehl', note: 'Type 405' },
  ];
  const merged = consolidateIngredients([a, b], units);
  assert.deepEqual(
    merged.map((i) => [i.id, i.amount, i.unit ?? null, i.name]),
    [
      ['zwiebel', 3, null, 'Zwiebel'],
      ['mehl-g', 1100, 'g', 'Mehl'],
      ['kaese-g', 100, 'g', 'Käse'],
    ],
  );
  assert.equal(merged[1].note, undefined, 'notes belong to one recipe and are dropped');
  assert.equal(merged[0].plural, 'Zwiebeln');
});

test('singular and plural of a unit are the same unit; different units stay apart', () => {
  const a: Ingredient[] = [{ id: 'k', amount: 1, unit: 'Zehe', name: 'Knoblauch' }];
  const b: Ingredient[] = [{ id: 'k', amount: 2, unit: 'Zehen', name: 'Knoblauch' }];
  const c: Ingredient[] = [{ id: 'k', amount: 1, name: 'Knoblauch', plural: 'Knoblauchknollen' }];
  const merged = consolidateIngredients([a, b, c], units);
  assert.equal(merged.length, 2);
  assert.deepEqual([merged[0].amount, merged[0].unit], [3, 'Zehe']);
  assert.deepEqual([merged[1].amount, merged[1].unit], [1, undefined]);
});

test('an item without amount appears once and takes an amount from another recipe', () => {
  const salt: Ingredient[] = [{ id: 'salz', name: 'Salz' }];
  const chili: Ingredient[] = [{ id: 'chili', name: 'Chili', note: 'nach Geschmack' }];
  const chiliCounted: Ingredient[] = [{ id: 'chili', amount: 1, name: 'Chili', plural: 'Chilis' }];
  const merged = consolidateIngredients([salt, chili, salt, chiliCounted], units);
  assert.deepEqual(
    merged.map((i) => [i.name, i.amount]),
    [
      ['Salz', undefined],
      ['Chili', 1],
    ],
  );
});

test('optional only when optional in every recipe; whole when whole anywhere', () => {
  const a: Ingredient[] = [{ id: 'r', amount: 50, unit: 'g', name: 'Rosinen', optional: true }];
  const b: Ingredient[] = [{ id: 'r', amount: 50, unit: 'g', name: 'Rosinen' }];
  const c: Ingredient[] = [{ id: 'r', amount: 50, unit: 'g', name: 'Rosinen', optional: true }];
  assert.equal(consolidateIngredients([a, b], units)[0].optional, undefined);
  assert.equal(consolidateIngredients([a, c], units)[0].optional, true);

  const egg: Ingredient[] = [{ id: 'ei', amount: 2, name: 'Ei', plural: 'Eier', whole: true }];
  const eggLoose: Ingredient[] = [{ id: 'ei', amount: 1, name: 'Ei' }];
  assert.equal(consolidateIngredients([eggLoose, egg], units)[0].whole, true);
});

test('the lines use the schema.org format, with kg from 1000 g upwards', () => {
  const a: Ingredient[] = [
    { id: 'h', amount: 500, unit: 'g', name: 'Hackfleisch' },
    { id: 'z', amount: [1, 2], unit: 'Zehe', name: 'Knoblauch' },
  ];
  const b: Ingredient[] = [
    { id: 'h', amount: 600, unit: 'g', name: 'Hackfleisch' },
    { id: 'z', amount: 1, unit: 'Zehe', name: 'Knoblauch' },
    { id: 's', name: 'Salz' },
  ];
  assert.deepEqual(shoppingLines([a, b], units), ['1.1 kg Hackfleisch', '2-3 Zehen Knoblauch', 'Salz']);
});

test('the real recipes merge into one list without duplicates', () => {
  const recipes = [
    loadRecipe('fischcurry-mit-reis.yaml'),
    loadRecipe('hackbaellchen-tomcana.yaml'),
    loadRecipe('hackbaellchen-in-senfsosse-mit-gemuesereis.yaml'),
  ];
  const lines = shoppingLines(
    recipes.map((r) => flattenIngredients(r.ingredients)),
    units,
  );
  const total = recipes.reduce((n, r) => n + flattenIngredients(r.ingredients).length, 0);
  assert.ok(lines.length > 0 && lines.length < total, `${lines.length} lines from ${total} ingredients`);
  const ids = consolidateIngredients(
    recipes.map((r) => flattenIngredients(r.ingredients)),
    units,
  ).map((i) => i.id);
  assert.equal(new Set(ids).size, ids.length, 'ids are unique');
});

test('selection masks: one character per recipe in plan order', () => {
  assert.equal(selectionMask([true, false, true, true]), '1011');
  assert.deepEqual(allSelectionMasks(2), ['01', '10', '11']);
  assert.equal(allSelectionMasks(10).length, 1023);
  assert.deepEqual(selectedByMask('101', ['a', 'b', 'c']), ['a', 'c']);
  assert.equal(selectedByMask('000', ['a', 'b', 'c']), undefined);
  assert.equal(selectedByMask('10', ['a', 'b', 'c']), undefined);
  assert.equal(selectedByMask('1x1', ['a', 'b', 'c']), undefined);
});

test('the week page JSON-LD is one schema.org Recipe with the merged ingredients', () => {
  const data = weekListJsonLd(
    { name: 'Wochenplan 28. September – 2. Oktober', description: 'Zutaten von 2 Rezepten', url: 'https://example.org/woche/liste/11/' },
    [[{ id: 'a', amount: 1, name: 'Zwiebel', plural: 'Zwiebeln' }], [{ id: 'b', amount: 1, name: 'Zwiebel' }]],
    units,
  );
  assert.equal(data['@type'], 'Recipe');
  assert.equal(data.name, 'Wochenplan 28. September – 2. Oktober');
  assert.equal(data.image, undefined);
  assert.deepEqual(data.recipeIngredient, ['2 Zwiebeln']);
});
