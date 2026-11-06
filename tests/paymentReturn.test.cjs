const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { StaticRouter } = require('react-router-dom');

function load(file, dependency) {
  const exports = {};
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
      esModuleInterop: false,
    },
  }).outputText;
  vm.runInNewContext(code, {
    exports,
    module: { exports },
    require: dependency,
    atob,
    decodeURIComponent,
    Date,
    Set,
  });
  return exports;
}

function auth(role) {
  const payload = { user_id: 'payer', account_type: role, exp: 9999999999 };
  return {
    accessToken: `header.${Buffer.from(JSON.stringify(payload)).toString('base64url')}.signature`,
    userId: 'payer',
    email: 'payer@example.test',
    fullName: 'Test Payer',
    role,
  };
}

function storeHarness() {
  const tokenManager = load('src/lib/token-manager.ts', require).tokenManager;
  let resolveRefresh;
  let rejectRefresh;
  const pending = new Promise((resolve, reject) => {
    resolveRefresh = resolve;
    rejectRefresh = reject;
  });
  let refreshCalls = 0;
  const authApi = {
    refresh() {
      refreshCalls++;
      return pending.then((value) => {
        tokenManager.setToken(value.accessToken);
        return value;
      });
    },
    async login(data) {
      const value = auth(data.role);
      tokenManager.setToken(value.accessToken);
      return value;
    },
    async logout() {},
  };
  const store = load('src/stores/useAuthStore.ts', (name) => {
    if (name === '../api/auth') return { authApi };
    if (name === '../lib/token-manager') return { tokenManager };
    return require(name);
  }).useAuthStore;
  return { store, tokenManager, resolveRefresh, rejectRefresh, refreshCalls: () => refreshCalls };
}

for (const role of ['CLIENT', 'FREELANCER']) {
  test(`return reload shares one refresh and restores ${role} in memory`, async () => {
    const h = storeHarness();
    const first = h.store.getState().initAuth();
    const second = h.store.getState().initAuth();
    assert.equal(h.refreshCalls(), 1);
    assert.equal(first, second);
    assert.equal(h.store.getState().isLoading, true);
    const response = auth(role);
    h.resolveRefresh(response);
    await Promise.all([first, second]);
    assert.equal(h.store.getState().isAuthenticated, true);
    assert.equal(h.store.getState().isLoading, false);
    assert.equal(h.store.getState().user.role, role);
    assert.equal(h.tokenManager.getToken(), response.accessToken);
  });
}

test('failed cookie restoration finishes loading without claiming an authenticated session', async () => {
  const h = storeHarness();
  const pending = h.store.getState().initAuth();
  h.rejectRefresh(new Error('Refresh cookie expired'));
  await pending;
  assert.equal(h.store.getState().isLoading, false);
  assert.equal(h.store.getState().isAuthenticated, false);
  assert.equal(h.tokenManager.getToken(), null);
});

test('a stale bootstrap failure cannot clear a newer login', async () => {
  const h = storeHarness();
  const pending = h.store.getState().initAuth();
  await h.store.getState().login({ role: 'FREELANCER' });
  const token = h.tokenManager.getToken();
  h.rejectRefresh(new Error('Obsolete refresh request'));
  await pending;
  assert.equal(h.store.getState().isAuthenticated, true);
  assert.equal(h.tokenManager.getToken(), token);
});

function renderReturn(role, isAuthenticated = true, isLoading = false) {
  const state = { user: role ? { role } : null, isAuthenticated, isLoading };
  const guards = {};
  const routes = load('src/routes/index.tsx', (name) => {
    if (name === '../stores/useAuthStore') return { useAuthStore: () => state };
    if (name === './paths') return load('src/routes/paths.ts', require);
    if (name.startsWith('../components/guards/')) {
      const file = `src/${name.slice(3)}.tsx`;
      if (!guards[file]) {
        guards[file] = load(file, (dependency) => {
          if (dependency === '../../stores/useAuthStore') return { useAuthStore: () => state };
          if (dependency === '../../routes/paths') return load('src/routes/paths.ts', require);
          if (dependency === '../../lib/google-auth') return { hasGoogleLinkPending: () => false };
          if (dependency === '../LoadingScreen') {
            return { default: () => React.createElement('span', null, 'RESTORING_SESSION') };
          }
          return require(dependency);
        });
      }
      return guards[file];
    }
    if (name.startsWith('../pages/') || name === '../components/LoadingScreen') {
      return { default: () => React.createElement('span', null, path.basename(name)) };
    }
    return require(name);
  });
  return renderToStaticMarkup(
    React.createElement(
      StaticRouter,
      { location: '/payment/return' },
      React.createElement(routes.default)
    )
  );
}

for (const role of ['CLIENT', 'FREELANCER']) {
  test(`the actual return route accepts authenticated ${role}`, () => {
    assert.match(renderReturn(role), /PaymentReturnPage/);
  });
}
test('payment return is reachable from the mobile browser without a web session', () => {
  assert.match(renderReturn(null, false), /PaymentReturnPage/);
});
