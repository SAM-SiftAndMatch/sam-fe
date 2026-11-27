const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const React = require('react');
const { mountToastHost } = require('../src/lib/toast-host.ts');

function harness(options = {}) {
  const states = options.cases
    ? [0, { id: 'case-a', state: 'OPEN' }, 'CLAIM', 'secret', '', '', false]
    : [
        0,
        { id: 'bank-a', type: options.action || 'verify' },
        'secret',
        '',
        '',
        options.receiptFiles || [],
        false,
        '',
        null,
        null,
        '',
        null,
        false,
      ];
  if (options.busy) states[6] = true;
  const notifications = [];
  const requests = [];
  const invalidations = [];
  let index = 0;
  const exports = {};
  const source = fs.readFileSync(
    require.resolve(
      options.cases
        ? '../src/components/finance/PaymentCasesPanel.tsx'
        : '../src/pages/AdminFinancePage.tsx'
    ),
    'utf8'
  );
  vm.runInNewContext(
    ts.transpileModule(source, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
        jsx: ts.JsxEmit.ReactJSX,
      },
    }).outputText,
    {
      exports,
      require(name) {
        if (name === 'react')
          return {
            ...React,
            useEffect: () => {},
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
        if (name === 'react-toastify')
          return {
            toast: Object.fromEntries(
              ['success', 'error', 'warning'].map((type) => [
                type,
                (message) => notifications.push({ type, message }),
              ])
            ),
          };
        if (name === '@tanstack/react-query')
          return {
            useQuery: () => ({ data: [], isError: false, isPending: false }),
            useQueryClient: () => ({
              invalidateQueries: async (...args) => {
                invalidations.push(args);
                if (options.refreshFails) throw new Error('refresh failed');
              },
            }),
          };
        if (name === 'react-router-dom') return { useParams: () => ({ section: 'banks' }) };
        if (name.endsWith('/useAuthStore'))
          return {
            useAuthStore: (selector) => selector({ user: { role: 'ADMIN', userId: 'admin-a' } }),
          };
        if (name.endsWith('/api/finance'))
          return {
            financeApi: {
              confirmManualPayment: async (...args) => {
                requests.push(['receipt-upload', ...args]);
                if (options.apiFails) throw new Error('Không lưu được biên lai.');
                return true;
              },
            },
            financePost: async (...args) => {
              requests.push(args);
              if (options.apiFails) throw new Error('Mật khẩu không đúng.');
              return { accountNumber: '123456789', accountHolder: 'NGUYEN VAN A' };
            },
            financeGet: async () => [],
            financeError: (error) => error.message,
            statusLabel: {},
            dateTime: String,
            money: String,
          };
        if (name.endsWith('/FinanceUI'))
          return {
            Field: () => null,
            Modal: () => null,
            Notice: () => null,
            inputClass: '',
            primaryClass: '',
            secondaryClass: '',
          };
        if (name.endsWith('/AdminUI')) return { AdminPageHeader: () => null };
        if (
          name.endsWith('/MaintenancePanel') ||
          name.endsWith('/PaymentCasesPanel') ||
          name.endsWith('/WithdrawalEvidence') ||
          name.endsWith('/PayoutReceiptUpload')
        )
          return { default: () => null, PayoutReceipts: () => null };
        if (name.endsWith('/early-withdrawal')) return require('../src/lib/early-withdrawal.ts');
        return require(name);
      },
    }
  );
  const element = options.cases
    ? exports.default({ owner: 'admin-a' })
    : (() => {
        const page = exports.default();
        return page.type(page.props);
      })();
  return { element, notifications, requests, invalidations, states };
}

function findForm(element) {
  if (!React.isValidElement(element)) return null;
  if (element.type === 'form') return element;
  for (const child of React.Children.toArray(element.props.children)) {
    const form = findForm(child);
    if (form) return form;
  }
  return null;
}

async function submit(h) {
  findForm(h.element).props.onSubmit({ preventDefault() {} });
  await new Promise(setImmediate);
}

test('bank verification shows success, closes the form and clears the password', async () => {
  const h = harness();
  await submit(h);
  assert.equal(h.notifications.length, 1);
  assert.equal(h.notifications[0].type, 'success');
  assert.match(h.notifications[0].message, /Đã xác minh tài khoản ngân hàng/);
  assert.equal(h.states[1], null);
  assert.equal(h.states[2], '');
  assert.equal(h.requests[0][0], '/finance/admin/bank-accounts/bank-a/verify');
  assert.equal(h.requests[0][1].approved, true);
  assert.equal(h.invalidations[0][1].throwOnError, true);
});

test('failed authentication keeps the form open and reports the server error', async () => {
  const h = harness({ apiFails: true });
  await submit(h);
  assert.deepEqual(h.notifications, [{ type: 'error', message: 'Mật khẩu không đúng.' }]);
  assert.equal(h.states[1].id, 'bank-a');
  assert.equal(h.states[7], 'Mật khẩu không đúng.');
  assert.equal(h.states[2], '');
  assert.equal(h.invalidations.length, 0);
});

test('a failed refresh cannot report a completed approval as a failed payment action', async () => {
  const h = harness({ action: 'approve', refreshFails: true });
  await submit(h);
  assert.deepEqual(
    h.notifications.map((item) => item.type),
    ['success', 'warning']
  );
  assert.match(h.notifications[0].message, /chờ chuyển khoản/);
  assert.equal(h.requests.length, 1);
  assert.equal(h.states[1], null);
});

test('viewing bank details never puts private beneficiary data into a toast', async () => {
  const h = harness({ action: 'reveal-bank' });
  await submit(h);
  assert.equal(h.states[8].accountNumber, '123456789');
  assert.equal(h.notifications[0].type, 'success');
  assert.doesNotMatch(h.notifications[0].message, /123456789|NGUYEN VAN A|secret/);
});

test('payment-case actions also notify success and distinguish refresh failures', async () => {
  const h = harness({ cases: true, refreshFails: true });
  await submit(h);
  assert.deepEqual(
    h.notifications.map((item) => item.type),
    ['success', 'warning']
  );
  assert.equal(h.states[1], null);
  assert.equal(h.states[3], '');
});

test('confirming payment requires receipt images and sends files with the bank reference', async () => {
  const missing = harness({ action: 'confirm-manual-payment' });
  await submit(missing);
  assert.equal(missing.requests.length, 0);
  assert.match(missing.states[7], /ảnh bằng chứng/);
  const files = [{ name: 'receipt.png', type: 'image/png', size: 1000 }];
  const h = harness({ action: 'confirm-manual-payment', receiptFiles: files });
  await submit(h);
  assert.equal(h.requests[0][0], 'receipt-upload');
  assert.equal(h.requests[0][1], 'bank-a');
  assert.equal(h.requests[0][3], files);
  assert.equal(h.states[1], null);
  assert.equal(h.states[5].length, 0);
  assert.match(h.notifications[0].message, /chi trả thành công/);
});

test('receipt upload failures preserve the pending operation and selected images for retry', async () => {
  const files = [{ name: 'receipt.png', type: 'image/png', size: 1000 }];
  const h = harness({ action: 'confirm-manual-payment', receiptFiles: files, apiFails: true });
  await submit(h);
  assert.equal(h.states[1].type, 'confirm-manual-payment');
  assert.equal(h.states[5], files);
  assert.equal(h.invalidations.length, 0);
  assert.deepEqual(h.notifications, [{ type: 'error', message: 'Không lưu được biên lai.' }]);
});

test('toasts stay inside the focused modal and survive closing or removing it', () => {
  const original = global.MutationObserver;
  let changed;
  let disconnected = false;
  global.MutationObserver = class {
    constructor(callback) {
      changed = callback;
    }
    observe() {}
    disconnect() {
      disconnected = true;
    }
  };
  const target = (name) => ({
    name,
    appendChild(node) {
      node.parentElement = this;
    },
  });
  const body = target('body');
  const first = target('first dialog');
  const second = target('second dialog');
  let dialogs = [];
  const page = {
    body,
    activeElement: null,
    querySelectorAll: () => ({ length: dialogs.length, item: (index) => dialogs[index] ?? null }),
  };
  const host = {
    parentElement: null,
    remove() {
      this.parentElement = null;
    },
  };
  try {
    const stop = mountToastHost(host, page);
    assert.equal(host.parentElement, body);
    dialogs = [first, second];
    page.activeElement = { closest: () => first };
    changed();
    assert.equal(host.parentElement, first);
    page.activeElement = { closest: () => second };
    changed();
    assert.equal(host.parentElement, second);
    // The dialog and host have been removed by React; the same portal host must be restored.
    host.parentElement = null;
    dialogs = [];
    page.activeElement = null;
    changed();
    assert.equal(host.parentElement, body);
    stop();
    assert.equal(disconnected, true);
    assert.equal(host.parentElement, null);
  } finally {
    global.MutationObserver = original;
  }
});
