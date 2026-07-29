import { useCallback, useEffect } from 'react';
import { errorStrings } from '@/constants/strings';
import { fetchRoutes } from '@/services/api';
import { useAsyncResource } from '@/hooks/useAsyncResource';
import type { StationRoute } from '@/types';

interface Result {
  routes: StationRoute[];
  error: string | null;
  isLoading: boolean;
  retry: () => void;
}

/**
 * הקווים שעוצרים בתחנה. נטען בעצלתיים — רק כשהטאב נפתח.
 *
 * `enabled` מחליף תנאי קודם שבדק אם המערך ריק, מה שמנע ניסיון חוזר לנצח אחרי
 * טעינה שנכשלה.
 */
export function useStationRoutes(code: string, enabled: boolean): Result {
  const fetcher = useCallback(() => fetchRoutes(code), [code]);

  const resource = useAsyncResource(fetcher, {
    immediate: false,
    fallbackMessage: errorStrings.routesFailed,
  });

  const { data, isLoading, error, reload } = resource;

  useEffect(() => {
    // טוען בפתיחת הטאב, וגם אחרי כשל אם המשתמש חוזר אליו.
    if (enabled && data === null && !isLoading && error === null) {
      void reload();
    }
  }, [enabled, data, isLoading, error, reload]);

  return {
    routes: data ?? [],
    error,
    isLoading,
    retry: () => void reload(),
  };
}
