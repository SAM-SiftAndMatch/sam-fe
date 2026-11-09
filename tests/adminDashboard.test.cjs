const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { StaticRouter } = require('react-router-dom');

const fixture = {
  role: 'ADMIN',
  search: '',
  captured: [],
  updated: null,
  users: {
    total: 1,
    page: 0,
    size: 20,
    items: [
      {
        id: 'user',
        fullName: 'Nguyễn An',
        email: 'an@example.test',
        role: 'FREELANCER',
        isActive: true,
        createdAt: '2026-11-09T02:00:00Z',
      },
    ],
  },
  revenue: {
    totals: { total: 149000, packages: 100000, projects: 49000, addons: 0, other: 0, count: 1 },
    series: [{ day: '2026-11-09', amount: 149000, count: 1 }],
    items: [
      {
        id: 'entry',
        title: 'Phí dịch vụ dự án',
        projectTitle: 'Website bán hàng',
        projectId: 'project',
        source: 'PROJECT',
        payerName: 'Khách hàng',
        amount: 49000,
        createdAt: '2026-11-09T02:00:00Z',
      },
    ],
    page: 0,
    size: 20,
  },
};
function loader() {
  const cache = new Map();
  const state = {
    user: {
      userId: 'admin',
      fullName: 'Quản trị SAM',
      email: 'admin@example.test',
      role: fixture.role,
    },
    isLoading: false,
    isAuthenticated: true,
    logout: async () => {},
  };
  function load(file) {
    if (cache.has(file)) return cache.get(file);
    const exports = {};
    cache.set(file, exports);
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
      Date,
      Intl,
      URLSearchParams,
      FormData: class {
        constructor(values) {
          this.values = values;
        }
        get(key) {
          return this.values[key];
        }
      },
      require(name) {
        if (name === '@tanstack/react-query')
          return {
            useQuery: (options) => {
              fixture.captured.push(options);
              return {
                data: options.queryKey[0] === 'admin-users' ? fixture.users : fixture.revenue,
                isPending: false,
                isError: false,
              };
            },
            useQueryClient: () => ({ clear() {} }),
          };
        if (name.endsWith('/stores/useAuthStore'))
          return { useAuthStore: (selector) => (selector ? selector(state) : state) };
        if (name.endsWith('/api/admin'))
          return { adminApi: { users: () => {}, revenue: () => {} } };
        if (name.endsWith('/api/finance')) return { money: (value) => `${value} đ` };
        if (name === 'react-router-dom')
          return {
            ...require(name),
            useSearchParams: () => [
              new URLSearchParams(fixture.search),
              (value) => {
                fixture.updated = value;
              },
            ],
          };
        if (name.endsWith('.png')) return { default: 'logo.png' };
        if (name.startsWith('.')) {
          const base = path.resolve(path.dirname(file), name);
          const candidate = ['.tsx', '.ts'].map((ext) => base + ext).find(fs.existsSync);
          if (candidate) return load(candidate);
        }
        return require(name);
      },
    });
    return exports;
  }
  return load;
}
function render(file, location = '/admin') {
  const Component = loader()(file).default;
  return renderToStaticMarkup(
    React.createElement(StaticRouter, { location }, React.createElement(Component))
  );
}

test('admin shell exposes the operational routes, collapsible navigation, avatar and logout', () => {
  const html = render('src/components/admin/AdminLayout.tsx');
  for (const route of [
    '/admin/revenue',
    '/admin/users',
    '/admin/finance/payment-cases',
    '/admin/finance/withdrawals',
    '/admin/finance/tickets',
  ])
    assert.ok(html.includes(`href="${route}"`));
  assert.match(html, /Thu gọn sidebar/);
  assert.match(html, /Đăng xuất/);
  assert.match(html, /admin@example.test/);
  assert.match(html, /<dialog/);
});

test('user filters are reflected in the request and submitting a new filter resets pagination', () => {
  fixture.search = 'role=FREELANCER&q=An&status=ACTIVE&page=2';
  fixture.captured = [];
  const html = render('src/pages/AdminUsersPage.tsx', '/admin/users');
  assert.match(html, /Nguyễn An/);
  assert.match(html, /an@example.test/);
  assert.match(html, /value="FREELANCER" selected/);
  const query = fixture.captured.at(-1).queryKey;
  assert.equal(query[1], 'admin');
  assert.equal(new URLSearchParams(query[2]).get('page'), '2');
  const Page = loader()('src/pages/AdminUsersPage.tsx').default;
  const tree = Page();
  const form = tree.props.children.find((child) => child?.type === 'form');
  form.props.onSubmit({
    preventDefault() {},
    currentTarget: { role: 'CLIENT', q: '  Linh  ', status: '' },
  });
  assert.equal(fixture.updated.get('q'), 'Linh');
  assert.equal(fixture.updated.get('role'), 'CLIENT');
  assert.equal(fixture.updated.has('page'), false);
});

test('revenue names its project, filters exact projects, and retains date/source filters in URL state', () => {
  fixture.search = 'from=2026-11-01&to=2026-11-09&source=PROJECT&projectId=project&q=Website';
  fixture.captured = [];
  const html = render('src/pages/AdminRevenuePage.tsx', '/admin/revenue');
  assert.match(html, /Website bán hàng/);
  assert.match(html, /href="\/admin\/revenue\?projectId=project"/);
  assert.match(html, /Biểu đồ doanh thu theo ngày/);
  assert.match(html, /149000 đ/);
  assert.match(html, /Tiền ký quỹ/);
  const query = new URLSearchParams(fixture.captured.at(-1).queryKey[2]);
  assert.equal(query.get('source'), 'PROJECT');
  assert.equal(query.get('projectId'), 'project');
  const Page = loader()('src/pages/AdminRevenuePage.tsx').default;
  const form = Page().props.children.find((child) => child?.type === 'form');
  form.props.onSubmit({
    preventDefault() {},
    currentTarget: { from: '2026-11-02', to: '2026-11-09', source: 'PACKAGE', q: '' },
  });
  assert.equal(fixture.updated.get('projectId'), 'project');
  assert.equal(fixture.updated.get('from'), '2026-11-02');
  assert.equal(fixture.updated.get('source'), 'PACKAGE');
  assert.equal(fixture.updated.has('page'), false);
});

test('client and freelancer cannot render an admin-only route', () => {
  for (const role of ['CLIENT', 'FREELANCER', 'ADMIN']) {
    fixture.role = role;
    const Guard = loader()('src/components/guards/RoleGuard.tsx').default;
    const html = renderToStaticMarkup(
      React.createElement(
        StaticRouter,
        { location: '/admin/revenue' },
        React.createElement(
          Guard,
          { allowedRoles: ['ADMIN'] },
          React.createElement('span', null, 'PRIVATE_ADMIN_REPORT')
        )
      )
    );
    assert.equal(html.includes('PRIVATE_ADMIN_REPORT'), role === 'ADMIN');
  }
  fixture.role = 'ADMIN';
  fixture.search = '';
});
