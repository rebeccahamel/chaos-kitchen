// schema.org Recipe data for Bring! (SPEC.md §6.4, §6.8).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isoDuration, recipeJsonLd } from './structured-data.ts';
import { lists, loadRecipe } from './test-support.ts';

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
  assert.equal(ingredients.length, 18, 'Wasser appears in two groups and is one line');
  assert.equal(ingredients[0], 'Basmatireis, 300 g');
  assert.ok(ingredients.includes('Porree, 2 Stangen'));
  assert.ok(ingredients.includes('Petersilie, 0.5 Bund, glatt'), 'notes survive on the recipe page');
  assert.ok(ingredients.includes('Butter, 1 EL, optional'));
  assert.ok(ingredients.includes('Salz'));
  assert.ok(ingredients.includes('Wasser, 700 ml'));
  assert.equal(ingredients.filter((line) => line.startsWith('Wasser')).length, 1);

  const steps = data.recipeInstructions as { '@type': string; text: string }[];
  assert.equal(steps.length, 8);
  assert.equal(steps[0]['@type'], 'HowToStep');
  assert.ok(steps[0].text.startsWith('2 Möhren schälen'));

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
