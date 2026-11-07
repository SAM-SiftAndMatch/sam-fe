import { tokenManager } from './token-manager';
export interface Checkout {
  orderId: string;
  purpose: string;
  objectId: string;
  amount: number;
  currency: string;
  provider: 'PAY2S';
  environment: string;
  paymentStatus: 'CREATING' | 'PENDING' | 'UNKNOWN' | 'PAID' | 'CANCELLED' | 'EXPIRED' | 'REVIEW';
  fulfillmentStatus: 'NONE' | 'PENDING' | 'RETRY' | 'APPLIED' | 'REVIEW';
  checkoutUrl?: string | null;
  transferContent: string;
  supportCode?: string;
  reviewRequired?: boolean;
  expiresAt: string;
  createdAt?: string;
  paidAt?: string | null;
}
export function checkoutId(value: string | null | undefined): string | null {
  if (!value) return null;
  const id = value.replaceAll('-', '');
  if (!/^[a-f0-9]{32}$/i.test(id)) return null;
  return `${id.slice(0, 8)}-${id.slice(8, 12)}-${id.slice(12, 16)}-${id.slice(16, 20)}-${id.slice(20)}`.toLowerCase();
}
export function safePaymentDestination(value: unknown): string {
  if (
    typeof value === 'string' &&
    /^\/(?:client\/pricing|freelancer\/pricing|workspaces|client\/projects\/[a-f0-9-]{36}|workspace\/[a-f0-9-]{36}(?:\/contract)?)$/i.test(
      value
    )
  )
    return value;
  return '/workspaces';
}
export function beginCheckout(
  checkout: { orderId?: string | null; checkoutUrl?: string | null },
  returnTo: string
) {
  const id = checkoutId(checkout.orderId);
  if (!id) throw new Error('Không nhận được mã đơn thanh toán.');
  if (checkout.checkoutUrl) {
    const target = new URL(checkout.checkoutUrl);
    if (
      target.protocol !== 'https:' ||
      target.username ||
      target.password ||
      (target.port && target.port !== '443') ||
      !['payment.pay2s.vn', 'sandbox-payment.pay2s.vn'].includes(target.hostname)
    )
      throw new Error('Liên kết thanh toán không hợp lệ.');
  }
  const user = tokenManager.decodePayload(tokenManager.getToken() || '')?.user_id;
  sessionStorage.setItem(
    'sam:checkout',
    JSON.stringify({ orderId: id, returnTo: safePaymentDestination(returnTo), user })
  );
  window.location.assign(checkout.checkoutUrl || `/payment/return?orderId=${id}`);
}
export function checkoutMessage(order: Checkout): string {
  if (order.paymentStatus === 'PAID')
    return order.fulfillmentStatus === 'APPLIED'
      ? 'Thanh toán thành công'
      : order.fulfillmentStatus === 'REVIEW'
        ? 'Đã nhận tiền, cần hỗ trợ'
        : 'Đã thanh toán, đang kích hoạt';
  return {
    CREATING: 'Đang tạo thanh toán',
    PENDING: 'Đang chờ xác nhận thanh toán',
    UNKNOWN: 'Đang kiểm tra giao dịch',
    CANCELLED: 'Thanh toán đã hủy',
    EXPIRED: 'Liên kết đã hết hạn',
    REVIEW: 'Giao dịch cần đối soát',
  }[order.paymentStatus];
}

export function checkoutPurposeLabel(purpose: string): string {
  return (
    (
      {
        CONTRACT_FUND: 'Nạp tiền hợp đồng',
        SECURITY_DEPOSIT: 'Cọc cam kết dự án',
        MAINTENANCE_FUND: 'Thanh toán bảo trì',
        SUBSCRIPTION: 'Mua gói dịch vụ',
        JOB_ADDON: 'Tính năng bổ sung của dự án',
      } as Record<string, string>
    )[purpose] || 'Thanh toán SAM'
  );
}
