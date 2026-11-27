const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const { File } = require('node:buffer');

test('payment confirmation uploads images and metadata together without a public evidence URL', async () => {
  const requests = [];
  const exportsObject = {};
  const client = {
    post: async (...args) => {
      requests.push(args);
      return { data: { result: true } };
    },
  };
  vm.runInNewContext(
    ts.transpileModule(fs.readFileSync('src/api/finance.ts', 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    }).outputText,
    {
      exports: exportsObject,
      FormData,
      Blob,
      require(name) {
        if (name === 'axios') return { isAxiosError: () => false };
        if (name.endsWith('/axios')) return { __esModule: true, default: client };
        if (name.endsWith('/api-error'))
          return { requireApiResult: (value) => value.result, extractApiResponse: () => null };
        throw new Error(`Unexpected module: ${name}`);
      },
    }
  );
  const file = new File(['receipt'], 'mb-receipt.png', { type: 'image/png' });
  await exportsObject.financeApi.confirmManualPayment(
    'withdrawal-a',
    { password: 'secret', bankReference: 'MB123', note: 'Đã đối chiếu' },
    [file]
  );
  assert.equal(requests.length, 1);
  const [path, body, options] = requests[0];
  assert.equal(path, '/finance/admin/withdrawals/withdrawal-a/confirm-manual-payment');
  assert.deepEqual(JSON.parse(await body.get('request').text()), {
    password: 'secret',
    bankReference: 'MB123',
    note: 'Đã đối chiếu',
  });
  assert.equal(body.getAll('images').length, 1);
  assert.equal(body.get('images').name, 'mb-receipt.png');
  assert.equal(options.timeout, 60000);
  assert.equal(options.headers['Content-Type'], 'multipart/form-data');
});
