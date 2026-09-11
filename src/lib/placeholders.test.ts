// Step placeholder rules from SPEC.md §4.6, tested with the real recipe files.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseStep, placeholderIds, renderStep, renderStepParts, validateStep } from './placeholders.ts';
import { ingredientsById, flattenSteps } from './recipe.ts';
import { lists, loadRecipe } from './test-support.ts';

const { units } = lists;
const vorlage = loadRecipe('_vorlage.yaml');
const curry = loadRecipe('fischcurry-mit-reis.yaml');

test('parseStep splits text and placeholders', () => {
  assert.deepEqual(parseStep('{mehl} und {zucker:2/3} mischen, {ei:name} trennen.'), [
    { kind: 'placeholder', placeholder: { id: 'mehl', mode: 'full' }, raw: '{mehl}' },
    { kind: 'text', text: ' und ' },
    { kind: 'placeholder', placeholder: { id: 'zucker', mode: 'full', fraction: 2 / 3 }, raw: '{zucker:2/3}' },
    { kind: 'text', text: ' mischen, ' },
    { kind: 'placeholder', placeholder: { id: 'ei', mode: 'name' }, raw: '{ei:name}' },
    { kind: 'text', text: ' trennen.' },
  ]);
  assert.deepEqual(parseStep('{butter:0.5} schmelzen.')[0], {
    kind: 'placeholder',
    placeholder: { id: 'butter', mode: 'full', fraction: 0.5 },
    raw: '{butter:0.5}',
  });
});

test('invalid placeholder syntax throws', () => {
  for (const step of ['{mehl', 'a } b', '{mehl:2/3:x}', '{Mehl}', '{mehl:abc}', '{mehl:0/0}', '{mehl:0}', '{}', '{a {b}']) {
    assert.throws(() => parseStep(step), undefined, `should reject: ${step}`);
  }
});

test('validateStep reports unknown ids and fractions on ingredients without amount', () => {
  const byId = ingredientsById(vorlage.ingredients);
  assert.deepEqual(validateStep('{zwiebel} würfeln.', byId), []);
  assert.deepEqual(validateStep('{zwiebeln} würfeln.', byId), ['{zwiebeln}: unbekannte Zutaten-Id „zwiebeln“']);
  assert.deepEqual(validateStep('{salz:1/2} zugeben.', byId), ['{salz:1/2}: die Zutat „salz“ hat keine Menge, ein Anteil ist hier nicht möglich']);
  assert.equal(validateStep('{zwiebel würfeln.', byId).length, 1);
});

test('placeholderIds lists the referenced ingredients', () => {
  assert.deepEqual(placeholderIds('{a} und {b:name} mit {a:1/2}'), ['a', 'b', 'a']);
  assert.deepEqual(placeholderIds('{kaputt'), []);
});

test('the template steps render at base yield', () => {
  const byId = ingredientsById(vorlage.ingredients);
  const steps = flattenSteps(vorlage.steps).map((s) => renderStep(s, byId, units));
  assert.deepEqual(steps, [
    '2 Zwiebeln und 1–2 Zehen Knoblauch fein würfeln.',
    '20 g Butter in einer Pfanne erhitzen und die Zwiebeln darin glasig dünsten.',
    '2 Eier mit der restlichen Butter (20 g Butter) verrühren und zugeben.',
    'Mit Salz abschmecken und mit 2 EL Petersilie (optional) bestreuen.',
  ]);
});

test('the template steps render at half the yield', () => {
  const byId = ingredientsById(vorlage.ingredients);
  const steps = flattenSteps(vorlage.steps).map((s) => renderStep(s, byId, units, 0.5));
  assert.deepEqual(steps, [
    '1 Zwiebel und ½–1 Zehe Knoblauch fein würfeln.',
    '10 g Butter in einer Pfanne erhitzen und die Zwiebel darin glasig dünsten.',
    '1 Ei mit der restlichen Butter (10 g Butter) verrühren und zugeben.',
    'Mit Salz abschmecken und mit 1 EL Petersilie (optional) bestreuen.',
  ]);
});

test('fish curry: name-only placeholders and ranges', () => {
  const byId = ingredientsById(curry.ingredients);
  const steps = flattenSteps(curry.steps);
  assert.equal(renderStep(steps[0], byId, units), '2 Tassen Reis nach Packungsangabe zubereiten.');
  assert.equal(renderStep(steps[0], byId, units, 0.5), '1 Tasse Reis nach Packungsangabe zubereiten.');
  assert.equal(
    renderStep(steps[4], byId, units, 2),
    '2 Dosen Kokosmilch, 1 l Gemüsebrühe und 4–6 EL rote Currypaste in die Pfanne einrühren, einmal aufkochen und dann die Hitze reduzieren. Die Sauce 10 Minuten köcheln lassen.',
  );
  assert.equal(renderStep(steps[6], byId, units), 'Koriander waschen, die Blätter abzupfen und nach Belieben hacken.');
  assert.match(renderStep(steps[7], byId, units, 3), /^Die Sauce mit Salz, Pfeffer und /);
});

test('renderStepParts marks ingredient mentions for the UI', () => {
  const byId = ingredientsById(vorlage.ingredients);
  assert.deepEqual(renderStepParts('{zwiebel} würfeln.', byId, units), [
    { kind: 'ingredient', id: 'zwiebel', text: '2 Zwiebeln' },
    { kind: 'text', text: ' würfeln.' },
  ]);
  assert.throws(() => renderStep('{nix}', byId, units));
});
