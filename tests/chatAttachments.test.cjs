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
  vm.runInNewContext(code, {
    exports,
    module: { exports },
    require: dependency,
    crypto: require('node:crypto').webcrypto,
    FormData,
    Blob,
    URL,
  });
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
    policy.validateChatFiles(Array.from({ length: 3 }, () => file('x.mp4', 40 * 1024 * 1024))),
    /100MB/
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

test('shared history requests keep room, resource category and pagination separate', async () => {
  const calls = [];
  const page = { items: [], page: 2, size: 18, totalElements: 40, totalPages: 3, hasNext: false };
  const { chatApi } = load('src/api/chat.ts', (name) => {
    if (name === '../lib/axios')
      return {
        default: {
          get: async (...args) => {
            calls.push(args);
            return { data: { result: page } };
          },
        },
      };
    if (name === '../lib/api-error') return { requireApiResult: (response) => response.result };
    return require(name);
  });
  assert.equal(await chatApi.getSharedAttachments('room-a', 'files', 2), page);
  assert.equal(calls[0][0], '/chat/rooms/room-a/attachments');
  assert.equal(calls[0][1].params.type, 'files');
  assert.equal(calls[0][1].params.page, 2);
  assert.equal(calls[0][1].params.size, 18);
  await chatApi.getSharedAttachments('room-b', 'images');
  assert.equal(calls[1][0], '/chat/rooms/room-b/attachments');
  assert.equal(calls[1][1].params.type, 'images');
  assert.equal(calls[1][1].params.page, 0);
  assert.equal(await chatApi.getSharedLinks('room-a', 2), page);
  assert.equal(calls[2][0], '/chat/rooms/room-a/shared-links');
  assert.equal(calls[2][1].params.page, 2);
});

test('shared links safely ignore malformed, non-web and credential URLs', () => {
  const { parseSharedChatLink } = load('src/lib/chat-links.ts');
  for (const value of [
    'bad url',
    'https://',
    'javascript:alert(1)',
    'data:text/plain,test',
    'file:///tmp/file',
    'https://user:pass@example.com',
    'https://example.com:99999',
  ]) {
    assert.equal(parseSharedChatLink(value), null, value);
  }
  const link = parseSharedChatLink('https://example.com/docs?q=project#section');
  assert.equal(link.hostname, 'example.com');
  assert.equal(link.url, 'https://example.com/docs?q=project#section');
});

test('video limits accept MP4 and WebM and reject videos above 50MB', () => {
  assert.equal(policy.validateChatFiles([file('demo.mp4', 50 * 1024 * 1024)]), null);
  assert.equal(policy.validateChatFiles([file('demo.webm', 1024)]), null);
  assert.match(policy.validateChatFiles([file('large.mp4', 50 * 1024 * 1024 + 1)]), /50MB/);
});

test('chat separators use Vietnam hours, date transitions and explicit timestamp offsets', () => {
  const { chatSeparator, chatTime } = load('src/lib/chat-time.ts');
  assert.equal(chatTime('2026-11-24T06:05:00Z'), '13:05');
  assert.equal(chatSeparator('2026-11-24T07:10:00Z', '2026-11-24T06:48:00Z'), '14:10');
  assert.equal(chatSeparator('2026-11-24T07:20:00Z', '2026-11-24T07:10:00Z'), null);
  assert.equal(chatSeparator('2026-11-24T17:01:00Z', '2026-11-24T16:59:00Z'), '25/11/2026 · 00:01');
  assert.equal(chatSeparator('bad', null), null);
});

function outboxHarness(uploadAttachment = async () => ({ id: 'upload-a' })) {
  const auth = { user: { userId: 'user-a' } };
  const outbox = load('src/lib/chat-outbox.ts', (name) => {
    if (name === 'zustand')
      return {
        create: (initializer) => {
          let state = initializer();
          return {
            getState: () => state,
            setState: (update) => {
              state = { ...state, ...(typeof update === 'function' ? update(state) : update) };
            },
          };
        },
      };
    if (name === '../api/chat') return { chatApi: { uploadAttachment } };
    if (name === './api-error') return load('src/lib/api-error.ts');
    if (name === '../stores/useAuthStore')
      return { useAuthStore: { getState: () => auth, subscribe: () => () => {} } };
    return require(name);
  });
  return { ...outbox, auth };
}

test('outbox displays a message before acknowledgement and accepts another send immediately', async () => {
  const outbox = outboxHarness();
  let acknowledge;
  outbox.enqueueChatMessage({
    userId: 'user-a',
    roomId: 'room-a',
    content: 'first',
    files: [],
    send: () =>
      new Promise((resolve) => {
        acknowledge = resolve;
      }),
  });
  const first = outbox.useChatOutbox.getState().items[0];
  assert.equal(first.status, 'sending');
  outbox.enqueueChatMessage({
    userId: 'user-a',
    roomId: 'room-a',
    content: 'second',
    files: [],
    send: async () => ({ id: 'server-second' }),
  });
  assert.equal(outbox.useChatOutbox.getState().items.length, 2);
  acknowledge({ id: 'server-first', clientMessageId: first.id });
  await new Promise(setImmediate);
  assert.equal(outbox.useChatOutbox.getState().items[0].status, 'sent');
});

test('retry preserves request identity and already uploaded files after a lost response', async () => {
  let uploads = 0;
  const outbox = outboxHarness(async () => {
    uploads++;
    return { id: 'upload-a' };
  });
  const attempts = [];
  outbox.enqueueChatMessage({
    userId: 'user-a',
    roomId: 'room-a',
    content: 'attachment',
    files: [{ name: 'notes.txt', type: 'text/plain' }],
    send: async (input) => {
      attempts.push(input);
      if (attempts.length === 1) throw new Error('response lost');
      return { id: 'server-a', clientMessageId: input.clientMessageId };
    },
  });
  await new Promise(setImmediate);
  const failed = outbox.useChatOutbox.getState().items[0];
  assert.equal(failed.status, 'failed');
  await outbox.retryOutbox(failed.id);
  assert.equal(uploads, 1);
  assert.equal(attempts[0].clientMessageId, attempts[1].clientMessageId);
  assert.equal(attempts[1].attachmentIds[0], 'upload-a');
  assert.equal(outbox.useChatOutbox.getState().items[0].status, 'sent');
});

test('an oversized upload reports the server limit and stops before sending the message', async () => {
  const outbox = outboxHarness(async () => {
    throw { isAxiosError: true, response: { status: 413 } };
  });
  let sendCalls = 0;
  outbox.enqueueChatMessage({
    userId: 'user-a',
    roomId: 'room-a',
    content: '',
    files: [{ name: 'clip.mp4', type: '' }],
    send: async () => {
      sendCalls++;
    },
  });
  await new Promise(setImmediate);
  const [item] = outbox.useChatOutbox.getState().items;
  assert.equal(item.status, 'failed');
  assert.match(item.error, /vượt giới hạn dung lượng tải lên/);
  assert.equal(sendCalls, 0);
});

test('retry does not send under another account', async () => {
  const outbox = outboxHarness();
  let calls = 0;
  outbox.enqueueChatMessage({
    userId: 'user-a',
    roomId: 'room-a',
    content: 'private',
    files: [],
    send: async () => {
      calls++;
      throw new Error('offline');
    },
  });
  await new Promise(setImmediate);
  outbox.auth.user.userId = 'user-b';
  await outbox.retryOutbox(outbox.useChatOutbox.getState().items[0].id);
  assert.equal(calls, 1);
});
