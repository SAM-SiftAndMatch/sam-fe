export interface BankOption {
  code: string;
  name: string;
}

// MBB was accepted and suggested before the bank picker was introduced.
export function normalizeBankCode(value: string): string {
  const code = value.trim().toUpperCase();
  return code === 'MBB' ? 'MB' : code;
}

export function isSupportedBankCode(value: string): boolean {
  return VIETNAM_BANKS.some((bank) => bank.code === normalizeBankCode(value));
}

// Mã ngân hàng dùng nội bộ khi lưu và đối soát tài khoản nhận tiền.
export const VIETNAM_BANKS: BankOption[] = [
  { code: 'VCB', name: 'Vietcombank' },
  { code: 'MB', name: 'MB Bank' },
  { code: 'BIDV', name: 'BIDV' },
  { code: 'CTG', name: 'VietinBank' },
  { code: 'ACB', name: 'ACB' },
  { code: 'TCB', name: 'Techcombank' },
  { code: 'VPB', name: 'VPBank' },
  { code: 'TPB', name: 'TPBank' },
  { code: 'STB', name: 'Sacombank' },
  { code: 'HDB', name: 'HDBank' },
  { code: 'VIB', name: 'VIB' },
  { code: 'SHB', name: 'SHB' },
  { code: 'LPB', name: 'LPBank' },
  { code: 'MSB', name: 'MSB' },
  { code: 'OCB', name: 'OCB' },
  { code: 'EIB', name: 'Eximbank' },
  { code: 'SEAB', name: 'SeABank' },
  { code: 'ABB', name: 'ABBank' },
  { code: 'BAB', name: 'Bac A Bank' },
  { code: 'NAB', name: 'Nam A Bank' },
  { code: 'SCB', name: 'SCB' },
  { code: 'PGB', name: 'PG Bank' },
  { code: 'KLB', name: 'KienlongBank' },
  { code: 'SHBVN', name: 'Shinhan Bank Vietnam' },
  { code: 'CAKE', name: 'CAKE by VPBank' },
  { code: 'UBANK', name: 'UBank' },
  { code: 'PVCB', name: 'PVCombank' },
  { code: 'BVB', name: 'BVBank' },
  { code: 'NCB', name: 'NCB' },
  { code: 'SGB', name: 'Saigonbank' },
  { code: 'VAB', name: 'VietABank' },
  { code: 'DAB', name: 'Dong A Bank' },
  { code: 'GPB', name: 'GPBank' },
  { code: 'HLBVN', name: 'Hong Leong Bank' },
  { code: 'CIMB', name: 'CIMB Bank' },
  { code: 'UOB', name: 'UOB Vietnam' },
  { code: 'WOO', name: 'Woori Bank Vietnam' },
  { code: 'IVB', name: 'Indovina Bank' },
  { code: 'VRB', name: 'VRBank' },
  { code: 'COOPB', name: 'Co-opBank' },
];
