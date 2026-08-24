import { describe, expect, it } from 'vitest';
import { formatMinorUnitAmount, isPaidCheckoutEnabled, isZeroDecimalCurrency } from '@/src/shared/lib/money';

describe('money formatting', () => {
  it('does not divide JPY or VND by 100', () => {
    expect(isZeroDecimalCurrency('jpy')).toBe(true);
    expect(isZeroDecimalCurrency('VND')).toBe(true);
    expect(formatMinorUnitAmount(2500, 'JPY')).toContain('2.500');
    expect(formatMinorUnitAmount(250000, 'VND')).toContain('250.000');
  });

  it('treats USD-style amounts as minor units', () => {
    expect(isZeroDecimalCurrency('USD')).toBe(false);
    expect(formatMinorUnitAmount(1299, 'USD')).toMatch(/12[,.]99|US\$12.99|12,99/);
  });

  it('keeps paid checkout disabled until a verified provider exists', () => {
    expect(isPaidCheckoutEnabled()).toBe(false);
    expect(formatMinorUnitAmount(0, 'JPY')).toBe('Miễn phí');
  });
});
