// Weekly plan rules from MEAL_PLANNER.md §14: entry shapes, day order, leftovers, the recipe cap,
// the list of weeks (at most two, in order, not overlapping), and the warning for trial recipes
// that are not in the plan.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync } from 'node:fs';
import {
  createPlanSchema,
  forgottenTrials,
  hasPlan,
  isoDate,
  loadPlan,
  MAX_PLAN_RECIPES,
  MAX_PLAN_WEEKS,
  planRecipes,
  weekKey,
  weekRecipes,
  weekTitle,
  weekdayName,
} from './plan.ts';
import type { Week } from './types.ts';

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

/** a plan with one week made of the given days */
function plan(days: unknown[]) {
  return { weeks: [{ days }] };
}

const day = (date: string) => new Date(date);

const week: Week = {
  note: 'Diese Woche mit viel Gemüse.',
  days: [
    { date: day('2026-09-28'), lunch: { text: 'Brot mit Salat' }, dinner: { recipe: 'fischcurry-mit-reis' } },
    { date: day('2026-09-29'), lunch: { leftovers: day('2026-09-28') }, dinner: { recipe: 'hackbaellchen-tomcana' } },
    { date: day('2026-09-30') },
    { date: day('2026-10-01'), dinner: { recipe: 'hackbaellchen-in-senfsosse-mit-gemuesereis' } },
  ],
};

const nextWeek: Week = {
  days: [
    { date: day('2026-10-05'), dinner: { recipe: 'hackbaellchen-tomcana' } },
    { date: day('2026-10-06'), lunch: { leftovers: day('2026-10-05') } },
  ],
};

test('a valid week parses and lists its recipes once, in plan order', () => {
  const result = parse({ weeks: [week] });
  assert.ok(result.success, JSON.stringify(result.error?.issues));
  assert.deepEqual(weekRecipes(result.data.weeks[0]), [
    'fischcurry-mit-reis',
    'hackbaellchen-tomcana',
    'hackbaellchen-in-senfsosse-mit-gemuesereis',
  ]);
  assert.equal(weekKey(result.data.weeks[0]), '2026-09-28');
  assert.equal(hasPlan(result.data), true);
});

test('an empty plan is valid and counts as "no plan"', () => {
  const result = parse({ weeks: [] });
  assert.ok(result.success);
  assert.equal(hasPlan(result.data), false);
  assert.equal(hasPlan(undefined), false);
});

test('two weeks: in order, not overlapping, a recipe may return in the second week', () => {
  const result = parse({ weeks: [week, nextWeek] });
  assert.ok(result.success, JSON.stringify(result.error?.issues));
  assert.deepEqual(planRecipes(result.data), [
    'fischcurry-mit-reis',
    'hackbaellchen-tomcana',
    'hackbaellchen-in-senfsosse-mit-gemuesereis',
  ]);
  assertIssue({ weeks: [nextWeek, week] }, /weeks\.1\.days\.0\.date: die Wochen müssen aufsteigend sortiert sein und dürfen sich nicht überschneiden \(2026-09-28 nach 2026-10-06\)/);
  const overlapping = { days: [{ date: day('2026-10-01'), dinner: { text: 'Pizza' } }] };
  assertIssue({ weeks: [week, overlapping] }, /weeks\.1\.days\.0\.date: die Wochen müssen aufsteigend sortiert sein und dürfen sich nicht überschneiden \(2026-10-01 nach 2026-10-01\)/);
});

test(`at most ${MAX_PLAN_WEEKS} weeks, each with at least one day`, () => {
  const third = { days: [{ date: day('2026-10-12') }] };
  assertIssue({ weeks: [week, nextWeek, third] }, /^weeks: höchstens 2 Wochen im Plan \(es sind 3\)/);
  assertIssue({ weeks: [{ days: [] }] }, /weeks\.0\.days: eine Woche braucht mindestens einen Tag/);
});

test('an entry must be exactly one of recipe, leftovers or text', () => {
  assertIssue(plan([{ date: day('2026-09-28'), dinner: { recipe: 'fischcurry-mit-reis', text: 'x' } }]), /weeks\.0\.days\.0\.dinner: eine Mahlzeit ist/);
  assertIssue(plan([{ date: day('2026-09-28'), dinner: 'Fischcurry' }]), /weeks\.0\.days\.0\.dinner: eine Mahlzeit ist/);
  assertIssue(plan([{ date: day('2026-09-28'), dinner: { snack: 'x' } }]), /weeks\.0\.days\.0\.dinner: eine Mahlzeit ist/);
});

test('a recipe must exist', () => {
  assertIssue(plan([{ date: day('2026-09-28'), dinner: { recipe: 'gibt-es-nicht' } }]), /weeks\.0\.days\.0\.dinner: Rezept „gibt-es-nicht“ gibt es nicht/);
});

test('the same recipe cannot be planned twice in a week; leftovers are the way', () => {
  assertIssue(
    plan([
      { date: day('2026-09-28'), dinner: { recipe: 'fischcurry-mit-reis' } },
      { date: day('2026-09-29'), lunch: { recipe: 'fischcurry-mit-reis' } },
    ]),
    /weeks\.0\.days\.1\.lunch: Rezept „fischcurry-mit-reis“ kommt schon vor; für Reste/,
  );
});

test('days are sorted and unique', () => {
  assertIssue(
    plan([{ date: day('2026-09-29') }, { date: day('2026-09-28') }]),
    /weeks\.0\.days\.1\.date: die Tage müssen aufsteigend sortiert sein \(2026-09-28 nach 2026-09-29\)/,
  );
  assertIssue(plan([{ date: day('2026-09-28') }, { date: day('2026-09-28') }]), /weeks\.0\.days\.1\.date: der 2026-09-28 kommt zweimal vor/);
});

test('leftovers point at an earlier day of the same week on which a recipe is cooked', () => {
  assertIssue(plan([{ date: day('2026-09-28'), lunch: { leftovers: day('2026-09-28') } }]), /weeks\.0\.days\.0\.lunch: leftovers: der 2026-09-28 ist kein früherer Tag dieser Woche/);
  assertIssue(
    plan([{ date: day('2026-09-28') }, { date: day('2026-09-29'), lunch: { leftovers: day('2026-09-27') } }]),
    /weeks\.0\.days\.1\.lunch: leftovers: der 2026-09-27 ist kein früherer Tag dieser Woche/,
  );
  assertIssue(
    plan([{ date: day('2026-09-28'), dinner: { text: 'Essen gehen' } }, { date: day('2026-09-29'), lunch: { leftovers: day('2026-09-28') } }]),
    /weeks\.0\.days\.1\.lunch: leftovers: am 2026-09-28 wird kein Rezept gekocht/,
  );
  // leftovers of the previous week are not allowed either: the week is the unit of the shopping list
  assertIssue({ weeks: [week, { days: [{ date: day('2026-10-05'), lunch: { leftovers: day('2026-10-01') } }] }] }, /weeks\.1\.days\.0\.lunch: leftovers: der 2026-10-01 ist kein früherer Tag dieser Woche/);
});

test(`at most ${MAX_PLAN_RECIPES} different recipes per week`, () => {
  const many = Array.from({ length: MAX_PLAN_RECIPES + 1 }, (_, i) => `rezept-${i}`);
  const days = many.map((slug, i) => ({ date: new Date(Date.UTC(2026, 9, 1 + i)), dinner: { recipe: slug } }));
  assert.equal(issues(plan(days.slice(0, MAX_PLAN_RECIPES)), many).length, 0);
  const found = issues(plan(days), many);
  assert.ok(found.some((line) => /^weeks\.0\.days: höchstens 10 verschiedene Rezepte pro Woche \(es sind 11\)/.test(line)), found.join('\n'));
});

test('unknown fields are an error, like in recipe files', () => {
  assertIssue({ week: 40, weeks: [] }, /Unrecognized key: "week"/);
  assertIssue({ weeks: [{ note: 'x', days: [], year: 2026 }] }, /weeks\.0: Unrecognized key: "year"/);
  assertIssue(plan([{ date: day('2026-09-28'), breakfast: { text: 'Müsli' } }]), /weeks\.0\.days\.0: Unrecognized key: "breakfast"/);
});

test('isoDate keeps the calendar day of a YAML date', () => {
  assert.equal(isoDate(day('2026-09-28')), '2026-09-28');
});

test('German title and weekday names for a week', () => {
  assert.equal(weekTitle(week), '28. September – 1. Oktober');
  assert.equal(weekTitle({ days: [{ date: day('2026-09-23') }, { date: day('2026-09-25') }] }), '23.–25. September');
  assert.equal(weekTitle({ days: [{ date: day('2026-09-28') }] }), '28. September');
  assert.equal(weekdayName(day('2026-09-28')), 'Montag');
  assert.equal(weekdayName(day('2026-10-04')), 'Sonntag');
});

test('trial recipes outside every week of the plan produce a warning', () => {
  const result = parse({ weeks: [week, nextWeek] });
  assert.ok(result.success);
  const warnings = forgottenTrials(result.data, ['hackbaellchen-tomcana', 'probe-rezept']);
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
