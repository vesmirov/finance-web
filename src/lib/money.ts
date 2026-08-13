// Display formatting only — no money arithmetic here.
// All amounts, totals and shares arrive as ready-made strings from GET /api/plan.

/** Equivalents and totals: en-US, always 2 decimals ("8,581.61"). */
export function fmtMoney(value: string): string {
  const n = Number.parseFloat(value);
  if (!Number.isFinite(n)) return value;
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** Native amounts: en-US, no insignificant tails ("4,350", "3.5"). */
export function fmtNative(value: string): string {
  const n = Number.parseFloat(value);
  if (!Number.isFinite(n)) return value;
  return n.toLocaleString('en-US', { maximumFractionDigits: 2 });
}

/** Share "0.2894" → "28.9%"; null (zero income) → "—". */
export function fmtShare(share: string | null): string {
  if (share === null) return '—';
  const n = Number.parseFloat(share);
  if (!Number.isFinite(n)) return '—';
  return (n * 100).toFixed(1) + '%';
}

/** Markup "5" → "+5%"; "0"/empty → "". */
export function fmtMarkup(pct: string): string {
  const n = Number.parseFloat(pct);
  if (!Number.isFinite(n) || n === 0) return '';
  return '+' + pct.trim() + '%';
}

/** Sign of a decimal string without parsing it into a number. */
export function isNegative(value: string): boolean {
  return value.trim().startsWith('-');
}

/** Absolute value of a decimal string (a string operation). */
export function absString(value: string): string {
  return value.trim().replace(/^-/, '');
}
