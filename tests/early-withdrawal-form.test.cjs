const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const React = require('react');
const { earlyRequestError, evidenceError } = require('../src/lib/early-withdrawal.ts');

function harness({
  reason = 'Cần tiền gấp',
  files = [{ name: 'proof.png', type: 'image/png', size: 1000 }],
  fail = false,
} = {}) {
  const states = ['50000', 'bank-a', reason, files, 'secret', false, ''];
  const requests = [];
  let created = 0;
  let index = 0;
  const exports = {};
  vm.runInNewContext(
    ts.transpileModule(fs.readFileSync('src/components/finance/EarlyWithdrawalForm.tsx', 'utf8'), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
        jsx: ts.JsxEmit.ReactJSX,
      },
    }).outputText,
    {
      exports,
      crypto: { randomUUID: () => 'stable-key' },
      require(name) {
        if (name === 'react')
          return {
            ...React,
            useEffect: () => {},
            useRef: (value) => ({ current: value }),
            useState: () => {
              const position = index++;
              return [
                states[position],
                (value) => {
                  states[position] = value;
                },
              ];
            },
          };
        if (name.endsWith('/api/finance'))
          return {
            dateTime: String,
            money: String,
            financeError: (e) => e.message,
            financeApi: {
              requestEarly: async (...args) => {
                requests.push(args);
                if (fail) throw new Error('Không lưu được ảnh');
                return { id: 'request-a' };
              },
            },
          };
        if (name.endsWith('/early-withdrawal')) return { earlyRequestError, evidenceError };
        if (name.endsWith('/FinanceUI'))
          return {
            Modal: () => null,
            Field: () => null,
            Notice: () => null,
            inputClass: '',
            primaryClass: '',
            secondaryClass: '',
          };
        return require(name);
      },
    }
  );
  const element = exports.default({
    payable: {
      id: 'payable-a',
      jobTitle: 'Project',
      earlyAvailableAmount: 90000,
      availableAt: '2026-11-30',
    },
    banks: [{ id: 'bank-a', status: 'VERIFIED' }],
    minimum: 50000,
    onClose() {},
    onCreated() {
      created++;
    },
  });
  function find(node) {
    if (!React.isValidElement(node)) return null;
    if (node.type === 'form') return node;
    for (const child of React.Children.toArray(node.props.children)) {
      const found = find(child);
      if (found) return found;
    }
    return null;
  }
  return {
    states,
    requests,
    get created() {
      return created;
    },
    submit: async () => {
      find(element).props.onSubmit({ preventDefault() {} });
      await new Promise(setImmediate);
    },
  };
}

test('missing reason or proof cannot submit an early withdrawal', async () => {
  for (const input of [{ reason: ' ' }, { files: [] }]) {
    const h = harness(input);
    await h.submit();
    assert.equal(h.requests.length, 0);
    assert.ok(h.states[6]);
    assert.equal(h.created, 0);
  }
});

test('successful request sends the chosen project, amount, reason, proof and stable retry key', async () => {
  const h = harness();
  await h.submit();
  assert.equal(h.requests.length, 1);
  assert.deepEqual(
    { ...h.requests[0][0] },
    {
      bankAccountId: 'bank-a',
      requestKey: 'stable-key',
      payableId: 'payable-a',
      amount: 50000,
      reason: 'Cần tiền gấp',
      password: 'secret',
    }
  );
  assert.equal(h.requests[0][1].length, 1);
  assert.equal(h.created, 1);
  assert.equal(h.states[4], '');
});

test('failed evidence persistence leaves the request form open and does not report success', async () => {
  const h = harness({ fail: true });
  await h.submit();
  assert.equal(h.created, 0);
  assert.equal(h.states[6], 'Không lưu được ảnh');
  assert.equal(h.states[5], false);
});
