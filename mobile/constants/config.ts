/**
 * הגדרות זמן-ריצה. משתני EXPO_PUBLIC_* מוטבעים בבילד, לא נקראים בזמן ריצה —
 * לכן שינוי ב-.env דורש הפעלה מחדש של המטרו.
 */

/** כתובת השרת בפיתוח, כשאין EXPO_PUBLIC_API_URL. */
const DEV_FALLBACK_URL = 'http://204.168.150.129:5000';

const configuredUrl = process.env.EXPO_PUBLIC_API_URL?.trim();

export const API_URL = configuredUrl || (__DEV__ ? DEV_FALLBACK_URL : '');

/**
 * בילד production ללא EXPO_PUBLIC_API_URL הוא שבור. לא זורקים כאן כדי שלא
 * ליפול בזמן ייבוא (מסך לבן) — apiFetch בודק את זה והשגיאה מוצגת ב-UI הרגיל.
 */
export const API_URL_MISSING = API_URL === '';

if (__DEV__ && !configuredUrl) {
  console.warn(
    `[config] EXPO_PUBLIC_API_URL לא מוגדר — משתמש בברירת מחדל ${DEV_FALLBACK_URL}. ` +
      'העתק mobile/.env.example ל-mobile/.env.',
  );
}

/**
 * נתוני דמו במקום קריאות אמיתיות. שתי שכבות בכוונה: __DEV__ מבטיח שגם אם
 * הדגל ידלוף לקונפיג של בילד production, נתונים מזויפים לא יוצגו למשתמש.
 * ראה services/fixtures/.
 */
export const USE_FIXTURES = __DEV__ && process.env.EXPO_PUBLIC_USE_FIXTURES === '1';

/** timeout לכל קריאת רשת. fetch ב-RN נתקע ללא הגבלה בלי זה. */
export const REQUEST_TIMEOUT_MS = 10_000;

/** רדיוס חיפוש תחנות קרובות. חייב להתאים לטקסט במסך הבית ולתקרה בשרת. */
export const NEARBY_RADIUS_M = 250;

/** תדירות רענון זמני הגעה. ה-cache בשרת הוא 10 שניות. */
export const ARRIVALS_REFRESH_MS = 30_000;

/** מעל הגיל הזה הנתון מסומן כלא-טרי. */
export const ARRIVALS_STALE_MS = 90_000;

/** השהיה לפני טעינת תחנות אחרי הזזת המפה, כדי לא לשלוח בקשה על כל פריים. */
export const MAP_STOPS_DEBOUNCE_MS = 500;

/** זום התחלתי של המפה, במעלות. */
export const MAP_INITIAL_DELTA = 0.01;

/** תאריך עדכון הצהרת הנגישות. לעדכן כשההצהרה נבדקת מחדש. */
export const A11Y_STATEMENT_UPDATED = 'מרץ 2026';
