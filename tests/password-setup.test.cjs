const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const router = require('react-router-dom');
const {
  BANK_PASSWORD_SETUP_RETURN,
  passwordSetupReturnTo,
  passwordSetupValidation,
} = require('../src/lib/password-setup.ts');

test('setup returns to the bank form and rejects external or unrelated destinations', () => {
  assert.equal(
    passwordSetupReturnTo(BANK_PASSWORD_SETUP_RETURN, 'FREELANCER'),
    BANK_PASSWORD_SETUP_RETURN
  );
  for (const target of [
    null,
    '//evil.test',
    'https://evil.test',
    '/\\evil.test',
    '/admin',
    '/login',
  ]) {
    assert.equal(passwordSetupReturnTo(target, 'FREELANCER'), '/freelancer/earnings?tab=banks');
    assert.equal(passwordSetupReturnTo(target, 'CLIENT'), '/client/dashboard');
  }
  assert.equal(passwordSetupReturnTo(BANK_PASSWORD_SETUP_RETURN, 'CLIENT'), '/client/dashboard');
});

test('password policy validates confirmation and the BCrypt UTF-8 boundary without trimming', () => {
  for (const password of ['', 'short', '        ', 'a'.repeat(73), 'ấ'.repeat(25)])
    assert.notEqual(passwordSetupValidation(password, password), '');
  for (const password of ['new-password', ' new-password ', 'a'.repeat(72), 'ấ'.repeat(24)])
    assert.equal(passwordSetupValidation(password, password), '');
  assert.notEqual(passwordSetupValidation('new-password', 'different'), '');
  assert.notEqual(passwordSetupValidation(' new-password ', 'new-password'), '');
});

function harness(options = {}) {
  const states = [];
  const storage = new Map();
  const calls = [];
  let index = 0;
  const query = {
    isPending: false,
    isError: false,
    data: { hasPassword: false, canSetup: true, googleConfirmed: false },
    refetch: async () => calls.push('refetch'),
    ...options.query,
  };
  const api = {
    passwordSetupStatus: async () => query.data,
    startPasswordSetup: async () => 'https://accounts.google.com/authorize',
    setupPassword: async (...args) => calls.push(args),
    ...options.api,
  };
  const source = ts.transpileModule(
    fs.readFileSync(require.resolve('../src/pages/PasswordSetupPage.tsx'), 'utf8'),
    {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
        jsx: ts.JsxEmit.ReactJSX,
      },
    }
  ).outputText;
  const exports = {};
  vm.runInNewContext(source, {
    exports,
    URLSearchParams,
    sessionStorage: {
      getItem: (key) => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, value),
      removeItem: (key) => storage.delete(key),
    },
    window: { location: { assign: (url) => calls.push(url) } },
    require(name) {
      if (name === 'react')
        return {
          ...React,
          useEffect: () => {},
          useState: (initial) => {
            const position = index++;
            if (!(position in states))
              states[position] =
                position in (options.states ?? {})
                  ? options.states[position]
                  : typeof initial === 'function'
                    ? initial()
                    : initial;
            return [
              states[position],
              (value) => {
                states[position] = value;
              },
            ];
          },
        };
      if (name === 'react-router-dom')
        return { ...router, useSearchParams: () => [new URLSearchParams(options.search)] };
      if (name === '@tanstack/react-query')
        return {
          useQuery: () => query,
          useQueryClient: () => ({
            setQueryData: (_key, value) => {
              query.data = value;
            },
          }),
        };
      if (name.endsWith('/api/auth')) return { authApi: api };
      if (name.endsWith('/useAuthStore'))
        return {
          useAuthStore: (selector) =>
            selector({ user: { userId: 'user-a', role: 'FREELANCER', email: 'user@gmail.com' } }),
        };
      if (name.endsWith('/FinanceUI'))
        return {
          Field: ({ label, children }) => React.createElement('label', null, label, children),
          Notice: ({ children, error }) =>
            React.createElement('div', { role: error ? 'alert' : 'status' }, children),
          inputClass: '',
          primaryClass: '',
          secondaryClass: '',
        };
      if (name.startsWith('../lib/')) return require(`../src/lib/${name.split('/').at(-1)}.ts`);
      return require(name);
    },
  });
  return {
    calls,
    states,
    query,
    storage,
    element() {
      index = 0;
      return exports.default();
    },
    html() {
      return renderToStaticMarkup(React.createElement(router.StaticRouter, null, this.element()));
    },
  };
}

function find(element, predicate) {
  if (!React.isValidElement(element)) return null;
  if (predicate(element)) return element;
  for (const child of React.Children.toArray(element.props.children)) {
    const found = find(child, predicate);
    if (found) return found;
  }
  return null;
}

test('verified query flag alone never reveals the password form', () => {
  const h = harness({ search: '?verified=1' });
  assert.match(h.html(), /Xác nhận tài khoản Google/);
  assert.doesNotMatch(h.html(), /type="password"/);
});

test('backend confirmation reveals new-password fields and return-to-bank link', () => {
  const h = harness({
    search: `?returnTo=${encodeURIComponent(BANK_PASSWORD_SETUP_RETURN)}`,
    query: { data: { hasPassword: false, canSetup: true, googleConfirmed: true } },
  });
  const html = h.html();
  assert.equal((html.match(/autoComplete="new-password"/g) || []).length, 2);
  assert.ok(html.includes('href="/freelancer/earnings?tab=banks&amp;action=add-bank"'));
});

test('existing password and status failures hide credential enrollment', () => {
  const existing = harness({
    query: { data: { hasPassword: true, canSetup: false, googleConfirmed: false } },
  });
  assert.match(existing.html(), /Tài khoản đã có mật khẩu SAM/);
  assert.doesNotMatch(existing.html(), /type="password"|Xác nhận tài khoản Google/);
  const failed = harness({ query: { isError: true, data: undefined } });
  assert.match(failed.html(), /Thử lại/);
  assert.doesNotMatch(failed.html(), /type="password"/);
});

test('Google confirmation preserves only the safe return destination', async () => {
  const h = harness({ search: `?returnTo=${encodeURIComponent(BANK_PASSWORD_SETUP_RETURN)}` });
  const button = find(h.element(), (node) => node.type === 'button');
  await button.props.onClick();
  // Finish the VM realm's async continuations before inspecting user-visible state.
  await new Promise(setImmediate);
  assert.deepEqual([...h.storage.values()], [BANK_PASSWORD_SETUP_RETURN]);
  assert.ok(h.calls.includes('https://accounts.google.com/authorize'));
});

test('successful setup sends the chosen password unchanged and clears both fields', async () => {
  const h = harness({
    query: { data: { hasPassword: false, canSetup: true, googleConfirmed: true } },
    states: { 1: ' new-password ', 2: ' new-password ' },
  });
  find(h.element(), (node) => node.type === 'form').props.onSubmit({ preventDefault() {} });
  await new Promise(setImmediate);
  assert.deepEqual(h.calls[0], [' new-password ', ' new-password ']);
  assert.equal(h.states[1], '');
  assert.equal(h.states[2], '');
  assert.match(h.html(), /Đã thiết lập mật khẩu SAM thành công/);
});

test('expired proof refetches status and clears entered passwords', async () => {
  const h = harness({
    query: { data: { hasPassword: false, canSetup: true, googleConfirmed: true } },
    states: { 1: 'new-password', 2: 'new-password' },
    api: {
      setupPassword: async () => {
        throw { response: { data: { message: 'Xác nhận Google đã hết hạn' } } };
      },
    },
  });
  find(h.element(), (node) => node.type === 'form').props.onSubmit({ preventDefault() {} });
  await new Promise(setImmediate);
  assert.ok(h.calls.includes('refetch'));
  assert.equal(h.states[1], '');
  assert.equal(h.states[2], '');
  assert.match(h.html(), /Xác nhận Google đã hết hạn/);
});
