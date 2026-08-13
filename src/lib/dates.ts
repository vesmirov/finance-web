/** "12.08" for the "rates as of …" indicator. */
export function fmtDayMonth(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}`;
}

/** "12.08 09:00" for the rates table. */
export function fmtDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${fmtDayMonth(iso)} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

/** The server refreshes rates every 5 minutes; older than an hour means the refresher is down. */
export function isFresh(iso: string | null, hours = 1): boolean {
  if (iso === null) return false;
  const t = new Date(iso).getTime();
  return Number.isFinite(t) && Date.now() - t < hours * 3_600_000;
}
