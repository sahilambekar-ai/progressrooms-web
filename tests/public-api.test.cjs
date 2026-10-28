// Offline unit tests using the already-installed TypeScript compiler and Node runner.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

function loadApi(fetch) {
  const source = readFileSync(path.join(__dirname, '../src/lib/api.ts'), 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  const context = { exports: {}, process: { env: { API_URL: 'https://backend.example/api/v1' } }, fetch, AbortSignal,
    console: { error() {} } };
  vm.runInNewContext(outputText, context, { filename: 'src/lib/api.ts' });
  return context.exports;
}

for (const [name, args, suffix] of [
  ['fetchPublicOrganization', ['studio'], '/public/organizations/studio'],
  ['fetchPublicSession', ['studio', 'yoga'], '/public/organizations/studio/classes/yoga'],
]) {
  test(`${name}: sends the public route and returns response data`, async () => {
    const payload = { id: 'example', name: 'योग' };
    const api = loadApi(async (url, init) => {
      assert.equal(url, `https://backend.example/api/v1${suffix}`);
      assert.equal(init.cache, 'no-store');
      assert.ok(init.signal instanceof AbortSignal);
      return { ok: true, json: async () => payload };
    });
    assert.equal(await api[name](...args), payload);
  });

  test(`${name}: maps absent resources to null`, async () => {
    const api = loadApi(async () => ({ ok: false, status: 404 }));
    assert.equal(await api[name](...args), null);
  });

  test(`${name}: exposes service outages to the error boundary`, async () => {
      const api = loadApi(async () => ({ ok: false, status: 503 }));
      await assert.rejects(api[name](...args));
    });
  test(`${name}: exposes network errors to the error boundary`, async () => {
    const api = loadApi(async () => { throw new Error('connection failed'); });
    await assert.rejects(api[name](...args), /connection failed/);
  });
}
