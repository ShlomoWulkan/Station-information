import type { Station } from '@/types';

/** בדיקת תקינות לרשימת תחנות שנקראה מאחסון — התוכן שם אינו מובטח. */
export function isStationList(value: unknown): value is Station[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        typeof item === 'object' &&
        item !== null &&
        'id' in item &&
        'code' in item &&
        'name' in item,
    )
  );
}

/** מנרמל שדות שעלולים להיות מספרים בנתונים ישנים. */
export function normalize(station: Station): Station {
  return { ...station, id: String(station.id), code: String(station.code) };
}

/** מוסיף בראש הרשימה ומסיר כפילות קודמת. */
export function prepend(list: Station[], station: Station, max?: number): Station[] {
  const next = [normalize(station), ...list.filter((s) => String(s.id) !== String(station.id))];
  return max ? next.slice(0, max) : next;
}
