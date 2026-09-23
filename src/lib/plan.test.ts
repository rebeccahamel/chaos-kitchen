// Weekly plan rules from MEAL_PLANNER.md §14: entry shapes, day order, leftovers, the recipe cap,
// and the warning for trial recipes that are not in the plan.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync } from 'node:fs';
import { createPlanSchema, forgottenTrials, hasPlan, isoDate, loadPlan, MAX_PLAN_RECIPES, planRecipes, planTitle, weekdayName } from './plan.ts';

const slugs = ['fischcurry-mit-reis', 'hackbaellchen-tomcana', 'hackbaellchen-in-senfsosse-mit-gemuesereis'];

function parse(data: unknown, known: string[] = slugs) {
  return createPlanSchema(known).safeParse(data);
}

/** "path: message" for every issue, so tests can check both. */
function issues(data: unknown, known: string[] = slugs): string[] {
  const result = parse(data, known);
  return result.success ? [] : result.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
}

function assertIssue(data: unknown, expected: RegExp) {
  const found = issues(data);
  assert.ok(found.some((line) => expected.test(line)), `expected ${expected} in:\n${found.join('\n')}`);
}

const week = {
  note: 'Diese Woche mit viel Gemüse.',
  days: [
    { date: new Date('2026-09-28'), lunch: { text: 'Brot mit Salat' }, dinner: { recipe: 'fischcurry-mit-reis' } },
    { date: new Date('2026-09-29'), lunch: { leftovers: new Date('2026-09-28') }, dinner: { recipe: 'hackbaellchen-tomcana' } },
    { date: new Date('2026-09-30') },
    { date: new Date('2026-10-01'), dinner: { recipe: 'hackbaellchen-in-senfsosse-mit-gemuesereis' } },
  ],
};

test('a valid plan parses and lists its recipes once, in plan order', () => {
  const result = parse(week);
  assert.ok(result.success, JSON.stringify(result.error?.issues));
  assert.deepEqual(planRecipes(result.data), [
    'fischcurry-mit-reis',
    'hackbaellchen-tomcana',
    'hackbaellchen-in-senfsosse-mit-gemuesereis',
  ]);
  assert.equal(hasPlan(result.data), true);
});

test('an empty plan is valid and counts as "no plan"', () => {
  const result = parse({ days: [] });
  assert.ok(result.success);
  assert.equal(hasPlan(result.data), false);
  assert.equal(hasPlan(undefined), false);
});

test('an entry must be exactly one of recipe, leftovers or text', () => {
  assertIssue({ days: [{ date: new Date('2026-09-28'), dinner: { recipe: 'fischcurry-mit-reis', text: 'x' } }] }, /days\.0\.dinner: eine Mahlzeit ist/);
  assertIssue({ days: [{ date: new Date('2026-09-28'), dinner: 'Fischcurry' }] }, /days\.0\.dinner: eine Mahlzeit ist/);
  assertIssue({ days: [{ date: new Date('2026-09-28'), dinner: { snack: 'x' } }] }, /days\.0\.dinner: eine Mahlzeit ist/);
});

test('a recipe must exist', () => {
  assertIssue({ days: [{ date: new Date('2026-09-28'), dinner: { recipe: 'gibt-es-nicht' } }] }, /days\.0\.dinner: Rezept „gibt-es-nicht“ gibt es nicht/);
});

test('the same recipe cannot be planned twice; leftovers are the way', () => {
  assertIssue(
    {
      days: [
        { date: new Date('2026-09-28'), dinner: { recipe: 'fischcurry-mit-reis' } },
        { date: new Date('2026-09-29'), lunch: { recipe: 'fischcurry-mit-reis' } },
      ],
    },
    /days\.1\.lunch: Rezept „fischcurry-mit-reis“ kommt schon vor; für Reste/,
  );
});

test('days are sorted and unique', () => {
  assertIssue(
    { days: [{ date: new Date('2026-09-29') }, { date: new Date('2026-09-28') }] },
    /days\.1\.date: die Tage müssen aufsteigend sortiert sein \(2026-09-28 nach 2026-09-29\)/,
  );
  assertIssue({ days: [{ date: new Date('2026-09-28') }, { date: new Date('2026-09-28') }] }, /days\.1\.date: der 2026-09-28 kommt zweimal vor/);
});

test('leftovers point at an earlier day of the plan on which a recipe is cooked', () => {
  const day = (date: string) => new Date(date);
  assertIssue(
    { days: [{ date: day('2026-09-28'), lunch: { leftovers: day('2026-09-28') } }] },
    /days\.0\.lunch: leftovers: der 2026-09-28 ist kein früherer Tag/,
  );
  assertIssue(
    { days: [{ date: day('2026-09-28') }, { date: day('2026-09-29'), lunch: { leftovers: day('2026-09-27') } }] },
    /days\.1\.lunch: leftovers: der 2026-09-27 ist kein früherer Tag/,
  );
  assertIssue(
    { days: [{ date: day('2026-09-28'), dinner: { text: 'Essen gehen' } }, { date: day('2026-09-29'), lunch: { leftovers: day('2026-09-28') } }] },
    /days\.1\.lunch: leftovers: am 2026-09-28 wird kein Rezept gekocht/,
  );
});

test(`at most ${MAX_PLAN_RECIPES} different recipes per week`, () => {
  const many = Array.from({ length: MAX_PLAN_RECIPES + 1 }, (_, i) => `rezept-${i}`);
  const days = many.map((slug, i) => ({ date: new Date(Date.UTC(2026, 9, 1 + i)), dinner: { recipe: slug } }));
  assert.equal(issues({ days: days.slice(0, MAX_PLAN_RECIPES) }, many).length, 0);
  const found = issues({ days }, many);
  assert.ok(found.some((line) => /^days: höchstens 10 verschiedene Rezepte pro Woche \(es sind 11\)/.test(line)), found.join('\n'));
});

test('unknown fields are an error, like in recipe files', () => {
  assertIssue({ week: 40, days: [] }, /Unrecognized key: "week"/);
  assertIssue({ days: [{ date: new Date('2026-09-28'), breakfast: { text: 'Müsli' } }] }, /days\.0: Unrecognized key: "breakfast"/);
});

test('isoDate keeps the calendar day of a YAML date', () => {
  assert.equal(isoDate(new Date('2026-09-28')), '2026-09-28');
});

test('German title and weekday names for the plan', () => {
  const plan = parse(week);
  assert.ok(plan.success);
  assert.equal(planTitle(plan.data), '28. September – 1. Oktober');
  assert.equal(planTitle({ days: [{ date: new Date('2026-09-28') }] }), '28. September');
  assert.equal(weekdayName(new Date('2026-09-28')), 'Montag');
  assert.equal(weekdayName(new Date('2026-10-04')), 'Sonntag');
});

test('trial recipes outside the plan produce a warning', () => {
  const plan = parse(week);
  assert.ok(plan.success);
  const warnings = forgottenTrials(plan.data, ['hackbaellchen-tomcana', 'probe-rezept']);
  assert.deepEqual(warnings, [
    'Rezept „probe-rezept“ ist mit trial: true markiert, steht aber nicht im Wochenplan. Behalten (trial entfernen) oder Datei löschen.',
  ]);
  assert.deepEqual(forgottenTrials(undefined, ['probe-rezept']).length, 1);
});

test('the real plan file is valid or absent', () => {
  const realSlugs = readdirSync(new URL('../content/recipes/', import.meta.url))
    .filter((file) => file.endsWith('.yaml') && !file.startsWith('_'))
    .map((file) => file.slice(0, -'.yaml'.length));
  assert.doesNotThrow(() => loadPlan(realSlugs));
});
