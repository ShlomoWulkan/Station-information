import type { BusArrival } from '@/types';
import { apiFetch, seg } from '../http';
import { ensureUniqueIds, parseArrival, parseList } from '../validation';

/**
 * זמני הגעה לתחנה.
 *
 * כשל נזרק הלאה ומוצג כשגיאה, תמיד. אין נתיב חלופי: בעבר המסך הקורא החליף כל
 * כשל בנתוני דמו קבועים, כך שהמשתמש ראה זמני אוטובוס מזויפים כאילו היו אמיתיים.
 */
export async function fetchArrivals(stationCode: string): Promise<BusArrival[]> {
  const raw = await apiFetch<unknown>(`/arrivals/${seg(stationCode)}`);
  const arrivals = parseList(raw, parseArrival).sort(
    (a, b) => a.minutesUntilArrival - b.minutesUntilArrival,
  );
  return ensureUniqueIds(arrivals);
}
