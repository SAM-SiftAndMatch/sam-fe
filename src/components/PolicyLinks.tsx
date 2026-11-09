import { type ReactNode, useCallback, useState } from 'react';
import PolicyDialog, { type PolicyType } from './PolicyDialog';

export function PolicyButton({
  policy,
  children,
  className = 'cursor-pointer border-0 bg-transparent p-0 text-left font-semibold text-[#1D4ED8] underline underline-offset-2 hover:text-blue-800',
}: {
  policy: PolicyType;
  children: ReactNode;
  className?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const close = useCallback(() => setIsOpen(false), []);
  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-haspopup="dialog"
        className={className}
      >
        {children}
      </button>
      {isOpen && <PolicyDialog policy={policy} onClose={close} />}
    </>
  );
}

export default function PolicyLinks() {
  return (
    <>
      <PolicyButton policy="terms">Điều khoản Dịch vụ</PolicyButton> và{' '}
      <PolicyButton policy="privacy">Chính sách Bảo mật</PolicyButton>
    </>
  );
}
