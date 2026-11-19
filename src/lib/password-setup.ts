import { PATH_CLIENT_DASHBOARD, PATH_FREELANCER_EARNINGS, PATH_HOME } from '../routes/paths';

export const PASSWORD_SETUP_RETURN_KEY = 'sam:password-setup:return-to';
export const BANK_PASSWORD_SETUP_RETURN = `${PATH_FREELANCER_EARNINGS}?tab=banks&action=add-bank`;

/** Only known in-app destinations may survive the full-page Google redirect. */
export function passwordSetupReturnTo(value: string | null, role?: string): string {
  if (role === 'FREELANCER') {
    return value === BANK_PASSWORD_SETUP_RETURN
      ? BANK_PASSWORD_SETUP_RETURN
      : `${PATH_FREELANCER_EARNINGS}?tab=banks`;
  }
  return role === 'CLIENT' ? PATH_CLIENT_DASHBOARD : PATH_HOME;
}

export function passwordSetupValidation(password: string, confirmation: string): string {
  if (!password.trim() || password.length < 8) return 'Mật khẩu SAM phải có ít nhất 8 ký tự.';
  // BCrypt accepts at most 72 UTF-8 bytes; never truncate or trim the chosen password.
  if (new TextEncoder().encode(password).length > 72)
    return 'Mật khẩu SAM quá dài. Hãy dùng tối đa 72 ký tự ASCII hoặc ít ký tự hơn nếu có dấu.';
  if (password !== confirmation) return 'Xác nhận mật khẩu chưa khớp.';
  return '';
}
