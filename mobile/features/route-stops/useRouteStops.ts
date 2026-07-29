import { useCallback } from 'react';
import { errorStrings } from '@/constants/strings';
import { fetchRouteStops } from '@/services/api';
import { useAsyncResource } from '@/hooks/useAsyncResource';
import type { RouteStop } from '@/types';

interface Result {
  stops: RouteStop[];
  error: string | null;
  isLoading: boolean;
  retry: () => void;
}

/** תחנות המסלול של קו שעובר בתחנה נתונה. */
export function useRouteStops(stationCode: string, lineNumber: string): Result {
  const fetcher = useCallback(
    () => fetchRouteStops(stationCode, lineNumber),
    [stationCode, lineNumber],
  );

  const { data, error, isLoading, reload } = useAsyncResource(fetcher, {
    fallbackMessage: errorStrings.routeStopsFailed,
  });

  return { stops: data ?? [], error, isLoading, retry: () => void reload() };
}
