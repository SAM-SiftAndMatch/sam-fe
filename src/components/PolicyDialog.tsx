import { X } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { POLICY_VERSION, policySections, privacySections } from '../lib/participation-policy';

export type PolicyType = 'terms' | 'privacy';

export default function PolicyDialog({
  policy,
  onClose,
}: {
  policy: PolicyType;
  onClose: () => void;
}) {
  const [selectedPolicy, setSelectedPolicy] = useState(policy);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const contentRef = useRef<HTMLDivElement>(null);
  const privacy = selectedPolicy === 'privacy';

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    };
  }, []);

  const selectPolicy = (nextPolicy: PolicyType) => {
    setSelectedPolicy(nextPolicy);
    contentRef.current?.scrollTo({ top: 0 });
  };

  return createPortal(
    <dialog
      ref={dialogRef}
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClose={() => {
        if (!dialogRef.current?.open) onClose();
      }}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return;
        const bounds = event.currentTarget.getBoundingClientRect();
        if (
          event.clientX < bounds.left ||
          event.clientX > bounds.right ||
          event.clientY < bounds.top ||
          event.clientY > bounds.bottom
        ) {
          onClose();
        }
      }}
      className="fixed inset-0 m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-3xl overflow-hidden rounded-3xl border border-slate-200 bg-white p-0 text-slate-900 shadow-2xl backdrop:bg-slate-900/50 backdrop:backdrop-blur-sm"
    >
      <div className="flex max-h-[calc(100dvh-2rem)] flex-col font-sans">
        <header className="shrink-0 border-b border-slate-100 px-5 pt-6 sm:px-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 id={titleId} className="text-xl font-extrabold sm:text-2xl">
                {privacy ? 'Chính sách Bảo mật' : 'Điều khoản Dịch vụ'}
              </h2>
              <p id={descriptionId} className="mt-2 text-xs leading-5 text-slate-500 sm:text-sm">
                Phiên bản {POLICY_VERSION} · Áp dụng cho client và freelancer
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Đóng nội dung chính sách"
              className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-blue-600"
            >
              <X size={20} aria-hidden="true" />
            </button>
          </div>
          <div className="mt-5 flex gap-4">
            {(
              [
                ['terms', 'Điều khoản Dịch vụ'],
                ['privacy', 'Chính sách Bảo mật'],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                aria-pressed={selectedPolicy === value}
                onClick={() => selectPolicy(value)}
                className={`cursor-pointer border-b-2 px-1 pb-3 text-xs font-semibold transition-colors sm:text-sm ${selectedPolicy === value ? 'border-[#1D4ED8] text-[#1D4ED8]' : 'border-transparent text-slate-500 hover:text-slate-900'}`}
              >
                {label}
              </button>
            ))}
          </div>
        </header>
        <div
          ref={contentRef}
          className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-6 sm:px-8"
        >
          {(privacy ? privacySections : policySections).map((section, index) => (
            <section key={section.title}>
              <h3 className="text-sm font-bold text-slate-900 sm:text-base">
                {index + 1}. {section.title}
              </h3>
              <p className="mt-2 text-sm leading-7 text-slate-600">{section.text}</p>
            </section>
          ))}
        </div>
        <footer className="flex shrink-0 justify-end border-t border-slate-100 px-5 py-4 sm:px-8">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-xl bg-[#1D4ED8] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            Đóng
          </button>
        </footer>
      </div>
    </dialog>,
    document.body
  );
}
