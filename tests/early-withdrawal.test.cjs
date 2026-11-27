const assert = require('node:assert/strict');
const test = require('node:test');
const {
  evidenceError,
  earlyRequestError,
  earlyWithdrawalBlockReason,
} = require('../src/lib/early-withdrawal.ts');
const { notificationDestination } = require('../src/lib/notification-routing.ts');
const image = { name: 'proof.png', type: 'image/png', size: 1000 };

const now = Date.parse('2026-11-27T00:00:00Z');
const payable = {
  sandbox: false,
  blocked: false,
  acceptedAt: '2026-11-26T00:00:00Z',
  availableAt: '2026-12-03T00:00:00Z',
  canRequestEarly: true,
  earlyAvailableAmount: 90000,
};
const wallet = { withdrawalsEnabled: true, minimumWithdrawal: 50000 };

test('closed payouts explain why a project still under warranty cannot request early withdrawal', () => {
  assert.match(
    earlyWithdrawalBlockReason(payable, { ...wallet, withdrawalsEnabled: false }, now),
    /chưa mở chức năng chi trả/
  );
  assert.equal(earlyWithdrawalBlockReason(payable, wallet, now), null);
});

test('simulations, warranty holds, elapsed windows and small balances provide actionable reasons', () => {
  assert.match(
    earlyWithdrawalBlockReason({ ...payable, sandbox: true }, wallet, now),
    /tiền mô phỏng/
  );
  assert.match(
    earlyWithdrawalBlockReason({ ...payable, blocked: true }, wallet, now),
    /ticket bảo trì chặn chi/
  );
  assert.match(
    earlyWithdrawalBlockReason(payable, wallet, Date.parse(payable.availableAt)),
    /Yêu cầu rút tiền/
  );
  assert.match(
    earlyWithdrawalBlockReason({ ...payable, earlyAvailableAmount: 49000 }, wallet, now),
    /tối thiểu/
  );
  assert.match(
    earlyWithdrawalBlockReason({ ...payable, canRequestEarly: undefined }, wallet, now),
    /chưa được cập nhật/
  );
});

test('early withdrawals require a nonblank reason and one to five images', () => {
  assert.ok(earlyRequestError('   ', [image]));
  assert.ok(earlyRequestError('Cần tiền gấp', []));
  assert.ok(earlyRequestError('x'.repeat(2001), [image]));
  assert.ok(evidenceError(Array(6).fill(image)));
  assert.equal(earlyRequestError('Cần tiền gấp', [image]), '');
});

test('evidence rejects empty, oversized and unsupported files', () => {
  for (const file of [
    { ...image, size: 0 },
    { ...image, size: 5 * 1024 * 1024 + 1 },
    { ...image, name: 'proof.svg' },
    { ...image, type: 'text/html' },
  ])
    assert.ok(evidenceError([file]));
  assert.equal(
    evidenceError([{ name: 'proof.webp', type: 'image/webp', size: 5 * 1024 * 1024 }]),
    ''
  );
});

test('early withdrawal notifications route admin and freelancer to payment requests', () => {
  const notification = { type: 'EARLY_WITHDRAWAL_UPDATED', jobId: 'job-a', roomId: null };
  assert.equal(notificationDestination(notification, 'ADMIN'), '/admin/finance/withdrawals');
  assert.equal(
    notificationDestination(notification, 'FREELANCER'),
    '/freelancer/earnings?tab=withdrawals'
  );
  assert.equal(
    notificationDestination({ ...notification, type: 'EARLY_WITHDRAWAL_APPROVED' }, 'CLIENT'),
    '/client/projects/job-a'
  );
});
