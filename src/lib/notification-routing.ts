import type { UserNotification } from '../api/notifications';
import {
  PATH_CLIENT_PRICING,
  PATH_CLIENT_PROJECT_DETAIL,
  PATH_FREELANCER_INVITATIONS,
  PATH_FREELANCER_PRICING,
  PATH_JOB_DETAIL,
  PATH_WORKSPACE,
} from '../routes/paths';
import type { UserRole } from '../types/auth';

const WORKSPACE_TYPES = new Set([
  'PROJECT_STARTED',
  'PROJECT_SETTLEMENT_POSTED',
  'DELIVERY_SUBMITTED',
  'DELIVERY_REVISION_REQUESTED',
  'PROJECT_DELIVERY_ACCEPTED',
  'MAINTENANCE_TICKET_UPDATED',
  'MAINTENANCE_ESCALATED',
]);

export function notificationDestination(
  notification: Pick<UserNotification, 'type' | 'jobId' | 'roomId'>,
  role?: UserRole
): string | null {
  const { type, jobId, roomId } = notification;
  if (role === 'ADMIN' && type === 'MAINTENANCE_ESCALATED') return '/admin/finance/tickets';
  if (roomId) return PATH_WORKSPACE.replace(':projectId', roomId);
  if (type === 'SUBSCRIPTION_ACTIVE')
    return role === 'CLIENT' ? PATH_CLIENT_PRICING : PATH_FREELANCER_PRICING;
  if (jobId && (type.startsWith('PAYMENT_') || WORKSPACE_TYPES.has(type)))
    return PATH_WORKSPACE.replace(':projectId', jobId);
  if (role === 'FREELANCER' && type.startsWith('JOB_INVITE')) return PATH_FREELANCER_INVITATIONS;
  if (!jobId) return null;
  return (
    role === 'CLIENT' && type !== '1_TOUCH_INVITE' ? PATH_CLIENT_PROJECT_DETAIL : PATH_JOB_DETAIL
  ).replace(':id', jobId);
}
