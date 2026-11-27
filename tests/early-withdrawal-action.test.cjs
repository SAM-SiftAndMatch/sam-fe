const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { earlyWithdrawalBlockReason } = require('../src/lib/early-withdrawal.ts');

const exportsObject = {};
vm.runInNewContext(
  ts.transpileModule(fs.readFileSync('src/components/finance/EarlyWithdrawalAction.tsx', 'utf8'), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
    },
  }).outputText,
  {
    exports: exportsObject,
    require(name) {
      if (name.endsWith('/early-withdrawal')) return { earlyWithdrawalBlockReason };
      if (name.endsWith('/FinanceUI')) return { secondaryClass: 'action' };
      return require(name);
    },
  }
);

function render(payableChanges = {}, walletChanges = {}) {
  const now = Date.now();
  return renderToStaticMarkup(
    React.createElement(exportsObject.default, {
      payable: {
        sandbox: false,
        blocked: false,
        acceptedAt: new Date(now - 86400000).toISOString(),
        availableAt: new Date(now + 86400000).toISOString(),
        canRequestEarly: true,
        earlyAvailableAmount: 90000,
        ...payableChanges,
      },
      wallet: { withdrawalsEnabled: true, minimumWithdrawal: 50000, ...walletChanges },
      onRequest() {},
      onViewRequest() {},
    })
  );
}

test('early withdrawal button stays visible with an accessible reason when payouts are closed', () => {
  const html = render({}, { withdrawalsEnabled: false });
  assert.match(html, /Xin rút tiền sớm/);
  assert.match(html, /disabled=""/);
  assert.match(html, /aria-describedby="[^"]+"/);
  assert.match(html, /SAM chưa mở chức năng chi trả ngân hàng/);
});

test('eligible project exposes an enabled early withdrawal action', () => {
  const html = render();
  assert.match(html, /Xin rút tiền sớm/);
  assert.doesNotMatch(html, /disabled=/);
});

test('existing request remains accessible while payout creation is closed', () => {
  const html = render({ earlyRequestId: 'request-a' }, { withdrawalsEnabled: false });
  assert.match(html, /Xem ticket rút sớm đang xử lý/);
  assert.doesNotMatch(html, /disabled=/);
  assert.doesNotMatch(html, /Xin rút tiền sớm/);
});
