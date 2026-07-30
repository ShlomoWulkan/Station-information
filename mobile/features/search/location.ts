import * as Location from 'expo-location';
import { errorStrings } from '@/constants/strings';
import { UserFacingError } from '@/services/http';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * מבקש הרשאה ומחזיר את המיקום הנוכחי.
 *
 * זורק UserFacingError עם הודעה מוכנה, כדי שיעבור באותו נתיב כמו שגיאות רשת.
 * מבדיל בין סירוב הרשאה לכשל קבלת מיקום — קודם שניהם דווחו באותה הודעה,
 * ומשתמש שסירב להרשאה לא הבין מה לעשות כדי לתקן.
 */
export async function getCurrentLocation(): Promise<Coordinates> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    throw new UserFacingError(errorStrings.locationDenied);
  }

  try {
    const { coords } = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });
    return { latitude: coords.latitude, longitude: coords.longitude };
  } catch {
    throw new UserFacingError(errorStrings.locationFailed);
  }
}
