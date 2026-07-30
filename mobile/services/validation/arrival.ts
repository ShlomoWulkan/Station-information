import type { BusArrival } from '@/types';
import { asString, asStringOr, isFiniteNumber, isObject, type Parser } from './primitives';

export const parseArrival: Parser<BusArrival> = (raw) => {
  if (!isObject(raw)) return null;

  const lineNumber = asString(raw.lineNumber);
  if (lineNumber === null || !isFiniteNumber(raw.minutesUntilArrival)) return null;

  const minutesUntilArrival = Math.max(0, Math.round(raw.minutesUntilArrival));

  return {
    // שרת ישן לא שולח id. הגיבוי אינו ייחודי בהכרח, ולכן parseArrivalList
    // מוודא ייחודיות אחרי הפיענוח.
    id: asString(raw.id) ?? `${lineNumber}|${minutesUntilArrival}`,
    lineNumber,
    destination: asStringOr(raw.destination, ''),
    minutesUntilArrival,
    isRealTime: raw.isRealTime === true,
  };
};

/**
 * מפענח רשימת נסיעות ומבטיח שהמזהים ייחודיים.
 *
 * השכבה הזאת קיימת כי מפתח כפול מפיל אזהרה ב-React ועלול לגרום לשורות
 * להיעלם או להשתכפל. הייחודיות לא נסמכת על מה שהשרת שלח.
 */
export function ensureUniqueIds(arrivals: BusArrival[]): BusArrival[] {
  const seen = new Map<string, number>();

  return arrivals.map((arrival) => {
    const count = seen.get(arrival.id) ?? 0;
    seen.set(arrival.id, count + 1);
    return count === 0 ? arrival : { ...arrival, id: `${arrival.id}#${count}` };
  });
}
