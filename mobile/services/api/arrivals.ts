import { USE_FIXTURES } from '@/constants/config';
import type { BusArrival } from '@/types';
import { fixtureArrivals } from '../fixtures/arrivals';
import { apiFetch, seg } from '../http';
import { parseArrival, parseList } from '../validation';

/**
 * זמני הגעה לתחנה.
 *
 * כשל כאן נזרק הלאה ומוצג כשגיאה. בעבר המסך הקורא החליף כשל בנתוני דמו, כך
 * שהמשתמש ראה זמני אוטובוס מזויפים. נתוני דמו נשלטים היום רק על ידי
 * USE_FIXTURES, שכפוף ל-__DEV__ ומסומן על המסך.
 */
export async function fetchArrivals(stationCode: string): Promise<BusArrival[]> {
  if (USE_FIXTURES) return fixtureArrivals(stationCode);

  const raw = await apiFetch<unknown>(`/arrivals/${seg(stationCode)}`);
  return parseList(raw, parseArrival).sort(
    (a, b) => a.minutesUntilArrival - b.minutesUntilArrival,
  );
}
