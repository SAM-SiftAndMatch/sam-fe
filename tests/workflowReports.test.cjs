const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const React = require('react');
const { workspaceKeys } = require('../src/pages/workspace-query.ts');

const reports = [
  { id: 'report-a', content: 'Completed login screen', evidenceUrl: 'https://example.com/login' },
  {
    id: 'report-b',
    content: 'Fixed login validation',
    evidenceUrl: 'https://example.com/validation',
  },
  { id: 'report-c', content: 'Work without an attachment', evidenceUrl: null },
];

function harness(options = {}) {
  let search = new URLSearchParams(options.task ? { task: options.task } : {});
  let stateIndex = 0;
  const states = [];
  const queries = [];
  let retries = 0;
  const timeline = {
    currentWeek: 1,
    totalWeeks: 1,
    progress: 50,
    readyForDelivery: false,
    tasks: ['task-a', 'task-b'].map((id) => ({
      id,
      title: id,
      weekNumber: 1,
      status: 'IN_PROGRESS',
      progress: 50,
      reports: [],
    })),
  };
  const exports = {};
  vm.runInNewContext(
    ts.transpileModule(
      fs.readFileSync(require.resolve('../src/components/ProjectWorkflowPanel.tsx'), 'utf8'),
      {
        compilerOptions: {
          module: ts.ModuleKind.CommonJS,
          target: ts.ScriptTarget.ES2022,
          jsx: ts.JsxEmit.ReactJSX,
        },
      }
    ).outputText,
    {
      exports,
      URLSearchParams,
      require(name) {
        if (name === 'react')
          return {
            ...React,
            useEffect: () => {},
            useMemo: (factory) => factory(),
            useCallback: (fn) => fn,
            useState: (initial) => {
              const index = stateIndex++;
              if (!(index in states))
                states[index] = typeof initial === 'function' ? initial() : initial;
              return [
                states[index],
                (value) => {
                  states[index] = typeof value === 'function' ? value(states[index]) : value;
                },
              ];
            },
          };
        if (name === 'react-router-dom')
          return {
            useSearchParams: () => [
              search,
              (next) => {
                search = typeof next === 'function' ? next(search) : next;
              },
            ],
          };
        if (name.endsWith('/workspace-query')) return { workspaceKeys };
        if (name.endsWith('/useAuthStore'))
          return { useAuthStore: (selector) => selector({ user: { userId: 'client-a' } }) };
        if (name.endsWith('/api/workflow')) return { workflowApi: {} };
        if (name === '@tanstack/react-query')
          return {
            useQueryClient: () => ({}),
            useQuery: (query) => {
              if (query.queryKey[1] === 'timeline')
                return { data: timeline, isPending: false, refetch: async () => {} };
              if (query.queryKey[1] === 'deliveries')
                return { data: [], isPending: false, refetch: async () => {} };
              if (query.queryKey[1] === 'reports') {
                queries.push(query);
                const task = query.queryKey.at(-1);
                return {
                  data:
                    options.pending || options.error
                      ? undefined
                      : task === 'task-b'
                        ? [
                            {
                              id: 'other',
                              content: 'Other task report',
                              evidenceUrl: 'https://example.com/other',
                            },
                          ]
                        : options.empty
                          ? []
                          : reports,
                  isPending: Boolean(options.pending),
                  isError: Boolean(options.error),
                  refetch: () => {
                    retries++;
                  },
                };
              }
              return { data: null };
            },
          };
        return require(name);
      },
    }
  );
  return {
    render() {
      stateIndex = 0;
      return exports.default({ jobId: 'job-a', jobStatus: 'IN_PROGRESS', role: 'client' });
    },
    getQuery: () => queries.at(-1),
    retries: () => retries,
  };
}
function nodes(element, predicate) {
  if (!React.isValidElement(element)) return [];
  return [
    ...(predicate(element) ? [element] : []),
    ...React.Children.toArray(element.props.children).flatMap((child) => nodes(child, predicate)),
  ];
}
function text(element) {
  if (typeof element === 'string' || typeof element === 'number') return String(element);
  return React.isValidElement(element)
    ? React.Children.toArray(element.props.children).map(text).join('')
    : '';
}
function button(element, label) {
  return nodes(element, (node) => node.type === 'button' && text(node) === label)[0];
}
const evidenceLinks = (element) =>
  nodes(element, (node) => node.type === 'a' && text(node) === 'Xem bằng chứng');

test('view reports opens content with each matching evidence link; hide removes both even with cached data', () => {
  const h = harness();
  let page = h.render();
  assert.equal(evidenceLinks(page).length, 0);
  assert.doesNotMatch(text(page), /Completed login screen/);
  assert.equal(button(page, 'Xem báo cáo').props['aria-expanded'], false);
  button(page, 'Xem báo cáo').props.onClick();
  page = h.render();
  assert.match(text(page), /Completed login screen/);
  assert.match(text(page), /Fixed login validation/);
  assert.deepEqual(
    evidenceLinks(page).map((link) => link.props.href),
    reports.slice(0, 2).map((report) => report.evidenceUrl)
  );
  assert.equal(button(page, 'Ẩn báo cáo').props['aria-expanded'], true);
  button(page, 'Ẩn báo cáo').props.onClick();
  page = h.render();
  assert.equal(evidenceLinks(page).length, 0);
  assert.doesNotMatch(
    text(page),
    /Completed login screen|Fixed login validation|Work without an attachment/
  );
  assert.equal(h.getQuery().enabled, false);
});

test('deep links and switching tasks display only the selected task reports', () => {
  const h = harness({ task: 'task-a' });
  let page = h.render();
  assert.equal(evidenceLinks(page).length, 2);
  button(page, 'Xem báo cáo').props.onClick();
  page = h.render();
  assert.deepEqual(
    evidenceLinks(page).map((link) => link.props.href),
    ['https://example.com/other']
  );
  assert.doesNotMatch(text(page), /Completed login screen/);
  assert.equal(h.getQuery().queryKey.at(-1), 'task-b');
});

test('report loading, failures with retry, empty reports and invalid task links are explicit', () => {
  const loading = harness({ task: 'task-a', pending: true });
  assert.match(text(loading.render()), /Đang tải báo cáo/);
  const failed = harness({ task: 'task-a', error: true });
  const page = failed.render();
  assert.match(text(page), /Không tải được báo cáo/);
  button(page, 'Thử lại').props.onClick();
  assert.equal(failed.retries(), 1);
  assert.match(text(harness({ task: 'task-a', empty: true }).render()), /Chưa có báo cáo/);
  const invalid = harness({ task: 'missing-task' });
  assert.equal(evidenceLinks(invalid.render()).length, 0);
  assert.equal(invalid.getQuery().enabled, false);
});

test('manual refresh also reloads the currently expanded reports', () => {
  const h = harness({ task: 'task-a' });
  button(h.render(), 'Tải lại').props.onClick();
  assert.equal(h.retries(), 1);
  const closed = harness();
  button(closed.render(), 'Tải lại').props.onClick();
  assert.equal(closed.retries(), 0);
});
