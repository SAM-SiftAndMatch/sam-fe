import type React from 'react';
import { Link } from 'react-router-dom';

interface ButtonProps {
  children: React.ReactNode;
  to?: string;
  href?: string;
  onClick?: () => void;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  withArrow?: boolean;
  size?: 'default' | 'sm';
}

export const PrimaryButton: React.FC<ButtonProps> = ({
  children,
  to,
  href,
  onClick,
  className = '',
  type = 'button',
  disabled = false,
  withArrow = true,
  size = 'default',
}) => {
  const sizeClasses = size === 'sm' ? 'h-[38px] px-4 text-xs' : 'h-[44px] px-6 text-sm';

  const baseClasses = `
    group btn-sweep inline-flex items-center justify-center gap-2
    ${sizeClasses} rounded-[8px] font-medium text-white
    bg-[#1D4ED8] hover:bg-[#153BB5]
    border-t border-t-[#60A5FA] border-x border-x-[#1D4ED8] border-b border-b-[#1E40AF]
    shadow-[0_1px_2px_rgba(0,0,0,0.06)]
    active:scale-[0.97] transition-all duration-150 cursor-pointer
    focus-visible:outline-2 focus-visible:outline-[#1D4ED8] focus-visible:outline-offset-2 outline-none
    disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none
    ${className}
  `
    .trim()
    .replace(/\s+/g, ' ');

  const content = (
    <>
      <span>{children}</span>
      {withArrow && (
        <span
          className="inline-block transition-transform duration-200 group-hover:translate-x-1 font-mono text-sm"
          aria-hidden="true"
        >
          →
        </span>
      )}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={baseClasses}>
        {content}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={baseClasses}>
        {content}
      </a>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={baseClasses}>
      {content}
    </button>
  );
};

export const SecondaryButton: React.FC<ButtonProps> = ({
  children,
  to,
  href,
  onClick,
  className = '',
  type = 'button',
  disabled = false,
  withArrow = false,
  size = 'default',
}) => {
  const sizeClasses = size === 'sm' ? 'h-[38px] px-4 text-xs' : 'h-[44px] px-6 text-sm';

  const baseClasses = `
    group inline-flex items-center justify-center gap-2
    ${sizeClasses} rounded-[8px] font-medium text-slate-700
    bg-transparent border border-slate-200
    hover:border-[#1D4ED8] hover:bg-[#1D4ED8]/[0.06] hover:text-[#1D4ED8]
    active:scale-[0.97] transition-all duration-150 cursor-pointer
    focus-visible:outline-2 focus-visible:outline-[#1D4ED8] focus-visible:outline-offset-2 outline-none
    disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none
    ${className}
  `
    .trim()
    .replace(/\s+/g, ' ');

  const content = (
    <>
      <span>{children}</span>
      {withArrow && (
        <span
          className="inline-block transition-transform duration-200 group-hover:translate-x-1 font-mono text-sm"
          aria-hidden="true"
        >
          →
        </span>
      )}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={baseClasses}>
        {content}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={baseClasses}>
        {content}
      </a>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={baseClasses}>
      {content}
    </button>
  );
};

export const MonoTag: React.FC<{
  children: React.ReactNode;
  variant?: 'primary' | 'muted' | 'success';
  className?: string;
}> = ({ children, variant = 'muted', className = '' }) => {
  const variantStyles = {
    muted: 'border-slate-200 bg-white text-slate-600',
    primary: 'border-[#1D4ED8]/30 bg-[#1D4ED8]/[0.06] text-[#1D4ED8]',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  }[variant];

  return (
    <span
      className={`inline-flex items-center gap-1 font-mono text-[11px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-[6px] border ${variantStyles} ${className}`}
    >
      {children}
    </span>
  );
};
