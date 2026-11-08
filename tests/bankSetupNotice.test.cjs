const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
function render(query, role = 'FREELANCER') {
  const exports = {};
  const code = ts.transpileModule(
    fs.readFileSync('src/components/finance/BankSetupNotice.tsx', 'utf8'),
    {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
        jsx: ts.JsxEmit.ReactJSX,
      },
    }
  ).outputText;
  const result = { isPending: false, isError: false, refetch() {}, ...query };
  vm.runInNewContext(code, {
    exports,
    module: { exports },
    require(name) {
      if (name === '@tanstack/react-query') return { useQuery: () => result };
      if (name.endsWith('/useAuthStore'))
        return { useAuthStore: (select) => select({ user: { userId: 'user-1', role } }) };
      if (name === 'react-router-dom')
        return {
          Link: ({ to, children, ...props }) =>
            React.createElement('a', { href: to, ...props }, children),
        };
      if (name.endsWith('/api/finance')) return { financeApi: { bankSetup() {} } };
      if (name.endsWith('/routes/paths'))
        return { PATH_FREELANCER_EARNINGS: '/freelancer/earnings' };
      if (name === './FinanceUI') return { secondaryClass: 'button' };
      return require(name);
    },
  });
  return renderToStaticMarkup(React.createElement(exports.default));
}
test('missing bank account links directly to adding bank details', () => {
  const html = render({ data: { status: 'ACTION_REQUIRED' } });
  assert.match(html, /Bổ sung tài khoản ngân hàng/);
  assert.match(html, /tab=banks&amp;action=add-bank/);
});
test('submitted account shows verification status instead of asking to add again', () => {
  const html = render({ data: { status: 'PENDING' } });
  assert.match(html, /đang chờ xác minh/);
  assert.doesNotMatch(html, /action=add-bank/);
});
test('verified account and client homepage never show the reminder', () => {
  assert.equal(render({ data: { status: 'READY' } }), '');
  assert.equal(render({ data: { status: 'ACTION_REQUIRED' } }, 'CLIENT'), '');
});
test('failed and loading lookups do not claim that the bank account is missing', () => {
  assert.equal(render({ isPending: true }), '');
  const html = render({ isError: true });
  assert.match(html, /Chưa kiểm tra được/);
  assert.doesNotMatch(html, /action=add-bank/);
});
