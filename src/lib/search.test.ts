import { test } from 'node:test';
import assert from 'node:assert/strict';
import { matchesSearch, normalizeForSearch } from './search.ts';

test('normalisation lowercases and folds umlauts', () => {
  assert.equal(normalizeForSearch('Käsespätzle mit Röstzwiebeln'), 'kaesespaetzle mit roestzwiebeln');
  assert.equal(normalizeForSearch('Süßkartoffel'), 'suesskartoffel');
  assert.equal(normalizeForSearch('  Öl   und  Essig '), 'oel und essig');
});

test('umlauts and transliterations match each other', () => {
  const haystack = normalizeForSearch('Fischcurry mit Reis Gemüsebrühe Öl');
  assert.ok(matchesSearch(haystack, 'gemüse'));
  assert.ok(matchesSearch(haystack, 'GEMUESE'));
  assert.ok(matchesSearch(haystack, 'öl'));
  assert.ok(matchesSearch(haystack, 'oel'));
  assert.ok(!matchesSearch(haystack, 'kuchen'));
});

test('every word of the query must occur; an empty query matches everything', () => {
  const haystack = normalizeForSearch('Fischcurry mit Reis');
  assert.ok(matchesSearch(haystack, 'reis fisch'));
  assert.ok(!matchesSearch(haystack, 'reis kuchen'));
  assert.ok(matchesSearch(haystack, ''));
  assert.ok(matchesSearch(haystack, '   '));
});
