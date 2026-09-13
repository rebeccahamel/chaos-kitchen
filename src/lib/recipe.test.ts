import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatDuration, hasGroups, totalTime } from './recipe.ts';
import { tagLabel } from './tags.ts';
import { lists } from './test-support.ts';

test('total time adds prep, cook and rest', () => {
  assert.equal(totalTime({ prep: 30 }), 30);
  assert.equal(totalTime({ prep: 30, cook: 60, rest: 60 }), 150);
});

test('durations are shown as min / h / h min', () => {
  assert.equal(formatDuration(30), '30 min');
  assert.equal(formatDuration(60), '1 h');
  assert.equal(formatDuration(150), '2 h 30 min');
  assert.equal(formatDuration(0), '0 min');
});

test('hasGroups is true only when a heading exists', () => {
  assert.equal(hasGroups([{ items: [] }]), false);
  assert.equal(hasGroups([{ group: 'Teig', items: [] }, { group: 'Füllung', items: [] }]), true);
});

test('tag labels come from tags.yaml', () => {
  assert.equal(tagLabel(lists.tags, 'abendessen'), 'Abendessen');
  assert.equal(tagLabel(lists.tags, 'fisch'), 'Fisch');
  assert.equal(tagLabel(lists.tags, 'unbekannt'), 'unbekannt');
});
