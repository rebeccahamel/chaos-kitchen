// Build validation rules from SPEC.md §7, tested with the real recipe files
// and the grouped example from SPEC.md §4.2.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRecipeSchema } from './recipe-schema.ts';
import { hasGroups } from './recipe.ts';
import { lists, loadRecipe, readRecipeFile } from './test-support.ts';

function parse(data: unknown, warnings: string[] = []) {
  return createRecipeSchema(lists, (message) => warnings.push(message)).safeParse(data);
}

/** "path: message" for every issue, so tests can check both. */
function issues(data: unknown): string[] {
  const result = parse(data);
  return result.success ? [] : result.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
}

function assertIssue(data: unknown, expected: RegExp) {
  const found = issues(data);
  assert.ok(found.some((line) => expected.test(line)), `expected ${expected} in:\n${found.join('\n')}`);
}

const quarkkuchen = {
  title: 'Omas Quarkkuchen',
  description: 'Saftiger Quarkkuchen auf Mürbeteig – der Sonntagsklassiker.',
  author: 'oma',
  added: new Date('2026-09-11'),
  yield: { amount: 12, unit: 'Stück', note: 'für eine 26er Springform' },
  time: { prep: 30, cook: 60, rest: 60 },
  tags: ['kuchen-und-gebaeck', 'vegetarisch', 'kaffeetafel'],
  ingredients: [
    {
      group: 'Für den Teig',
      items: [
        { id: 'mehl', amount: 250, unit: 'g', name: 'Mehl' },
        { id: 'zucker-teig', amount: 80, unit: 'g', name: 'Zucker' },
        { id: 'butter', amount: 150, unit: 'g', name: 'Butter', note: 'kalt' },
        { id: 'ei-teig', amount: 1, name: 'Ei', plural: 'Eier', whole: true },
      ],
    },
    {
      group: 'Für die Füllung',
      items: [
        { id: 'quark', amount: 750, unit: 'g', name: 'Magerquark' },
        { id: 'zucker-fuellung', amount: 150, unit: 'g', name: 'Zucker' },
        { id: 'eier-fuellung', amount: 3, name: 'Ei', plural: 'Eier', whole: true },
        { id: 'zitrone', amount: 1, name: 'Bio-Zitrone', plural: 'Bio-Zitronen' },
        { id: 'zitronensaft', amount: [1, 2], unit: 'EL', name: 'Zitronensaft' },
        { id: 'rosinen', amount: 50, unit: 'g', name: 'Rosinen', optional: true },
        { id: 'salz', amount: 1, unit: 'Prise', name: 'Salz' },
      ],
    },
  ],
  steps: [
    {
      group: 'Teig',
      items: [
        '{mehl}, {zucker-teig}, {butter} und {ei-teig} rasch zu einem glatten Teig verkneten.',
        'Den Teig 30 Minuten kalt stellen, dann in der Form ausrollen und einen Rand hochziehen.',
      ],
    },
    {
      group: 'Füllung',
      items: [
        '{eier-fuellung} trennen.',
        'Eigelbe mit {quark}, {zucker-fuellung:2/3}, {zitronensaft} und {salz} glatt rühren.',
        'Die {zitrone:name} heiß abwaschen, die Schale abreiben und mit {rosinen} unterheben.',
        'Eiweiße mit dem restlichen Zucker ({zucker-fuellung:1/3}) steif schlagen und unterheben.',
      ],
    },
    {
      group: 'Backen',
      items: [
        'Die Füllung auf den Teig geben und bei 175 °C Ober-/Unterhitze etwa 60 Minuten backen.',
        'Im ausgeschalteten Ofen bei leicht geöffneter Tür 1 Stunde abkühlen lassen.',
      ],
    },
  ],
};

/** A fresh copy of the fish curry to break in individual tests. */
function curry(): any {
  return structuredClone(readRecipeFile('fischcurry-mit-reis.yaml'));
}

test('the existing recipe files are valid and produce no warnings', () => {
  for (const file of ['_vorlage.yaml', 'fischcurry-mit-reis.yaml']) {
    const warnings: string[] = [];
    const recipe = loadRecipe(file, warnings);
    assert.ok(recipe.title.length > 0);
    assert.ok(recipe.added instanceof Date);
    assert.deepEqual(warnings, [], `${file} warnings`);
  }
});

test('a flat list becomes one group without heading', () => {
  const recipe = loadRecipe('fischcurry-mit-reis.yaml');
  assert.equal(recipe.ingredients.length, 1);
  assert.equal(recipe.ingredients[0].group, undefined);
  assert.equal(recipe.ingredients[0].items.length, 16);
  assert.equal(recipe.steps.length, 1);
  assert.equal(recipe.steps[0].items.length, 8);
  assert.equal(hasGroups(recipe.ingredients), false);
});

test('the grouped example from SPEC.md §4.2 is valid and keeps its groups', () => {
  const warnings: string[] = [];
  const result = parse(quarkkuchen, warnings);
  assert.ok(result.success, JSON.stringify(result.success ? null : result.error.issues, null, 2));
  assert.deepEqual(result.data.ingredients.map((g) => g.group), ['Für den Teig', 'Für die Füllung']);
  assert.deepEqual(result.data.steps.map((g) => g.items.length), [2, 4, 2]);
  assert.ok(hasGroups(result.data.ingredients));
  assert.deepEqual(warnings, []);
});

test('mixing a flat list with groups is an error', () => {
  const data = structuredClone(quarkkuchen) as any;
  data.ingredients.push({ id: 'extra', name: 'Extra' });
  assertIssue(data, /^ingredients: entweder eine einfache Liste oder nur Gruppen/);
});

test('missing required fields and unknown fields are errors that name the field', () => {
  const noTitle = curry();
  delete noTitle.title;
  assertIssue(noTitle, /^title: /);

  const typo = curry();
  typo.descripton = typo.description;
  delete typo.description;
  assertIssue(typo, /^description: /);
  assertIssue(typo, /descripton/);

  const badTime = curry();
  badTime.time.prep = 'dreißig';
  assertIssue(badTime, /^time\.prep: /);
});

test('an ingredient with a bad amount or an unknown field is reported with its position', () => {
  const data = curry();
  data.ingredients[2].amount = 'eins';
  assertIssue(data, /^ingredients\.2\.amount: Menge muss eine Zahl/);

  const extra = curry();
  extra.ingredients[0].notes = 'x';
  assertIssue(extra, /^ingredients\.0/);
});

test('author, tags and units must exist in the central lists', () => {
  const author = curry();
  author.author = 'opa';
  assertIssue(author, /^author: Person „opa“ steht nicht in people\.yaml/);

  const tag = curry();
  tag.tags.push('schnell');
  assertIssue(tag, /^tags\.2: Tag „schnell“ steht nicht in tags\.yaml/);

  const yieldUnit = curry();
  yieldUnit.yield.unit = 'Teller';
  assertIssue(yieldUnit, /^yield\.unit: Einheit „Teller“ steht nicht in units\.yaml/);

  const unit = curry();
  unit.ingredients[0].unit = 'Becher';
  assertIssue(unit, /Zutat „reis“: Einheit „Becher“ steht nicht in units\.yaml/);
});

test('plural unit forms are accepted', () => {
  const data = curry();
  data.ingredients[0].unit = 'Tassen';
  data.yield.unit = 'Portion';
  assert.ok(parse(data).success);
});

test('duplicate ingredient ids are an error', () => {
  const data = curry();
  data.ingredients[1].id = 'reis';
  assertIssue(data, /Zutaten-Id „reis“ kommt mehrfach vor/);
});

test('a range needs min < max', () => {
  const data = curry();
  data.ingredients[11].amount = [3, 2];
  assertIssue(data, /Zutat „currypaste“: bei einer Spanne muss der erste Wert kleiner/);
});

test('step placeholders with unknown ids or bad syntax are errors that name the step', () => {
  const unknown = curry();
  unknown.steps[2] = '{zwiebeln} putzen.';
  assertIssue(unknown, /^steps: Schritt 3: \{zwiebeln\}: unbekannte Zutaten-Id/);

  const broken = curry();
  broken.steps[0] = '{reis nach Packungsangabe zubereiten.';
  assertIssue(broken, /^steps: Schritt 1: Platzhalter an Position 1/);

  const fraction = curry();
  fraction.steps[7] = 'Mit {salz:1/2} abschmecken.';
  assertIssue(fraction, /^steps: Schritt 8: \{salz:1\/2\}: die Zutat „salz“ hat keine Menge/);
});

test('step numbering in error messages continues across groups', () => {
  const data = structuredClone(quarkkuchen) as any;
  data.steps[1].items[0] = '{nix} trennen.';
  assertIssue(data, /^steps: Schritt 3: /);
});

test('an ingredient that no step mentions is a warning, not an error', () => {
  const data = curry();
  data.ingredients.push({ id: 'limette', amount: 1, name: 'Limette', plural: 'Limetten' });
  const warnings: string[] = [];
  const result = parse(data, warnings);
  assert.ok(result.success);
  assert.deepEqual(warnings, ['Rezept „Fischcurry mit Reis“: Zutat „limette“ wird in keinem Schritt verwendet.']);
});

test('kg and l are converted to g and ml', () => {
  const data = curry();
  data.ingredients[7] = { id: 'kaiserschoten', amount: 1.5, unit: 'kg', name: 'Kaiserschoten' };
  data.ingredients[10] = { id: 'gemuesebruehe', amount: [0.5, 1], unit: 'l', name: 'Gemüsebrühe' };
  const result = parse(data);
  assert.ok(result.success);
  const items = result.data.ingredients[0].items;
  assert.deepEqual(items[7], { id: 'kaiserschoten', amount: 1500, unit: 'g', name: 'Kaiserschoten' });
  assert.deepEqual(items[10], { id: 'gemuesebruehe', amount: [500, 1000], unit: 'ml', name: 'Gemüsebrühe' });
});

test('added accepts a YAML date and a quoted string', () => {
  const quoted = curry();
  quoted.added = '2026-09-11';
  const result = parse(quoted);
  assert.ok(result.success);
  assert.equal(result.data.added.toISOString().slice(0, 10), '2026-09-11');

  const bad = curry();
  bad.added = 'gestern';
  assertIssue(bad, /^added: /);
});
