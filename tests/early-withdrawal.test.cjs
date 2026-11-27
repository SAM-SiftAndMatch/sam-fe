const assert = require('node:assert/strict');
const test = require('node:test');
const { evidenceError, earlyRequestError } = require('../src/lib/early-withdrawal.ts');
const { notificationDestination } = require('../src/lib/notification-routing.ts');
const image = { name: 'proof.png', type: 'image/png', size: 1000 };

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
