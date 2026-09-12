// Rounding and number formatting rules from SPEC.md §5.1.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatNumber, roundAmount, roundToStep, scaleFactor } from './scale.ts';

const grams = { convertible: true };

test('scale factor is chosen yield divided by base yield', () => {
  assert.equal(scaleFactor(6, 4), 1.5);
  assert.equal(scaleFactor(1, 4), 0.25);
});

test('roundToStep removes floating-point noise', () => {
  assert.equal(roundToStep(0.1 + 0.2, 0.05), 0.3);
  assert.equal(roundToStep(266.666, 10), 270);
});

test('weight and volume under 10: whole numbers, minimum 1', () => {
  assert.deepEqual(roundAmount(7.4, 'weight', grams), { value: 7, large: false });
  assert.deepEqual(roundAmount(0.3, 'volume', grams), { value: 1, large: false });
});

test('weight and volume from 10 to under 100: steps of 5', () => {
  assert.deepEqual(roundAmount(43, 'weight', grams), { value: 45, large: false });
  assert.deepEqual(roundAmount(12, 'weight', grams), { value: 10, large: false });
  assert.deepEqual(roundAmount(97.5, 'volume', grams), { value: 100, large: false });
});

test('weight and volume from 100 to under 1000: steps of 10', () => {
  assert.deepEqual(roundAmount(266.67, 'weight', grams), { value: 270, large: false });
  assert.deepEqual(roundAmount(994, 'weight', grams), { value: 990, large: false });
});

test('weight and volume from 1000: kg / l in steps of 0,05', () => {
  assert.deepEqual(roundAmount(1250, 'weight', grams), { value: 1.25, large: true });
  assert.deepEqual(roundAmount(1230, 'weight', grams), { value: 1.25, large: true });
  assert.deepEqual(roundAmount(1020, 'volume', grams), { value: 1, large: true });
  // 996 g rounds to 1000 g, which is shown as 1 kg
  assert.deepEqual(roundAmount(996, 'weight', grams), { value: 1, large: true });
});

test('weight units other than g / ml are never converted', () => {
  assert.deepEqual(roundAmount(1250, 'weight'), { value: 1250, large: false });
});

test('spoons: quarters, minimum ¼', () => {
  assert.deepEqual(roundAmount(1.6, 'spoon'), { value: 1.5, large: false });
  assert.deepEqual(roundAmount(1.7, 'spoon'), { value: 1.75, large: false });
  assert.deepEqual(roundAmount(0.1, 'spoon'), { value: 0.25, large: false });
});

test('counted items: halves from 1 upwards, eighths below 1, minimum ⅛', () => {
  assert.deepEqual(roundAmount(1.3, 'count'), { value: 1.5, large: false });
  assert.deepEqual(roundAmount(1.2, 'none'), { value: 1, large: false });
  assert.deepEqual(roundAmount(0.9, 'none'), { value: 0.875, large: false });
  assert.deepEqual(roundAmount(0.5, 'count'), { value: 0.5, large: false });
  assert.deepEqual(roundAmount(0.25, 'count'), { value: 0.25, large: false });
  assert.deepEqual(roundAmount(0.1, 'none'), { value: 0.125, large: false });
  assert.deepEqual(roundAmount(0.01, 'none'), { value: 0.125, large: false });
});

test('whole: whole numbers, halves round up, minimum 1', () => {
  assert.deepEqual(roundAmount(1.5, 'count', { whole: true }), { value: 2, large: false });
  assert.deepEqual(roundAmount(2.4, 'none', { whole: true }), { value: 2, large: false });
  assert.deepEqual(roundAmount(0.5, 'none', { whole: true }), { value: 1, large: false });
  assert.deepEqual(roundAmount(0.2, 'none', { whole: true }), { value: 1, large: false });
});

test('fraction style uses ⅛ ¼ ⅜ ½ ⅝ ¾ ⅞', () => {
  assert.equal(formatNumber(1.5, 'fraction'), '1½');
  assert.equal(formatNumber(0.25, 'fraction'), '¼');
  assert.equal(formatNumber(0.125, 'fraction'), '⅛');
  assert.equal(formatNumber(0.375, 'fraction'), '⅜');
  assert.equal(formatNumber(2.875, 'fraction'), '2⅞');
  assert.equal(formatNumber(0.75, 'fraction'), '¾');
  assert.equal(formatNumber(2, 'fraction'), '2');
  // not a quarter: falls back to a decimal comma
  assert.equal(formatNumber(1.1, 'fraction'), '1,1');
});

test('decimal style uses a comma and drops trailing zeros', () => {
  assert.equal(formatNumber(1.25, 'decimal'), '1,25');
  assert.equal(formatNumber(1.5, 'decimal'), '1,5');
  assert.equal(formatNumber(2, 'decimal'), '2');
  assert.equal(formatNumber(0.05, 'decimal'), '0,05');
});
