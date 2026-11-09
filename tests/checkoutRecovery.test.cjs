const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');

const id = '01234567-89ab-cdef-0123-456789abcdef';
function renderStatus(paymentStatus, mutation = {}) {
  const exports = {};
  const order = {
    orderId: id,
    amount: 149000,
    environment: 'LIVE',
    purpose: 'SUBSCRIPTION',
    paymentStatus,
    fulfillmentStatus: 'NONE',
    reviewRequired: true,
  };
  const code = ts.transpileModule(fs.readFileSync('src/pages/PaymentReturnPage.tsx', 'utf8'), {
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
    URLSearchParams,
    sessionStorage: { getItem: () => null },
    require(name) {
      if (name === '@tanstack/react-query')
        return {
          useQuery: () => ({ data: order }),
          useQueryClient: () => ({ setQueryData() {}, invalidateQueries: async () => {} }),
          useMutation: () => ({
            mutate() {},
            variables: { orderId: id, ownerId: 'payer' },
            ...mutation,
          }),
        };
      if (name === 'react-router-dom')
        return {
          useSearchParams: () => [new URLSearchParams(`orderId=${id}`)],
          useNavigate: () => () => {},
          Link: ({ to, children }) => React.createElement('a', { href: to }, children),
        };
      if (name === '../stores/useAuthStore')
        return {
          useAuthStore: () => ({
            user: { userId: 'payer', role: 'CLIENT' },
            isAuthenticated: true,
          }),
        };
      if (name === '../api/checkout') return { checkoutApi: {} };
      if (name === '../lib/api-error')
        return {
          extractApiResponse: () => mutation.error,
          getApiErrorMessage: (error, fallback) => error?.message || fallback,
        };
      if (name === '../lib/checkout')
        return {
          checkoutId: (value) => value || null,
          safePaymentDestination: () => '/client/pricing',
          checkoutMessage: (value) => value.paymentStatus,
          checkoutPurposeLabel: () => 'Gói dịch vụ',
        };
      if (name.startsWith('../components/'))
        return {
          default: () => React.createElement('span'),
        };
      return require(name);
    },
  });
  return renderToStaticMarkup(React.createElement(exports.default));
}

test('expired checkout offers recovery and explains when the buyer must not pay again', () => {
  const html = renderStatus('EXPIRED');
  assert.match(html, /Tạo lại liên kết thanh toán/);
  assert.match(html, /Nếu đã chuyển tiền/);
  assert.doesNotMatch(html, /Tiếp tục thanh toán/);
});

test('paid and uncertain orders do not offer closing or another payment', () => {
  for (const state of ['PAID', 'UNKNOWN', 'REVIEW', 'CREATING']) {
    const html = renderStatus(state);
    assert.doesNotMatch(html, /Tạo lại liên kết thanh toán/);
    assert.doesNotMatch(html, /Tiếp tục thanh toán/);
  }
});

test('recovery waits for provider confirmation and surfaces safe server errors', () => {
  assert.match(renderStatus('EXPIRED', { isPending: true }), /disabled=""/);
  assert.match(renderStatus('EXPIRED', { isPending: true }), /Đang khôi phục thanh toán/);
  assert.match(
    renderStatus('EXPIRED', { isError: true, error: { message: 'Đã có thông tin nhận tiền' } }),
    /Đã có thông tin nhận tiền/
  );
});

test('cancelled checkout offers the same one-click recovery without sending the buyer back to purchase', () => {
  const html = renderStatus('CANCELLED', { isSuccess: true, data: { orderId: id } });
  assert.match(html, /Tạo lại liên kết thanh toán/);
  assert.match(html, /Quay lại dịch vụ/);
  assert.match(html, /tạo lại tự động/);
});

test('recovery state from a previous account is not shown to the current buyer', () => {
  const html = renderStatus('EXPIRED', {
    variables: { orderId: id, ownerId: 'previous-payer' },
    isError: true,
    error: { message: 'PRIVATE_PREVIOUS_ACCOUNT_RESULT' },
  });
  assert.doesNotMatch(html, /PRIVATE_PREVIOUS_ACCOUNT_RESULT/);
});
