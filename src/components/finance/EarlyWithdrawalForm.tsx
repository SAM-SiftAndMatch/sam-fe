import { useEffect, useRef, useState } from 'react';
import {
  type BankAccount,
  type Payable,
  dateTime,
  financeApi,
  financeError,
  money,
} from '../../api/finance';
import { earlyRequestError, evidenceError } from '../../lib/early-withdrawal';
import { Field, Modal, Notice, inputClass, primaryClass, secondaryClass } from './FinanceUI';

function LocalImage({ file }: { file: File }) {
  const [url, setUrl] = useState('');
  useEffect(() => {
    const next = URL.createObjectURL(file);
    setUrl(next);
    return () => URL.revokeObjectURL(next);
  }, [file]);
  return url ? (
    <img src={url} alt={file.name} className="h-24 w-full rounded-lg object-contain bg-slate-100" />
  ) : null;
}

export default function EarlyWithdrawalForm({
  payable,
  banks,
  minimum,
  onClose,
  onCreated,
}: {
  payable: Payable;
  banks: BankAccount[];
  minimum: number;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [amount, setAmount] = useState('');
  const [bank, setBank] = useState('');
  const [reason, setReason] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const requestKey = useRef(crypto.randomUUID());
  const changed = () => {
    requestKey.current = crypto.randomUUID();
    setError('');
  };
  const verified = banks.filter((item) => item.status === 'VERIFIED');
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (busy) return;
    const invalid = earlyRequestError(reason, files);
    if (invalid) {
      setError(invalid);
      return;
    }
    setBusy(true);
    setError('');
    try {
      await financeApi.requestEarly(
        {
          bankAccountId: bank,
          requestKey: requestKey.current,
          payableId: payable.id,
          amount: Number(amount),
          reason: reason.trim(),
          password,
        },
        files
      );
      setPassword('');
      onCreated();
    } catch (cause) {
      setError(financeError(cause));
    } finally {
      setBusy(false);
    }
  };
  return (
    <Modal title="Xin rút tiền sớm" onClose={onClose} busy={busy}>
      <p className="font-semibold">{payable.jobTitle}</p>
      <Notice>
        Hạn bảo trì: {dateTime(payable.availableAt)}. Chi sớm cần admin chấp thuận và không kết thúc
        nghĩa vụ bảo trì. Tiền hoàn cọc vẫn chờ đủ điều kiện thông thường.
      </Notice>
      {verified.length === 0 ? (
        <Notice error>
          Hãy thêm tài khoản ngân hàng và chờ xác minh trong mục Tài khoản ngân hàng trước khi xin
          rút sớm.
        </Notice>
      ) : (
        <form onSubmit={(event) => void submit(event)} className="space-y-4">
          <fieldset disabled={busy} className="space-y-4">
            <Field
              label="Số tiền xin rút sớm (VND)"
              hint={`Tối đa: ${money(payable.earlyAvailableAmount || 0)} · Tối thiểu: ${money(minimum)}`}
            >
              <input
                required
                type="number"
                min={minimum}
                max={payable.earlyAvailableAmount || 0}
                step={1}
                className={inputClass}
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  changed();
                }}
              />
            </Field>
            <Field label="Tài khoản nhận tiền">
              <select
                required
                className={inputClass}
                value={bank}
                onChange={(e) => {
                  setBank(e.target.value);
                  changed();
                }}
              >
                <option value="">Chọn tài khoản đã xác minh</option>
                {verified.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.bankCode} · •••• {item.lastFour}
                  </option>
                ))}
              </select>
            </Field>
            <Field
              label="Lý do cần rút sớm (bắt buộc)"
              hint="Mô tả cụ thể hoàn cảnh cần tiền gấp. Chỉ bạn và admin xem được nội dung này."
            >
              <textarea
                required
                maxLength={2000}
                rows={4}
                className={inputClass}
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  changed();
                }}
              />
            </Field>
            <Field
              label="Ảnh bằng chứng (bắt buộc)"
              hint="Chọn 1–5 ảnh JPG/PNG/WebP, tối đa 5 MB mỗi ảnh. Có thể che thông tin cá nhân không cần thiết."
            >
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className={inputClass}
                onChange={(e) => {
                  const selected = Array.from(e.target.files || []);
                  const invalid = evidenceError(selected);
                  if (invalid) {
                    setError(invalid);
                    e.target.value = '';
                    return;
                  }
                  setFiles(selected);
                  changed();
                  e.target.value = '';
                }}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              {files.map((file, index) => (
                <div key={`${file.name}-${index}`} className="min-w-0 space-y-1">
                  <LocalImage file={file} />
                  <p className="truncate text-xs text-slate-500">{file.name}</p>
                  <button
                    type="button"
                    className="text-xs text-red-700 underline"
                    onClick={() => {
                      setFiles(files.filter((_, i) => i !== index));
                      changed();
                    }}
                  >
                    Bỏ ảnh
                  </button>
                </div>
              ))}
            </div>
            <Field label="Mật khẩu SAM hiện tại">
              <input
                required
                type="password"
                autoComplete="current-password"
                maxLength={200}
                className={inputClass}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Field>
            <Notice>
              Sau khi gửi, số tiền, lý do và ảnh được giữ nguyên để xét duyệt. Yêu cầu thành công
              khi toàn bộ ảnh đã được lưu.
            </Notice>
          </fieldset>
          {error && <Notice error>{error}</Notice>}
          <div className="flex justify-end gap-2">
            <button type="button" disabled={busy} className={secondaryClass} onClick={onClose}>
              Đóng
            </button>
            <button
              type="submit"
              disabled={busy || !files.length || !reason.trim()}
              className={primaryClass}
            >
              {busy ? 'Đang gửi yêu cầu và ảnh…' : 'Gửi ticket rút sớm'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
