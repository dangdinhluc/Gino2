const ZERO_DECIMAL_CURRENCIES = new Set([
  'JPY',
  'VND',
  'KRW',
  'CLP',
  'ISK',
  'VUV',
  'XAF',
  'XOF',
  'XPF',
]);

export function isZeroDecimalCurrency(currency: string): boolean {
  return ZERO_DECIMAL_CURRENCIES.has(currency.trim().toUpperCase());
}

/**
 * Format a stored integer amount.
 * Zero-decimal currencies (JPY/VND/...) keep the integer as the major unit.
 * Other currencies treat the integer as minor units (cents).
 */
export function formatMinorUnitAmount(amount: number, currency: string): string {
  if (!Number.isFinite(amount) || amount <= 0) return 'Miễn phí';
  const code = currency.trim().toUpperCase() || 'VND';
  const value = isZeroDecimalCurrency(code) ? amount : amount / 100;
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: code,
    maximumFractionDigits: isZeroDecimalCurrency(code) ? 0 : 2,
  }).format(value);
}

/** Paid checkout is not implemented. UI must keep paid packages disabled. */
export function isPaidCheckoutEnabled(): boolean {
  return false;
}
