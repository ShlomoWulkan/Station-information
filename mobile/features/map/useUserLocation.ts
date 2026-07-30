import { useCallback } from 'react';
import { MAP_INITIAL_DELTA } from '@/constants/config';
import { getCurrentLocation } from '@/features/search/location';
import { useAsyncResource } from '@/hooks/useAsyncResource';
import { regionAround, type MapRegion } from './bounds';

interface Result {
  region: MapRegion | null;
  error: string | null;
  isLoading: boolean;
  /** מבקש הרשאה ומיקום מחדש, ומחזיר את האזור כדי שהמפה תוכל לזוז אליו. */
  locate: () => Promise<MapRegion | null>;
}

/**
 * המיקום ההתחלתי של המפה.
 *
 * חולק את getCurrentLocation עם מסך החיפוש לפי מיקום, כך שסירוב הרשאה נראה
 * אותו דבר בשני המקומות.
 */
export function useUserLocation(): Result {
  const fetcher = useCallback(async () => {
    const { latitude, longitude } = await getCurrentLocation();
    return regionAround(latitude, longitude, MAP_INITIAL_DELTA);
  }, []);

  const { data, error, isLoading, reload } = useAsyncResource(fetcher);

  return { region: data, error, isLoading, locate: () => reload() };
}
