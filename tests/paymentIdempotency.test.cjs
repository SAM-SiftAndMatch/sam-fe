const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
function load(storage = new Map()) {
  const exports = {};
  let next = 0;
  vm.runInNewContext(
    ts.transpileModule(fs.readFileSync('src/lib/payment-idempotency.ts', 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    }).outputText,
    {
      exports,
      module: { exports },
      crypto: { randomUUID: () => `01234567-89ab-cdef-0123-${String(++next).padStart(12, '0')}` },
      localStorage: {
        getItem: (k) => storage.get(k) || null,
        setItem: (k, v) => storage.set(k, v),
        removeItem: (k) => storage.delete(k),
      },
    }
  );
  return exports;
}
test('network retries and page reload reuse the purchase key while accounts stay isolated', () => {
  const storage = new Map();
  const a = load(storage);
  const scope = a.paymentScope('/subscriptions/purchase', 'POST', {
    packageId: 'pro',
    returnUrl: 'one',
  });
  const key = a.paymentRequestKey('owner-a', scope);
  assert.equal(a.paymentRequestKey('owner-a', scope), key);
  assert.equal(load(storage).paymentRequestKey('owner-a', scope), key);
  assert.notEqual(a.paymentRequestKey('owner-b', scope), key);
  assert.equal(
    scope,
    a.paymentScope('/subscriptions/purchase', 'POST', { packageId: 'pro', returnUrl: 'two' })
  );
});
test('an old paid order cannot clear the key for a newer purchase', () => {
  const storage = new Map();
  const a = load(storage);
  const scope = '/subscriptions/purchase:pro:';
  const old = a.paymentRequestKey('owner', scope);
  a.observePaymentResult('owner', scope, old, { orderId: 'old-order', paymentStatus: 'CREATING' });
  storage.set(`sam:payment-key:owner:${scope}`, '01234567-89ab-cdef-0123-999999999999');
  a.observePaymentResult('owner', null, undefined, { orderId: 'old-order', paymentStatus: 'PAID' });
  assert.equal(
    storage.get(`sam:payment-key:owner:${scope}`),
    '01234567-89ab-cdef-0123-999999999999'
  );
});
