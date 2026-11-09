export function paymentScope(path: string, method: string, body: unknown): string | null {
  if (method.toUpperCase() !== 'POST') return null;
  let value: Record<string, unknown> = {};
  try {
    value = typeof body === 'string' ? JSON.parse(body) : (body as Record<string, unknown>) || {};
  } catch {
    return null;
  }
  if (path === '/subscriptions/purchase')
    return `${path}:${String(value.packageId)}:${String(value.projectId || '')}`;
  if (path === '/payments/fund' || path === '/payments/deposit')
    return `${path}:${String(value.contractId)}`;
  if (/^\/checkouts\/[a-f0-9-]{36}\/retry$/i.test(path)) return path;
  if (/^\/jobs\/[a-f0-9-]{36}\/addons\/checkout$/i.test(path)) return path;
  if (/^\/paid-maintenance-orders\/[a-f0-9-]{36}\/checkout$/i.test(path)) return path;
  return null;
}

export function paymentRequestKey(owner: string, scope: string): string {
  const name = `sam:payment-key:${owner}:${scope}`;
  const previous = localStorage.getItem(name);
  if (previous && /^[a-f0-9-]{36}$/i.test(previous)) return previous;
  const key = crypto.randomUUID();
  localStorage.setItem(name, key);
  return key;
}

export function observePaymentResult(
  owner: string,
  scope: string | null,
  key: string | undefined,
  result: unknown
) {
  if (!result || typeof result !== 'object') return;
  const value = result as {
    checkout?: { orderId?: string; paymentStatus?: string };
    orderId?: string;
    paymentStatus?: string;
  };
  const checkout = value.checkout || value;
  if (!checkout.orderId) return;
  const name = `sam:payment-order:${owner}:${checkout.orderId}`;
  if (scope && key) localStorage.setItem(name, JSON.stringify({ scope, key }));
  if (checkout.paymentStatus && ['PAID', 'CANCELLED', 'EXPIRED'].includes(checkout.paymentStatus)) {
    try {
      const saved = JSON.parse(localStorage.getItem(name) || 'null');
      if (saved && localStorage.getItem(`sam:payment-key:${owner}:${saved.scope}`) === saved.key)
        localStorage.removeItem(`sam:payment-key:${owner}:${saved.scope}`);
      localStorage.removeItem(name);
    } catch {
      /* Navigation metadata is not payment evidence. */
    }
  }
}
