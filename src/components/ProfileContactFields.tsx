import type { UseFormRegisterReturn } from 'react-hook-form';
import { POLICY_VERSION } from '../lib/participation-policy';
import PolicyLinks from './PolicyLinks';

type Props = {
  contractName: UseFormRegisterReturn;
  contactEmail: UseFormRegisterReturn;
  phoneNumber: UseFormRegisterReturn;
  acceptedTerms: UseFormRegisterReturn;
  errors: {
    contractName?: { message?: string };
    contactEmail?: { message?: string };
    phoneNumber?: { message?: string };
    acceptedTerms?: { message?: string };
  };
};
export default function ProfileContactFields(props: Props) {
  return (
    <fieldset className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <legend className="px-2 text-sm font-bold text-slate-900">
        Thông tin dùng trong hợp đồng
      </legend>
      <p className="text-sm leading-6 text-slate-500">
        Điền thông tin chính xác trước khi đăng hoặc tham gia dự án. Thông tin sẽ được lưu vào hợp
        đồng và hiển thị cho bên hợp tác.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {(
          [
            ['contractName', 'Họ và tên trên hợp đồng', 'text', 'name'],
            ['phoneNumber', 'Số điện thoại', 'tel', 'tel'],
            ['contactEmail', 'Email liên hệ', 'email', 'email'],
          ] as const
        ).map(([name, label, type, autoComplete]) => (
          <div key={name} className={name === 'contractName' ? 'sm:col-span-2' : ''}>
            <label htmlFor={name} className="mb-2 block text-sm font-semibold text-slate-700">
              {label} <span className="text-red-500">*</span>
            </label>
            <input
              id={name}
              type={type}
              autoComplete={autoComplete}
              {...props[name]}
              aria-invalid={Boolean(props.errors[name])}
              aria-describedby={props.errors[name] ? `${name}-error` : undefined}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm focus:border-[#1D4ED8] focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
            {props.errors[name] && (
              <p id={`${name}-error`} className="mt-1 text-xs text-red-600">
                {props.errors[name]?.message}
              </p>
            )}
          </div>
        ))}
      </div>
      <div className="flex items-start gap-2 text-sm leading-6 text-slate-600">
        <input
          id="profileAcceptedTerms"
          type="checkbox"
          {...props.acceptedTerms}
          className="mt-1 h-4 w-4 shrink-0 accent-blue-700"
        />
        <div>
          <label htmlFor="profileAcceptedTerms">
            Tôi xác nhận thông tin chính xác, đã đọc và đồng ý với{' '}
          </label>
          <PolicyLinks />
          <label htmlFor="profileAcceptedTerms">
            {' '}
            của SAM (phiên bản {POLICY_VERSION}), bao gồm trách nhiệm khi tham gia dự án.
          </label>
        </div>
      </div>
      {props.errors.acceptedTerms && (
        <p className="text-xs text-red-600">{props.errors.acceptedTerms.message}</p>
      )}
    </fieldset>
  );
}
