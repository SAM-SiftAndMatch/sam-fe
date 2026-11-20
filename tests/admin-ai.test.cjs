const assert = require('node:assert/strict');
const test = require('node:test');
const {
  validatePriority,
  validateApiKeyInput,
  validateModelNameInput,
  buildPriorityMove,
  formatAiTestTime,
} = require('../src/lib/admin-ai.ts');

test('validates priority range 0..10000 integers', () => {
  assert.deepEqual(validatePriority('0'), { value: 0, error: '' });
  assert.deepEqual(validatePriority('10000'), { value: 10000, error: '' });
  assert.notEqual(validatePriority('-1').error, '');
  assert.notEqual(validatePriority('10001').error, '');
  assert.notEqual(validatePriority('12.5').error, '');
  assert.notEqual(validatePriority('abc').error, '');
});

test('validates api key and model name constraints', () => {
  assert.notEqual(validateApiKeyInput('   '), '');
  assert.notEqual(validateApiKeyInput('x'.repeat(2001)), '');
  assert.equal(validateApiKeyInput('AIzaSyValidKey123'), '');

  assert.notEqual(validateModelNameInput(''), '');
  assert.notEqual(validateModelNameInput('gemini 2.5'), '');
  assert.notEqual(validateModelNameInput('x'.repeat(121)), '');
  assert.equal(validateModelNameInput('gemini-2.5-flash'), '');
});

test('buildPriorityMove swaps distinct priorities and nudges tied priorities', () => {
  const distinct = [
    { id: 1, priority: 10 },
    { id: 2, priority: 20 },
    { id: 3, priority: 30 },
  ];
  assert.deepEqual(buildPriorityMove(distinct, 1, 'up'), [
    { id: 2, priority: 10 },
    { id: 1, priority: 20 },
  ]);
  assert.deepEqual(buildPriorityMove(distinct, 0, 'up'), []);

  const tied = [
    { id: 1, priority: 100 },
    { id: 2, priority: 100 },
  ];
  assert.deepEqual(buildPriorityMove(tied, 1, 'up'), [{ id: 2, priority: 99 }]);
  assert.deepEqual(buildPriorityMove(tied, 0, 'down'), [{ id: 1, priority: 101 }]);
});

test('formatAiTestTime handles null and valid ISO timestamps', () => {
  assert.equal(formatAiTestTime(null), 'Chưa test');
  assert.equal(formatAiTestTime('invalid'), 'Chưa test');
  assert.notEqual(formatAiTestTime('2026-11-20T09:00:00Z'), 'Chưa test');
});
