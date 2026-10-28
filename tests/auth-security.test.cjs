const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

function load(file, extras = {}) {
  const { outputText } = ts.transpileModule(readFileSync(path.join(__dirname, '../src/lib/', file), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  const context = { exports: {}, process: { env: {} }, AbortSignal, ...extras };
  vm.runInNewContext(outputText, context);
  return context.exports;
}

test('password policy counts Unicode code points and preserves spaces', () => {
  const { passwordPolicyError: error } = load('password-policy.ts');
  assert.ok(error('1234567'));
  assert.ok(error('a'.repeat(129)));
  assert.equal(error('🔐'.repeat(128)), null);
  assert.ok(error('🔐'.repeat(129)));
  assert.equal(error(' password '), null);
});

for (const status of [200, 401]) {
  test(`logout clears browser credentials only after server result ${status}`, async () => {
    const data = new Map([['pr_access_token', 'stolen-token'], ['pr_user', '{}']]);
    let called = false;
    const { logout } = load('auth-session.ts', {
      localStorage: { getItem: k => data.get(k), removeItem: k => data.delete(k) },
      fetch: async (url, options) => {
        assert.equal(data.get('pr_access_token'), 'stolen-token');
        assert.equal(url, 'http://localhost:8000/api/v1/auth/logout');
        assert.equal(options.method, 'POST');
        assert.equal(options.headers.Authorization, 'Bearer stolen-token');
        called = true;
        return { ok: status === 200, status };
      },
    });
    await logout();
    assert.equal(called, true);
    assert.equal(data.size, 0);
  });
}

for (const failure of ['network', 'http']) {
  test(`logout retains credentials for retry on ${failure} failure`, async () => {
    const removed = [];
    const { logout } = load('auth-session.ts', {
      localStorage: { getItem: () => 'token', removeItem: key => removed.push(key) },
      fetch: async () => {
        if (failure === 'network') throw new Error('offline');
        return { ok: false, status: 503 };
      },
    });
    await assert.rejects(logout());
    assert.deepEqual(removed, []);
  });
}
