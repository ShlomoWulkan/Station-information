/**
 * נתוני דמו לפיתוח מקומי בלבד.
 *
 * למה זה קיים: מפתח ה-SIRI של משרד התחבורה מאושר לקריאות מ-IP של ה-VPS בלבד,
 * לכן /arrivals לא יכול להחזיר כלום ממכונת פיתוח. יש שתי דרכים לעבוד על מסך
 * זמני ההגעה, ומנהרה עדיפה כי היא מציגה נתונים אמיתיים:
 *
 *   1. מנהרת SSH — ssh -L 5001:127.0.0.1:5000 <user>@204.168.150.129
 *      ואז EXPO_PUBLIC_API_URL=http://127.0.0.1:5001
 *   2. הקבצים כאן — EXPO_PUBLIC_USE_FIXTURES=1 (לעבודה לא מקוונת)
 *
 * אין לייבא מכאן משום מקום שאינו מגודר ב-USE_FIXTURES. הדגל עצמו כפוף ל-__DEV__
 * ב-constants/config.ts, וכלל ESLint אוסר ייבוא מהתיקייה הזאת בקוד ייצור.
 * ההיסטוריה כאן לא תיאורטית: fallback סמוי מהקובץ הזה הציג פעם זמני אוטובוס
 * מזויפים למשתמשים אמיתיים.
 */
import type { BusArrival } from '@/types';

const ARRIVALS: Record<string, BusArrival[]> = {
  '34512': [
    { lineNumber: '5', destination: 'בת ים', minutesUntilArrival: 3, isRealTime: true },
    { lineNumber: '61', destination: 'פתח תקווה', minutesUntilArrival: 8, isRealTime: true },
    { lineNumber: '189', destination: 'ראשון לציון', minutesUntilArrival: 14, isRealTime: false },
  ],
  '21034': [
    { lineNumber: '51', destination: 'קריית שאול', minutesUntilArrival: 2, isRealTime: true },
    { lineNumber: '7', destination: 'חולון', minutesUntilArrival: 11, isRealTime: true },
  ],
  '10200': [
    { lineNumber: '480', destination: 'ירושלים', minutesUntilArrival: 5, isRealTime: true },
    { lineNumber: '240', destination: 'חיפה', minutesUntilArrival: 20, isRealTime: false },
  ],
  '47222': [
    { lineNumber: '400', destination: 'בני ברק', minutesUntilArrival: 2, isRealTime: true },
    { lineNumber: '12', destination: 'גבעתיים', minutesUntilArrival: 6, isRealTime: true },
    { lineNumber: '55', destination: 'רמת גן', minutesUntilArrival: 13, isRealTime: false },
  ],
};

export function fixtureArrivals(stationCode: string): BusArrival[] {
  return ARRIVALS[stationCode] ?? ARRIVALS['34512'];
}
