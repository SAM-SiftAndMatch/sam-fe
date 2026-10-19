import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

type ConfirmDeleteModalProps = {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  error?: string | null;
  isPending?: boolean;
  isDanger?: boolean;
};

const ConfirmDeleteModal = ({
  isOpen,
  onConfirm,
  onCancel,
  title = 'Xác nhận xóa dự án',
  message = 'Bạn có chắc chắn muốn xóa dự án này? Hành động này không thể hoàn tác.',
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  error,
  isPending = false,
  isDanger = true,
}: ConfirmDeleteModalProps) => {
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const previousFocus = document.activeElement;
    cancelButtonRef.current?.focus();
    return () => {
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isPending) onCancel();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, isPending, onCancel]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <dialog
        open
        aria-modal="true"
        aria-labelledby="confirm-delete-title"
        aria-describedby="confirm-delete-message"
        className="relative m-0 w-full max-w-sm rounded-2xl border-0 bg-white p-6 shadow-xl animate-in fade-in zoom-in duration-200"
      >
        <h3 id="confirm-delete-title" className="text-xl font-bold text-gray-900 mb-2">
          {title}
        </h3>
        <p id="confirm-delete-message" className="text-sm text-gray-600 mb-6">
          {message}
        </p>
        {error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-xs text-red-700">{error}</p>}
        <div className="flex gap-3 justify-end">
          <button
            ref={cancelButtonRef}
            type="button"
            onClick={onCancel}
            disabled={isPending}
            className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 font-medium transition-colors border-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className={`px-4 py-2 rounded-lg text-white font-medium transition-colors border-0 cursor-pointer shadow-sm disabled:opacity-60 disabled:cursor-not-allowed ${
              isDanger ? 'bg-red-600 hover:bg-red-700' : 'bg-[#1D4ED8] hover:bg-[#153bb5]'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </dialog>
    </div>,
    document.body
  );
};

export default ConfirmDeleteModal;
