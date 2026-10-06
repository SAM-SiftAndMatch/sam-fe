export const formatMoney = (num: number) => new Intl.NumberFormat('vi-VN').format(num);

export const formatDate = (iso: string | null | undefined) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString('vi-VN');
};
