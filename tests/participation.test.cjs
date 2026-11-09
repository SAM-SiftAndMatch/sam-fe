const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const router = require('react-router-dom');
process.chdir(path.resolve(__dirname, '..'));

function harness(options = {}) {
  const query = options.query || { isPending: false, isError: false, data: options.profile };
  const user = options.user || { userId: 'user-a', role: 'CLIENT' };
  const location = options.location || {
    pathname: '/client/projects/confirm',
    search: '?draftId=draft-a',
    state: { budgetAmount: 3000000 },
  };
  const cache = new Map();
  function load(file) {
    if (cache.has(file)) return cache.get(file);
    const exports = {};
    cache.set(file, exports);
    const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        esModuleInterop: false,
        target: ts.ScriptTarget.ES2022,
        jsx: ts.JsxEmit.ReactJSX,
      },
    }).outputText;
    vm.runInNewContext(source, {
      exports,
      module: { exports },
      Date,
      document: options.document,
      HTMLElement: options.HTMLElement,
      require(name) {
        if (name === 'react' && options.hooks) return { ...React, ...options.hooks };
        if (name === 'react-dom' && options.portal) return { createPortal: options.portal };
        if (name === '@tanstack/react-query') return { useQuery: () => query };
        if (name === 'react-router-dom') return { ...router, useLocation: () => location };
        if (name.includes('stores/useAuthStore'))
          return { useAuthStore: (selector) => selector({ user }) };
        if (name.endsWith('hooks/usePageSearchParam'))
          return { usePageSearchParam: () => [options.page || 0, () => {}] };
        if (
          name.endsWith('/AppHeader') ||
          name.endsWith('/Footer') ||
          name.endsWith('/LoadingScreen')
        )
          return { default: () => null };
        if (name.includes('/api/profile')) return { profileApi: {} };
        if (name.includes('/api/checkout')) return { checkoutApi: {} };
        if (name.endsWith('/token-manager')) return { tokenManager: {} };
        if (name.startsWith('.')) {
          const base = path.resolve(path.dirname(file), name);
          const resolved = [base, `${base}.ts`, `${base}.tsx`].find(
            (candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile()
          );
          return load(resolved);
        }
        return require(name);
      },
    });
    return exports;
  }
  return { load: (file) => load(path.resolve(file)), query, location };
}
const complete = {
  contractName: 'Nguyễn An',
  contactEmail: 'an@example.test',
  phoneNumber: '0901234567',
  acceptedTerms: true,
  policyAcceptedAt: '2026-11-09T10:00:00Z',
  policyVersion: '2026-11-09',
};

test('both profile forms require valid contact details and explicit consent', () => {
  const h = harness();
  const client = h.load(
    'src/features/profile/schemas/client-profile-schema.ts'
  ).clientProfileSchema;
  const freelancer = h.load(
    'src/features/profile/schemas/freelancer-profile-schema.ts'
  ).freelancerProfileSchema;
  const fixtures = [
    [client, { ...complete, companyName: '' }],
    [freelancer, { ...complete, headline: 'Developer', skills: [] }],
  ];
  for (const [schema, valid] of fixtures) {
    assert.equal(schema.safeParse(valid).success, true);
    for (const invalid of [
      { acceptedTerms: false },
      { contractName: '  ' },
      { phoneNumber: 'abc' },
      { contactEmail: 'invalid' },
    ]) {
      assert.equal(
        schema.safeParse({ ...valid, ...invalid }).success,
        false,
        JSON.stringify(invalid)
      );
    }
    assert.equal(schema.safeParse({ ...valid, phoneNumber: '+84 901 234 567' }).success, true);
  }
});

test('incomplete profile redirects to correct role while preserving draft, query and form state', () => {
  for (const [role, expected] of [
    ['CLIENT', '/client/profile'],
    ['FREELANCER', '/freelancer/profile/create'],
  ]) {
    const h = harness({ user: { userId: role, role }, profile: { ...complete, phoneNumber: '' } });
    const Guard = h.load('src/components/guards/ProfileCompletionGuard.tsx').default;
    const element = Guard({ children: 'protected form' });
    assert.equal(element.type, router.Navigate);
    assert.equal(element.props.to, expected);
    assert.equal(element.props.state.returnTo, '/client/projects/confirm?draftId=draft-a');
    assert.equal(element.props.state.returnState.budgetAmount, 3000000);
  }
});

test('completed profiles reach form and an old policy requires renewed consent', () => {
  const h = harness({ profile: complete });
  const Guard = h.load('src/components/guards/ProfileCompletionGuard.tsx').default;
  assert.equal(Guard({ children: 'form' }).props.children, 'form');
  const old = harness({ profile: { ...complete, policyVersion: 'older' } });
  const OldGuard = old.load('src/components/guards/ProfileCompletionGuard.tsx').default;
  assert.equal(OldGuard({ children: 'form' }).type, router.Navigate);
});

test('profile loading failures offer retry without exposing the protected form', () => {
  const h = harness({ query: { isPending: false, isError: true, refetch() {} } });
  const Guard = h.load('src/components/guards/ProfileCompletionGuard.tsx').default;
  const html = renderToStaticMarkup(Guard({ children: 'PROTECTED FORM' }));
  assert.match(html, /Thử lại/);
  assert.doesNotMatch(html, /PROTECTED FORM/);
});

test('policies are readable without login and contain current funding and warranty rules', () => {
  const h = harness({ location: { pathname: '/terms' } });
  const Policy = h.load('src/pages/PolicyPage.tsx').default;
  const html = renderToStaticMarkup(
    React.createElement(router.StaticRouter, { location: '/terms' }, React.createElement(Policy))
  );
  for (const text of ['3.000.000đ', '100%', '2%', '168 giờ', '2026-11-09'])
    assert.ok(html.includes(text), text);
  assert.match(html, /aria-haspopup="dialog"/);
  assert.doesNotMatch(html, /href="\/privacy"/);
});

function order(overrides = {}) {
  return {
    orderId: 'order-a',
    purpose: 'CONTRACT_FUND',
    amount: 3000000,
    paymentStatus: 'PAID',
    fulfillmentStatus: 'APPLIED',
    environment: 'SANDBOX',
    transferContent: 'SAM TEST',
    createdAt: '2026-11-09T10:00:00Z',
    ...overrides,
  };
}
function historyHtml(query, page = 0) {
  const h = harness({ query, page });
  const Page = h.load('src/pages/PaymentHistoryPage.tsx').default;
  return renderToStaticMarkup(
    React.createElement(router.StaticRouter, null, React.createElement(Page))
  );
}

test('payment list renders amount, purpose, status and transaction detail destination', () => {
  const html = historyHtml({ isPending: false, isError: false, data: [order()] });
  for (const text of [
    '3.000.000',
    'Nạp tiền hợp đồng',
    'Thanh toán thành công',
    'Thử nghiệm',
    'SAM TEST',
  ])
    assert.ok(html.includes(text), text);
  assert.match(html, /href="\/payment\/return\?orderId=order-a"/);
  assert.match(html, /aria-label="Phân trang lịch sử thanh toán"/);
});

test('payment history distinguishes empty, failed, loading and review states', () => {
  const empty = historyHtml({ isPending: false, isError: false, data: [] });
  assert.match(empty, /Chưa có giao dịch thanh toán/);
  assert.doesNotMatch(empty, /Phân trang/);
  const failed = historyHtml({ isPending: false, isError: true });
  assert.match(failed, /Thử lại/);
  assert.doesNotMatch(failed, /Chưa có giao dịch thanh toán/);
  const pending = historyHtml({ isPending: true });
  assert.match(pending, /Đang tải lịch sử thanh toán/);
  const review = historyHtml({
    isPending: false,
    isError: false,
    data: [order({ fulfillmentStatus: 'REVIEW' })],
  });
  assert.match(review, /Đã nhận tiền, cần hỗ trợ/);
  const laterEmpty = historyHtml({ isPending: false, isError: false, data: [] }, 1);
  assert.match(laterEmpty, /Không có giao dịch ở trang này/);
  assert.match(laterEmpty, /Trang 2/);
});

test('company website can be omitted or left blank and completed later', () => {
  const schema = harness().load(
    'src/features/profile/schemas/client-profile-schema.ts'
  ).clientProfileSchema;
  for (const websiteUrl of [undefined, '', '   ', 'https://company.example']) {
    assert.equal(schema.safeParse({ ...complete, companyName: '', websiteUrl }).success, true);
  }
  assert.equal(
    schema.safeParse({ ...complete, companyName: '', websiteUrl: 'company.example' }).success,
    false
  );
});

test('both policy triggers are buttons that open a dialog without navigating or submitting a form', () => {
  const h = harness();
  const Links = h.load('src/components/PolicyLinks.tsx').default;
  const html = renderToStaticMarkup(React.createElement(Links));
  assert.equal((html.match(/aria-haspopup="dialog"/g) || []).length, 2);
  assert.equal((html.match(/type="button"/g) || []).length, 2);
  assert.doesNotMatch(html, /<a|href=|target=/);
  for (const policy of ['terms', 'privacy']) {
    let open = false;
    const interactive = harness({
      hooks: {
        useState: () => [
          open,
          (value) => {
            open = value;
          },
        ],
        useCallback: (callback) => callback,
      },
    });
    const { PolicyButton } = interactive.load('src/components/PolicyLinks.tsx');
    let element = PolicyButton({ policy, children: policy });
    assert.equal(element.props.children[1], false);
    element.props.children[0].props.onClick();
    assert.equal(open, true);
    element = PolicyButton({ policy, children: policy });
    const dialog = element.props.children[1];
    assert.equal(dialog.props.policy, policy);
    dialog.props.onClose();
    assert.equal(open, false);
  }
});

test('policy dialog supports Escape, backdrop dismissal, scroll lock and focus restoration', () => {
  const refs = [];
  const effects = [];
  const trigger = {
    focusCount: 0,
    focus() {
      this.focusCount++;
    },
  };
  const document = { activeElement: trigger, body: { style: { overflow: 'auto' } } };
  let closed = 0;
  const h = harness({
    document,
    HTMLElement: Object,
    portal: (element) => element,
    hooks: {
      useState: (value) => [value, () => {}],
      useId: () => `policy-id-${refs.length}`,
      useRef: () => {
        const ref = { current: null };
        refs.push(ref);
        return ref;
      },
      useEffect: (effect) => effects.push(effect),
    },
  });
  const Dialog = h.load('src/components/PolicyDialog.tsx').default;
  const element = Dialog({ policy: 'privacy', onClose: () => closed++ });
  const nativeDialog = {
    open: false,
    showModal() {
      this.open = true;
    },
    close() {
      this.open = false;
    },
  };
  refs[0].current = nativeDialog;
  const cleanup = effects[0]();
  assert.equal(nativeDialog.open, true);
  assert.equal(document.body.style.overflow, 'hidden');
  const html = renderToStaticMarkup(element);
  assert.match(html, /aria-modal="true"/);
  assert.match(html, /Thông tin được thu thập/);
  let prevented = false;
  element.props.onCancel({
    preventDefault() {
      prevented = true;
    },
  });
  assert.equal(prevented, true);
  assert.equal(closed, 1);
  const backdrop = {
    getBoundingClientRect: () => ({ left: 50, right: 150, top: 50, bottom: 150 }),
  };
  element.props.onClick({ target: backdrop, currentTarget: backdrop, clientX: 80, clientY: 80 });
  assert.equal(closed, 1);
  element.props.onClick({ target: backdrop, currentTarget: backdrop, clientX: 0, clientY: 0 });
  assert.equal(closed, 2);
  cleanup();
  assert.equal(nativeDialog.open, false);
  assert.equal(document.body.style.overflow, 'auto');
  assert.equal(trigger.focusCount, 1);
  // StrictMode can queue a close event before reopening the dialog. Ignore that old event.
  const secondCleanup = effects[0]();
  element.props.onClose();
  assert.equal(nativeDialog.open, true);
  assert.equal(closed, 2);
  secondCleanup();
});
