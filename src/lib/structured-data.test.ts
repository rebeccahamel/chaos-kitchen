// schema.org Recipe data for Bring! (SPEC.md §6.4, §6.8).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ingredientLine, isoDuration, recipeJsonLd } from './structured-data.ts';
import { lists, loadRecipe } from './test-support.ts';
import type { Ingredient } from './types.ts';

const { units } = lists;

const reis: Ingredient = { id: 'reis', amount: 300, unit: 'g', name: 'Basmatireis' };
const hackfleisch: Ingredient = { id: 'hackfleisch', amount: 1500, unit: 'g', name: 'Hackfleisch' };
const bruehe: Ingredient = { id: 'bruehe', amount: [800, 1200], unit: 'ml', name: 'Brühe' };
const petersilie: Ingredient = { id: 'petersilie', amount: 0.5, unit: 'Bund', name: 'Petersilie', note: 'glatt' };
const butter: Ingredient = { id: 'butter', amount: 1, unit: 'EL', name: 'Butter', optional: true };
const knoblauch: Ingredient = { id: 'knoblauch', amount: [1, 2], unit: 'Zehe', name: 'Knoblauch' };
const karotte: Ingredient = { id: 'karotte', amount: 2, name: 'Karotte', plural: 'Karotten' };
const zwiebel: Ingredient = { id: 'zwiebel', amount: 1, name: 'Zwiebel', plural: 'Zwiebeln' };
const salz: Ingredient = { id: 'salz', name: 'Salz' };
const salat: Ingredient = { id: 'salat', name: 'Salat', note: 'klein', optional: true };

test('ingredient lines use plain numbers, units and names', () => {
  assert.equal(ingredientLine(reis, units), '300 g Basmatireis');
  assert.equal(ingredientLine(karotte, units), '2 Karotten');
  assert.equal(ingredientLine(zwiebel, units), '1 Zwiebel');
  assert.equal(ingredientLine(salz, units), 'Salz');
});

test('ranges use a plain hyphen and the plural of the unit', () => {
  assert.equal(ingredientLine(knoblauch, units), '1-2 Zehen Knoblauch');
});

test('g and ml switch to kg and l from 1000 upwards, ranges as a pair', () => {
  assert.equal(ingredientLine(hackfleisch, units), '1.5 kg Hackfleisch');
  assert.equal(ingredientLine(bruehe, units), '0.8-1.2 l Brühe');
  assert.equal(ingredientLine({ ...reis, amount: 999 }, units), '999 g Basmatireis');
});

test('note and optional follow after a comma', () => {
  assert.equal(ingredientLine(petersilie, units), '0.5 Bund Petersilie, glatt');
  assert.equal(ingredientLine(butter, units), '1 EL Butter, optional');
  assert.equal(ingredientLine(salat, units), 'Salat, klein, optional');
});

test('durations are ISO 8601', () => {
  assert.equal(isoDuration(0), 'PT0M');
  assert.equal(isoDuration(20), 'PT20M');
  assert.equal(isoDuration(60), 'PT1H');
  assert.equal(isoDuration(90), 'PT1H30M');
  assert.equal(isoDuration(150), 'PT2H30M');
});

test('a whole recipe becomes a schema.org Recipe', () => {
  const recipe = loadRecipe('hackbaellchen-in-senfsosse-mit-gemuesereis.yaml');
  const page = {
    url: 'https://example.test/chaos-kitchen/rezept/hackbaellchen-in-senfsosse-mit-gemuesereis/',
    image: 'https://example.test/chaos-kitchen/_astro/bild.jpg',
  };
  const data = recipeJsonLd(recipe, lists, page);

  assert.equal(data['@context'], 'https://schema.org');
  assert.equal(data['@type'], 'Recipe');
  assert.equal(data.name, 'Hackbällchen in Senfsoße mit Gemüsereis');
  assert.deepEqual(data.author, { '@type': 'Person', name: 'Becci' });
  assert.equal(data.image, page.image);
  assert.equal(data.url, page.url);
  assert.equal(data.datePublished, '2026-09-12');
  assert.equal(data.recipeYield, '4 Portionen');
  assert.equal(data.prepTime, 'PT20M');
  assert.equal(data.cookTime, 'PT25M');
  assert.equal(data.totalTime, 'PT45M');
  assert.equal(data.keywords, 'Mittagessen, Abendessen, Fleisch');

  const ingredients = data.recipeIngredient as string[];
  assert.equal(ingredients.length, 19);
  assert.equal(ingredients[0], '300 g Basmatireis');
  assert.ok(ingredients.includes('2 Stangen Porree'));
  assert.ok(ingredients.includes('0.5 Bund Petersilie, glatt'));
  assert.ok(ingredients.includes('1 EL Butter, optional'));
  assert.ok(ingredients.includes('Salz'));

  const steps = data.recipeInstructions as { '@type': string; text: string }[];
  assert.equal(steps.length, 8);
  assert.equal(steps[0]['@type'], 'HowToStep');
  assert.ok(steps[0].text.startsWith('2 Karotten schälen'));

  // must survive the trip into the page as JSON
  assert.deepEqual(JSON.parse(JSON.stringify(data)), data);
});

test('cookTime and keywords are left out when the recipe has none', () => {
  const recipe = loadRecipe('hackbaellchen-in-senfsosse-mit-gemuesereis.yaml');
  const data = recipeJsonLd({ ...recipe, time: { prep: 15 }, tags: [] }, lists, { url: 'https://example.test/', image: '' });
  assert.equal(data.cookTime, undefined);
  assert.equal(data.totalTime, 'PT15M');
  assert.equal(data.keywords, undefined);
});
