const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
process.chdir(path.resolve(__dirname, '..'));
function load(file, dependency = require) {
  const exports = {};
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      esModuleInterop: false,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  vm.runInNewContext(code, { exports, module: { exports }, require: dependency, FormData, Blob });
  return exports;
}
const policy = load('src/lib/chat-attachments.ts');
const file = (name, size) => ({ name, size });

test('attachment limits apply to each file, image, file count and combined message size', () => {
  assert.equal(policy.validateChatFiles([file('photo.JPG', 5 * 1024 * 1024)]), null);
  assert.equal(policy.validateChatFiles([file('scope.pdf', 10 * 1024 * 1024)]), null);
  assert.match(policy.validateChatFiles([file('photo.png', 5 * 1024 * 1024 + 1)]), /5MB/);
  assert.match(policy.validateChatFiles([file('scope.pdf', 10 * 1024 * 1024 + 1)]), /10MB/);
  assert.match(
    policy.validateChatFiles(Array.from({ length: 6 }, () => file('x.txt', 1))),
    /5 tệp/
  );
  assert.match(
    policy.validateChatFiles(Array.from({ length: 3 }, () => file('x.zip', 10 * 1024 * 1024))),
    /25MB/
  );
  assert.equal(
    policy.validateChatFiles([
      file('a.pdf', 10 * 1024 * 1024),
      file('b.zip', 10 * 1024 * 1024),
      file('c.png', 5 * 1024 * 1024),
    ]),
    null
  );
});

test('dangerous or unsupported formats and empty uploads are rejected', () => {
  for (const name of ['image.svg', 'page.html', 'run.exe', 'no-extension', 'image.png.exe']) {
    assert.ok(policy.validateChatFiles([file(name, 100)]), name);
  }
  assert.match(policy.validateChatFiles([file('empty.txt', 0)]), /trống/);
  assert.equal(policy.isChatImage(file('test.WebP', 100)), true);
  assert.equal(policy.isChatImage(file('test.pdf', 100)), false);
});

test('REST sends attachment IDs and a stable retry identity and uploads as multipart', async () => {
  const calls = [];
  const result = { id: 'message-a', attachments: [{ id: 'file-a' }] };
  const apiClient = {
    post: async (...args) => {
      calls.push(args);
      return { data: { result } };
    },
    get: async (...args) => {
      calls.push(args);
      return { data: new Blob(['file']) };
    },
  };
  const { chatApi } = load('src/api/chat.ts', (name) => {
    if (name === '../lib/axios') return { default: apiClient };
    if (name === '../lib/api-error') return { requireApiResult: (response) => response.result };
    return require(name);
  });
  const input = { content: '', attachmentIds: ['file-a'], clientMessageId: 'retry-id' };
  assert.equal(await chatApi.sendMessage('room-a', input), result);
  assert.equal(calls[0][0], '/chat/rooms/room-a/messages');
  assert.equal(calls[0][1].clientMessageId, 'retry-id');
  assert.equal(calls[0][1].attachmentIds[0], 'file-a');
  await chatApi.uploadAttachment('room-a', new Blob(['test'], { type: 'text/plain' }));
  assert.equal(calls[1][2].headers['Content-Type'], 'multipart/form-data');
  await chatApi.getAttachmentBlob('room-a', 'file-a');
  assert.equal(calls[2][0], '/chat/rooms/room-a/attachments/file-a/content');
  assert.equal(calls[2][1].responseType, 'blob');
});

test('REST acknowledgement and websocket echo merge into a single attachment message', () => {
  const { appendConfirmedMessage } = load('src/pages/workspace-query.ts');
  const original = { pages: [{ items: [], nextCursor: null, hasMore: false }], pageParams: [null] };
  const message = {
    id: 'message-a',
    roomId: 'room-a',
    content: '',
    attachments: [{ id: 'file-a' }],
  };
  const confirmed = appendConfirmedMessage(original, message);
  const echoed = appendConfirmedMessage(confirmed, message);
  assert.equal(echoed.pages[0].items.length, 1);
  assert.equal(echoed.pages[0].items[0].attachments[0].id, 'file-a');
});
