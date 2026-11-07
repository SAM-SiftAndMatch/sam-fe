const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
function load() {
  const exports = {};
  const writes = [];
  const navigations = [];
  const tokenManager = {
    getToken: () => 'PRIVATE_ACCESS_TOKEN',
    decodePayload: () => ({ user_id: 'payer' }),
  };
  vm.runInNewContext(
    ts.transpileModule(fs.readFileSync('src/lib/checkout.ts', 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    }).outputText,
    {
      exports,
      module: { exports },
      require: () => ({ tokenManager }),
      URL,
      sessionStorage: { setItem: (k, v) => writes.push([k, v]) },
      window: { location: { assign: (url) => navigations.push(url) } },
    }
  );
  return { ...exports, writes, navigations };
}
const id = '01234567-89ab-cdef-0123-456789abcdef';
test('checkout accepts only provider HTTPS URLs and never writes auth credentials to navigation storage', () => {
  const h = load();
  h.beginCheckout(
    { orderId: id, checkoutUrl: 'https://payment.pay2s.vn/pay/test' },
    '/client/pricing'
  );
  assert.equal(h.navigations[0], 'https://payment.pay2s.vn/pay/test');
  assert.equal(JSON.parse(h.writes[0][1]).orderId, id);
  assert.ok(!h.writes[0][1].includes('PRIVATE_ACCESS_TOKEN'));
});
test('external, userinfo, private and lookalike checkout destinations fail before navigation', () => {
  for (const url of [
    'https://attacker.example/pay',
    'http://payment.pay2s.vn/pay',
    'https://payment.pay2s.vn.attacker.example/pay',
    'https://private@payment.pay2s.vn/pay',
    'https://payment.pay2s.vn:444/pay',
  ]) {
    const h = load();
    assert.throws(() => h.beginCheckout({ orderId: id, checkoutUrl: url }, '/workspaces'));
    assert.equal(h.navigations.length, 0);
    assert.equal(h.writes.length, 0);
  }
});
test('return metadata cannot become an open redirect and malformed IDs do not navigate', () => {
  const h = load();
  h.beginCheckout({ orderId: id }, '//attacker.example');
  assert.equal(JSON.parse(h.writes[0][1]).returnTo, '/workspaces');
  assert.throws(() => h.beginCheckout({ orderId: 'not-an-order' }, '/client/pricing'));
  assert.equal(h.checkoutId(id.replaceAll('-', '')), id);
});
test('paid but pending fulfillment is never described as activated', () => {
  const h = load();
  assert.match(
    h.checkoutMessage({ paymentStatus: 'PAID', fulfillmentStatus: 'RETRY' }),
    /đang kích hoạt/
  );
  assert.match(
    h.checkoutMessage({ paymentStatus: 'PAID', fulfillmentStatus: 'APPLIED' }),
    /thành công/
  );
  assert.match(h.checkoutMessage({ paymentStatus: 'REVIEW' }), /đối soát/);
});
