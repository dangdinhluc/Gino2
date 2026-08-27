export function formatAdminDate(value: unknown): string {
  const date = new Date(typeof value === 'string' ? value : '');
  return Number.isNaN(date.getTime())
    ? '—'
    : new Intl.DateTimeFormat('vi-VN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(date);
}
