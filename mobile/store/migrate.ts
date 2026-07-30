import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * קריאת נתונים שנשמרו בפורמט הישן, לפני המעבר ל-persist middleware.
 *
 * זה לא ניקיון — בלי זה, מי שכבר התקין מאבד את המועדפים שלו בשדרוג: persist
 * שומר תחת מפתח משלו ובעטיפת {state, version}, ולא יודע לקרוא מערך גולמי
 * שנשמר תחת '@favorites'.
 *
 * להשאיר לפחות עד גרסה שאחרי הבאה, כדי שגם מי שדילג על עדכון יעבור.
 */
export async function readLegacy<T>(legacyKey: string, isValid: (v: unknown) => v is T) {
  try {
    const raw = await AsyncStorage.getItem(legacyKey);
    if (raw === null) return null;

    const parsed: unknown = JSON.parse(raw);
    if (!isValid(parsed)) return null;

    return parsed;
  } catch {
    // מפתח פגום אינו סיבה למנוע את עליית האפליקציה.
    return null;
  }
}

/** מוחק את המפתח הישן אחרי הגירה מוצלחת. */
export async function dropLegacy(legacyKey: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(legacyKey);
  } catch {
    // נשאר — ינוקה בהזדמנות הבאה.
  }
}
