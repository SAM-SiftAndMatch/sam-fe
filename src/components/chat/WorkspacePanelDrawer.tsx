import { X } from 'lucide-react';
import { type ReactNode, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

export default function WorkspacePanelDrawer({
  children,
  controls,
  onClose,
}: { children: ReactNode; controls: ReactNode; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    dialog?.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      dialog?.close();
      document.body.style.overflow = overflow;
      if (previous instanceof HTMLElement) previous.focus();
    };
  }, []);
  return createPortal(
    <dialog
      ref={ref}
      aria-label="Thông tin cuộc hội thoại"
      aria-modal="true"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClose={() => {
        if (!ref.current?.open) onClose();
      }}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return;
        const bounds = event.currentTarget.getBoundingClientRect();
        if (event.clientX < bounds.left || event.clientX > bounds.right) onClose();
      }}
      className="workspace-resource-drawer fixed inset-y-0 right-0 left-auto m-0 h-dvh max-h-dvh w-full max-w-sm rounded-l-3xl border-0 bg-slate-100 p-0 text-slate-900 shadow-xl backdrop:bg-slate-900/40"
    >
      <div className="flex h-full min-h-0 flex-col">
        <header className="workspace-section-header relative z-10 flex shrink-0 items-center justify-between gap-2 border-b px-4 py-3">
          <span className="text-xs font-semibold text-slate-500">Chi tiết</span>
          <div className="flex items-center gap-1">
            {controls}
            <button
              type="button"
              onClick={onClose}
              aria-label="Đóng thông tin cuộc hội thoại"
              className="rounded-full p-2 text-slate-500 hover:bg-slate-100"
            >
              <X size={18} />
            </button>
          </div>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto p-4">{children}</div>
      </div>
    </dialog>,
    document.body
  );
}
