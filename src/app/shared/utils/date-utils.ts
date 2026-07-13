// ──────────────────────────────────────────────────────────────────────────────
// Date-only + centre-timezone helpers.
//
// A calendar day picked in the UI is a *date-only* value. It must never pass
// through Date#toISOString(), which converts to UTC and shifts the day for any
// browser east of UTC (e.g. picking 22 July in Kuala Lumpur (+08:00) becomes
// "2026-07-21"). Serialize with toLocalYMD / parse with parseYMDLocal instead.
//
// Scheduled date+time values are interpreted in the centre's timezone
// (Asia/Kuala_Lumpur, UTC+08:00, no DST), not the browser's — a parent booking
// "10:00" from any country must mean 10:00 at the centre.
// ──────────────────────────────────────────────────────────────────────────────

/** Fixed UTC offset of the centre (Asia/Kuala_Lumpur — Malaysia has no DST). */
export const CENTRE_UTC_OFFSET = '+08:00';

/** IANA timezone of the centre, for display formatting. */
export const CENTRE_TIMEZONE = 'Asia/Kuala_Lumpur';

/** Format a Date's LOCAL calendar day as 'YYYY-MM-DD' (never via toISOString). */
export function toLocalYMD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Parse 'YYYY-MM-DD' as a LOCAL-midnight Date (new Date('YYYY-MM-DD') would be UTC midnight). */
export function parseYMDLocal(value: string): Date {
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

/** True when both values represent the same calendar day (date-only comparison). */
export function isSameYMD(a: Date | string, b: Date | string): boolean {
  const ymdA = typeof a === 'string' ? a : toLocalYMD(a);
  const ymdB = typeof b === 'string' ? b : toLocalYMD(b);
  return ymdA === ymdB;
}

/**
 * Combine a 'YYYY-MM-DD' date and 'HH:mm' time into an ISO-8601 timestamp
 * anchored to the CENTRE timezone, e.g. '2026-07-22T10:00:00+08:00'.
 * The backend parses this unambiguously regardless of the browser's timezone.
 */
export function toCentreTimestamp(dateYmd: string, timeHHmm: string): string {
  return `${dateYmd}T${timeHHmm}:00${CENTRE_UTC_OFFSET}`;
}
