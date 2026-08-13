// Category palette: 8 fixed slots from the v7c prototype.
export const PALETTE = [
  '#3987e5',
  '#d95926',
  '#199e70',
  '#c98500',
  '#d55181',
  '#008300',
  '#9085e9',
  '#e66767',
] as const;

export function slotHex(slot: number): string {
  return PALETTE[slot - 1] ?? '#939aa4';
}

/** First free slot 1..8; if all are taken — 8 (as in the prototype). */
export function firstFreeSlot(used: number[]): number {
  for (let slot = 1; slot <= 8; slot++) {
    if (!used.includes(slot)) return slot;
  }
  return 8;
}

// Labels for known currencies in the target-currency select (others are just the code).
export const CURRENCY_LABELS: Record<string, string> = {
  USD: 'USD — US Dollar',
  EUR: 'EUR — Euro',
  GEL: 'GEL — Georgian Lari',
  THB: 'THB — Thai Baht',
  RUB: 'RUB — Russian Ruble',
};

export function currencyLabel(code: string): string {
  return CURRENCY_LABELS[code] ?? code;
}
