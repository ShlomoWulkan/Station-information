/**
 * בסיס לבדיקות טיפוס בזמן ריצה.
 *
 * `res.json()` מחזיר `any`, ולכן המרה לטיפוס המובטח היא הבטחה ריקה — `strict`
 * ב-tsconfig לא מגן על שום דבר שמגיע מהרשת. נכתב ידנית ולא ב-zod, שמוסיף
 * כ-13KB ל-bundle בשביל כמה מבנים שטוחים.
 */

export type Parser<T> = (raw: unknown) => T | null;

export function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

export function isFiniteNumber(v: unknown): v is number {
  return typeof v === 'number' && Number.isFinite(v);
}

/** מקבל גם מספר — השרת מחזיר קודי תחנה כמחרוזות, אבל מספר לא צריך להפיל. */
export function asString(v: unknown): string | null {
  if (typeof v === 'string') return v;
  if (isFiniteNumber(v)) return String(v);
  return null;
}

export function asStringOr(v: unknown, fallback: string): string {
  return typeof v === 'string' ? v : fallback;
}

export function asOptionalNumber(v: unknown): number | undefined {
  return isFiniteNumber(v) ? v : undefined;
}

/**
 * מפעיל parser על מערך ומשמיט מה שלא עבר.
 *
 * שורה פגומה מסוננת ולא מפילה את המסך — תחנה אחת חסרת קואורדינטות לא צריכה
 * למנוע הצגה של עוד עשרים.
 */
export function parseList<T>(raw: unknown, parse: Parser<T>): T[] {
  if (!Array.isArray(raw)) return [];

  const out: T[] = [];
  let dropped = 0;
  for (const item of raw) {
    const parsed = parse(item);
    if (parsed === null) dropped++;
    else out.push(parsed);
  }

  if (dropped > 0 && __DEV__) {
    console.warn(`[validation] ${dropped} רשומות לא תקינות סוננו מתשובת השרת`);
  }
  return out;
}
