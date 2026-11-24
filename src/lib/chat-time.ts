const zone = 'Asia/Ho_Chi_Minh';
export function chatDate(value?: string | null): Date | null {
  if (!value) return null;
  // Legacy API timestamps use the server wall clock; new responses include an offset.
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}
export function chatTime(value?: string | null): string {
  const date = chatDate(value);
  return date
    ? new Intl.DateTimeFormat('vi-VN', {
        timeZone: zone,
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23',
      }).format(date)
    : '';
}
export function chatSeparator(current?: string | null, previous?: string | null): string | null {
  const date = chatDate(current);
  if (!date) return null;
  const day = (d: Date) =>
    new Intl.DateTimeFormat('vi-VN', {
      timeZone: zone,
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(d);
  const before = chatDate(previous);
  if (!before)
    return day(date) === day(new Date())
      ? chatTime(current)
      : `${day(date)} · ${chatTime(current)}`;
  if (day(date) !== day(before)) return `${day(date)} · ${chatTime(current)}`;
  if (chatTime(current).slice(0, 2) !== chatTime(previous).slice(0, 2)) return chatTime(current);
  return null;
}
