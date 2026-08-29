// ==============================================================================
// Eggstra - Currency & Number Formatting Helpers (Philippine Peso ₱ / PHP)
// ==============================================================================

export const CURRENCY_SYMBOL = '₱';
export const CURRENCY_CODE = 'PHP';

/**
 * Format a numeric amount into Philippine Peso (e.g., ₱1,250.00)
 */
export function formatPHP(amount: number, decimals: number = 2): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '₱0.00';
  }
  return `₱${amount.toLocaleString('en-PH', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

/**
 * Short formatting for chart ticks (e.g., ₱1.5k, ₱25k, ₱1.2M)
 */
export function formatPHPShort(amount: number): string {
  if (amount >= 1_000_000) {
    return `₱${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (amount >= 1_000) {
    return `₱${(amount / 1_000).toFixed(1)}k`;
  }
  return `₱${amount.toFixed(0)}`;
}
