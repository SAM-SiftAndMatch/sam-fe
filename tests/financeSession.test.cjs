const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
function load() {
  const exports = {};
  vm.runInNewContext(
    ts.transpileModule(fs.readFileSync('src/lib/token-manager.ts', 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    }).outputText,
    { exports, module: { exports }, atob, decodeURIComponent, Date, Set }
  );
  return exports.tokenManager;
}
function jwt(user, session, role = 'FREELANCER') {
  return `header.${Buffer.from(JSON.stringify({ user_id: user, session_id: session, account_type: role, exp: 9999999999 })).toString('base64url')}.signature`;
}
test('refresh rotation keeps request identity but reconnects authenticated sockets', () => {
  const manager = load();
  manager.setToken(jwt('a', 'session-1'));
  const epoch = manager.getSessionEpoch();
  let refreshes = 0;
  const unsubscribe = manager.subscribe(() => refreshes++);
  manager.setToken(jwt('a', 'session-2'));
  assert.equal(manager.getSessionEpoch(), epoch);
  assert.equal(refreshes, 1);
  unsubscribe();
  manager.setToken(jwt('a', 'session-3'));
  assert.equal(refreshes, 1);
});
test('switching user, role or logout invalidates in-flight financial requests', () => {
  const manager = load();
  manager.setToken(jwt('a', '1'));
  let epoch = manager.getSessionEpoch();
  manager.setToken(jwt('b', '2'));
  assert.ok(manager.getSessionEpoch() > epoch);
  epoch = manager.getSessionEpoch();
  manager.setToken(jwt('b', '2', 'CLIENT'));
  assert.ok(manager.getSessionEpoch() > epoch);
  epoch = manager.getSessionEpoch();
  manager.clearToken();
  assert.ok(manager.getSessionEpoch() > epoch);
  assert.equal(manager.getToken(), null);
});
