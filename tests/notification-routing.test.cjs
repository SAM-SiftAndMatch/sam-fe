const assert = require('node:assert/strict');
const test = require('node:test');
const { notificationDestination } = require('../src/lib/notification-routing.ts');

const jobId = '00000000-0000-0000-0000-000000000001';
const roomId = '00000000-0000-0000-0000-000000000002';
const event = (type, fields = {}) => ({ type, jobId, roomId: null, ...fields });

for (const type of [
  'DELIVERY_SUBMITTED',
  'DELIVERY_REVISION_REQUESTED',
  'PROJECT_DELIVERY_ACCEPTED',
  'PROJECT_STARTED',
  'PROJECT_SETTLEMENT_POSTED',
  'PAYMENT_ESCROW_HELD',
  'MAINTENANCE_TICKET_UPDATED',
]) {
  test(`${type} opens the workspace for both project participants`, () => {
    for (const role of ['CLIENT', 'FREELANCER']) {
      assert.equal(notificationDestination(event(type), role), `/workspace/${jobId}`);
    }
  });
}

test('a known chat room takes precedence over the project fallback', () => {
  assert.equal(
    notificationDestination(event('DELIVERY_SUBMITTED', { roomId }), 'CLIENT'),
    `/workspace/${roomId}`
  );
});

test('subscription notifications open the matching pricing page without requiring a job', () => {
  assert.equal(
    notificationDestination(event('SUBSCRIPTION_ACTIVE', { jobId: null }), 'CLIENT'),
    '/client/pricing'
  );
  assert.equal(
    notificationDestination(event('SUBSCRIPTION_ACTIVE', { jobId: null }), 'FREELANCER'),
    '/freelancer/pricing'
  );
});

test('invitation and proposal routes keep their existing behavior', () => {
  assert.equal(
    notificationDestination(event('JOB_INVITE'), 'FREELANCER'),
    '/freelancer/invitations'
  );
  assert.equal(
    notificationDestination(event('PROPOSAL_RECEIVED'), 'CLIENT'),
    `/client/projects/${jobId}`
  );
  assert.equal(notificationDestination(event('1_TOUCH_INVITE'), 'CLIENT'), `/jobs/${jobId}`);
});

test('admin escalation opens ticket administration instead of an inaccessible participant room', () => {
  assert.equal(
    notificationDestination(event('MAINTENANCE_ESCALATED'), 'ADMIN'),
    '/admin/finance/tickets'
  );
});

test('an event with no destination does not produce a broken URL', () => {
  assert.equal(notificationDestination(event('UNKNOWN', { jobId: null }), 'CLIENT'), null);
});
