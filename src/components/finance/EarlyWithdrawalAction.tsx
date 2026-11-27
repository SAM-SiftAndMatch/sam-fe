import { useId } from 'react';
import type { FinanceWallet, Payable } from '../../api/finance';
import { earlyWithdrawalBlockReason } from '../../lib/early-withdrawal';
import { secondaryClass } from './FinanceUI';

export default function EarlyWithdrawalAction({
  payable,
  wallet,
  onRequest,
  onViewRequest,
}: {
  payable: Payable;
  wallet: Pick<FinanceWallet, 'withdrawalsEnabled' | 'minimumWithdrawal'>;
  onRequest: () => void;
  onViewRequest: (id: string) => void;
}) {
  const reasonId = useId();
  if (payable.earlyRequestId) {
    const requestId = payable.earlyRequestId;
    return (
      <button
        type="button"
        className="mt-3 block text-sm text-blue-700 underline"
        onClick={() => onViewRequest(requestId)}
      >
        Xem ticket rút sớm đang xử lý
      </button>
    );
  }
  const reason = earlyWithdrawalBlockReason(payable, wallet);
  return (
    <div className="mt-3 space-y-2">
      <button
        type="button"
        className={secondaryClass}
        disabled={reason !== null}
        aria-describedby={reason ? reasonId : undefined}
        onClick={onRequest}
      >
        Xin rút tiền sớm
      </button>
      {reason && (
        <p id={reasonId} className="max-w-sm text-xs leading-5 text-slate-500">
          {reason}
        </p>
      )}
    </div>
  );
}
