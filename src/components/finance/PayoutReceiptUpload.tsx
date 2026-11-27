import { useEffect, useState } from 'react';
import { evidenceError } from '../../lib/early-withdrawal';
import { Field, inputClass } from './FinanceUI';

export default function PayoutReceiptUpload({
  files,
  onChange,
  onError,
  disabled = false,
}: {
  files: File[];
  onChange: (files: File[]) => void;
  onError: (message: string) => void;
  disabled?: boolean;
}) {
  const [previews, setPreviews] = useState<{ file: File; url: string }[]>([]);
  useEffect(() => {
    const next = files.map((file) => ({ file, url: URL.createObjectURL(file) }));
    setPreviews(next);
    return () => {
      for (const item of next) URL.revokeObjectURL(item.url);
    };
  }, [files]);
  return (
    <div className="space-y-3">
      <Field
        label="Ảnh biên lai chuyển khoản (bắt buộc)"
        hint="Chọn 1–5 ảnh JPG/PNG/WebP từ giao dịch ngân hàng đã thực hiện, tối đa 5 MB/ảnh. Chứng từ được lưu riêng, chỉ admin xem được."
      >
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          disabled={disabled}
          className={inputClass}
          onChange={(event) => {
            const selected = Array.from(event.target.files || []);
            event.target.value = '';
            if (!selected.length) return;
            const error = evidenceError(selected);
            if (error) {
              onError(error);
              return;
            }
            onError('');
            onChange(selected);
          }}
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        {previews.map(({ file, url }, index) => (
          <div key={url} className="min-w-0 rounded-xl border border-slate-200 p-2">
            <img
              src={url}
              alt={`Biên lai ${file.name}`}
              className="h-32 w-full rounded-lg bg-slate-50 object-contain"
            />
            <p className="mt-1 truncate text-xs text-slate-500">{file.name}</p>
            <button
              type="button"
              disabled={disabled}
              className="mt-1 text-xs text-red-700 underline"
              onClick={() => {
                onChange(files.filter((_, i) => i !== index));
                onError('');
              }}
            >
              Bỏ ảnh biên lai
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
