const assert = require('node:assert/strict');
const test = require('node:test');
const { VIETNAM_BANKS, normalizeBankCode, isSupportedBankCode } = require('../src/lib/banks.ts');

test('legacy MB codes resolve to one supported bank', () => {
  for (const code of ['MB', 'MBB', ' mb ', ' mbb ']) {
    assert.equal(normalizeBankCode(code), 'MB');
    assert.equal(isSupportedBankCode(code), true);
  }
});

test('canonical codes remain stable and unique', () => {
  assert.equal(new Set(VIETNAM_BANKS.map((bank) => bank.code)).size, VIETNAM_BANKS.length);
  for (const bank of VIETNAM_BANKS) assert.equal(normalizeBankCode(bank.code), bank.code);
});

test('arbitrary input cannot become a supported bank', () => {
  for (const code of ['', 'NOTABANK', 'MB BANK', 'MB-BANK'])
    assert.equal(isSupportedBankCode(code), false);
});
