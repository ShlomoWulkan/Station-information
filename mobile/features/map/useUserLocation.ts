import { useCallback, useEffect, useState } from 'react';
import * as Location from 'expo-location';
import { MAP_INITIAL_DELTA } from '@/constants/config';
import { errorStrings } from '@/constants/strings';
import { regionAround, type MapRegion } from './bounds';

interface Result {
  region: MapRegion | null;
  error: string | null;
  isLoading: boolean;
  /** מבקש הרשאה ומיקום מחדש. מחזיר את האזור, או null בכשל. */
  locate: () => Promise<MapRegion | null>;
}

/**
 * הרשאת מיקום ומיקום נוכחי.
 *
 * מפריד בין סירוב הרשאה לכשל קבלת מיקום — קודם שני המצבים דווחו באותה הודעה,
 * ולכן משתמש שסירב להרשאה קיבל "שגיאה בטעינת המפה" ולא הבין מה לעשות.
 */
export function useUserLocation(): Result {
  const [region, setRegion] = useState<MapRegion | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const locate = useCallback(async (): Promise<MapRegion | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError(errorStrings.locationDenied);
        return null;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const next = regionAround(
        position.coords.latitude,
        position.coords.longitude,
        MAP_INITIAL_DELTA,
      );
      setRegion(next);
      return next;
    } catch {
      setError(errorStrings.locationFailed);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void locate();
  }, [locate]);

  return { region, error, isLoading, locate };
}
