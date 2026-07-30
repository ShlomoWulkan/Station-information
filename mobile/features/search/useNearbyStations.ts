import { useCallback } from 'react';
import { errorStrings } from '@/constants/strings';
import { fetchNearbyStations } from '@/services/api';
import { useAsyncResource } from '@/hooks/useAsyncResource';
import type { Station } from '@/types';
import { getCurrentLocation } from './location';

interface Result {
  stations: Station[];
  error: string | null;
  isLoading: boolean;
  search: () => void;
}

/**
 * תחנות קרובות למיקום הנוכחי.
 *
 * כשל מיקום וכשל שרת מדווחים בנפרד — getCurrentLocation זורק UserFacingError
 * עם הודעה משלו, ו-toUserMessage מעביר אותה כמו שהיא.
 */
export function useNearbyStations(): Result {
  const fetcher = useCallback(async () => {
    const { latitude, longitude } = await getCurrentLocation();
    return fetchNearbyStations(latitude, longitude);
  }, []);

  const { data, error, isLoading, reload } = useAsyncResource(fetcher, {
    fallbackMessage: errorStrings.stationsFailed,
  });

  return {
    stations: data ?? [],
    error,
    isLoading,
    search: () => void reload(),
  };
}
