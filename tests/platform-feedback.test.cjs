const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { randomUUID } = require('node:crypto');
const { feedbackValidation, feedbackFilters } = require('../src/lib/feedback.ts');

function compile(file, mocks = {}) {
  const exports = {};
  vm.runInNewContext(
    ts.transpileModule(fs.readFileSync(require.resolve(file), 'utf8'), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        esModuleInterop: false,
        target: ts.ScriptTarget.ES2022,
        jsx: ts.JsxEmit.ReactJSX,
      },
    }).outputText,
    {
      exports,
      crypto: { randomUUID },
      require(name) {
        if (name in mocks) return mocks[name];
        if (name === '../lib/feedback' || name === '../../lib/feedback')
          return require('../src/lib/feedback.ts');
        return require(name);
      },
    }
  );
  return exports;
}

test('feedback requires 1–5 whole stars and permits an optional bounded comment', () => {
  for (const rating of [0, -1, 6, 1.5, Number.NaN])
    assert.notEqual(feedbackValidation(rating, ''), '');
  for (const rating of [1, 2, 3, 4, 5]) assert.equal(feedbackValidation(rating, ''), '');
  assert.equal(feedbackValidation(4, 'x'.repeat(2000)), '');
  assert.notEqual(feedbackValidation(4, 'x'.repeat(2001)), '');
});

test('admin filters bound pagination and reject unsupported states without altering literal search', () => {
  const filters = feedbackFilters(
    new URLSearchParams('rating=5&status=NEW&q=100%25_%20done&page=2')
  );
  assert.equal(filters.get('rating'), '5');
  assert.equal(filters.get('status'), 'NEW');
  assert.equal(filters.get('q'), '100%_ done');
  assert.equal(filters.get('page'), '2');
  for (const page of ['-1', '100001', '1.5', 'NaN']) {
    const bad = feedbackFilters(
      new URLSearchParams({ rating: '6', status: '__proto__', q: 'x'.repeat(101), page })
    );
    assert.equal(bad.has('rating'), false);
    assert.equal(bad.has('status'), false);
    assert.equal(bad.get('page'), '0');
    assert.equal(bad.get('q').length, 100);
  }
});

test('rating control uses native labeled radios and readonly stars have accessible text', () => {
  const Rating = compile('../src/components/feedback/StarRating.tsx').default;
  const html = renderToStaticMarkup(React.createElement(Rating, { value: 3, onChange() {} }));
  assert.equal((html.match(/type="radio"/g) || []).length, 5);
  assert.equal((html.match(/checked=""/g) || []).length, 1);
  assert.match(html, /aria-label="3 sao: Bình thường"/);
  const readonly = renderToStaticMarkup(React.createElement(Rating, { value: 4 }));
  assert.match(readonly, /4 trên 5 sao/);
  assert.doesNotMatch(readonly, /type="radio"/);
});

function harness(options = {}) {
  const states = options.admin
    ? ['NEW', 'Ghi chú', false, '', false]
    : [5, '  Trải nghiệm tốt  ', false, '', 0];
  const ref = { current: randomUUID() };
  const requests = [];
  const notifications = [];
  const callbacks = [];
  let fail = options.fail;
  let index = 0;
  const query = {
    isPending: false,
    isError: false,
    data: { items: [], totalElements: 0, size: 10 },
    ...options.query,
  };
  const api = {
    create: async (input) => {
      requests.push(input);
      if (fail) throw { response: { data: { message: 'Không gửi được' } } };
      return {};
    },
    update: async (id, input) => {
      requests.push({ id, ...input });
      if (fail)
        throw {
          isAxiosError: true,
          response: { status: 409, data: { message: 'Đánh giá đã được cập nhật' } },
        };
      return {};
    },
    mine: async () => query.data,
  };
  const controls = {
    Field: ({ label, children }) => React.createElement('label', null, label, children),
    Notice: ({ children, error }) =>
      React.createElement('div', { role: error ? 'alert' : 'status' }, children),
    inputClass: '',
    primaryClass: '',
    secondaryClass: '',
  };
  const mocks = {
    react: {
      ...React,
      useRef: () => ref,
      useState: () => {
        const at = index++;
        return [
          states[at],
          (value) => {
            states[at] = value;
          },
        ];
      },
    },
    '@tanstack/react-query': {
      useQuery: () => query,
      useQueryClient: () => ({
        invalidateQueries: async () => {
          if (options.refreshFails) throw new Error('offline');
        },
      }),
    },
    'react-toastify': {
      toast: Object.fromEntries(
        ['success', 'error', 'warning'].map((type) => [
          type,
          (message) => notifications.push({ type, message }),
        ])
      ),
    },
    '../api/feedback': { feedbackApi: api },
    '../components/AppHeader': { default: () => null },
    '../components/Footer': { default: () => null },
    '../components/admin/AdminUI': { AdminPagination: () => null },
    '../components/finance/FinanceUI': controls,
    '../components/feedback/StarRating': {
      default: ({ value }) => React.createElement('span', null, `${value}/5`),
    },
    '../components/feedback/FeedbackStatusBadge': {
      default: ({ status }) => React.createElement('span', null, status),
    },
    '../stores/useAuthStore': {
      useAuthStore: (selector) => selector({ user: { userId: 'user-a' } }),
    },
  };
  const module = compile(
    options.admin ? '../src/pages/AdminFeedbackPage.tsx' : '../src/pages/FeedbackPage.tsx',
    mocks
  );
  const item = {
    id: 'feedback-a',
    version: 2,
    status: 'NEW',
    adminNote: 'Ghi chú',
    userRole: 'CLIENT',
    rating: 5,
    createdAt: '2026-11-19T10:00:00Z',
    updatedAt: '2026-11-19T10:00:00Z',
  };
  return {
    states,
    ref,
    requests,
    notifications,
    callbacks,
    retry() {
      fail = false;
    },
    element() {
      index = 0;
      return options.admin
        ? module.FeedbackEditor({
            item,
            onSaved: () => callbacks.push('saved'),
            onReload: () => callbacks.push('reload'),
            onBusy: () => {},
          })
        : module.default();
    },
    html() {
      return renderToStaticMarkup(this.element());
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
async function submit(h) {
  find(h.element(), (node) => node.type === 'form').props.onSubmit({ preventDefault() {} });
  await new Promise(setImmediate);
}

test('submission retry retains the request key and only success clears the review form', async () => {
  const h = harness({ fail: true });
  const original = h.ref.current;
  await submit(h);
  assert.equal(h.ref.current, original);
  assert.equal(h.states[0], 5);
  assert.equal(h.notifications[0].type, 'error');
  h.retry();
  await submit(h);
  assert.equal(h.requests[0].requestKey, h.requests[1].requestKey);
  assert.equal(h.requests[1].comment, 'Trải nghiệm tốt');
  assert.notEqual(h.ref.current, original);
  assert.equal(h.states[0], 0);
  assert.equal(h.states[1], '');
  assert.equal(h.notifications.at(-1).type, 'success');
});

test('a history refresh failure never tells users their submitted feedback was lost', async () => {
  const h = harness({ refreshFails: true });
  await submit(h);
  assert.deepEqual(
    h.notifications.map((item) => item.type),
    ['success', 'warning']
  );
  assert.equal(h.states[1], '');
});

test('feedback is rendered as plain text and private admin notes are absent from user history', () => {
  const h = harness({
    query: {
      data: {
        items: [
          {
            id: 'one',
            rating: 1,
            status: 'NEW',
            comment: '<script>alert(1)</script>',
            adminNote: 'INTERNAL_ONLY',
            createdAt: '2026-11-19T10:00:00Z',
          },
        ],
        totalElements: 1,
        size: 10,
      },
    },
  });
  const html = h.html();
  assert.match(html, /&lt;script&gt;/);
  assert.doesNotMatch(html, /<script>|INTERNAL_ONLY/);
});

test('admin sends the viewed version and reloads a conflicting review before retrying', async () => {
  const h = harness({ admin: true, fail: true });
  await submit(h);
  assert.equal(h.requests[0].version, 2);
  assert.equal(h.callbacks.includes('saved'), false);
  const element = h.element();
  assert.equal(
    find(element, (node) => node.type === 'button' && node.props.type === 'submit').props.disabled,
    true
  );
  find(
    element,
    (node) => node.type === 'button' && node.props.children === 'Tải bản mới'
  ).props.onClick();
  assert.deepEqual(h.callbacks, ['reload']);
});
