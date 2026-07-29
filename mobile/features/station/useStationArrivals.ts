import { useCallback, useMemo } from 'react';
import { ARRIVALS_REFRESH_MS } from '@/constants/config';
import { errorStrings } from '@/constants/strings';
import { fetchArrivals } from '@/services/api';
import { useAsyncResource } from '@/hooks/useAsyncResource';
import { useAutoRefresh } from '@/hooks/useAutoRefresh';
import type { BusArrival } from '@/types';

interface Result {
  arrivals: BusArrival[];
  error: string | null;
  isLoading: boolean;
  isRefreshing: boolean;
  updatedAt: number | null;
  refresh: () => void;
  retry: () => void;
}

/**
 * זמני הגעה לתחנה, עם רענון אוטומטי.
 *
 * הרענון הוא הליבה: הספירה לאחור בשורה היא תצוגה מקומית בלבד, ובלי לשאול את
 * השרת מחדש המספרים על המסך הופכים לניחוש אחרי כמה דקות.
 */
export function useStationArrivals(code: string, isActive: boolean): Result {
  const fetcher = useCallback(() => fetchArrivals(code), [code]);

  const resource = useAsyncResource(fetcher, {
    fallbackMessage: errorStrings.arrivalsFailed,
  });

  const { reload } = resource;
  const autoRefresh = useCallback(() => void reload({ refresh: true }), [reload]);

  useAutoRefresh(autoRefresh, { intervalMs: ARRIVALS_REFRESH_MS, enabled: isActive });

  return useMemo(
    () => ({
      arrivals: resource.data ?? [],
      error: resource.error,
      isLoading: resource.isLoading,
      isRefreshing: resource.isRefreshing,
      updatedAt: resource.updatedAt,
      refresh: () => void reload({ refresh: true }),
      retry: () => void reload(),
    }),
    [resource, reload],
  );
}
