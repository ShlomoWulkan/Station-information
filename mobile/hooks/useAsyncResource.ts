import { useCallback, useEffect, useRef, useState } from 'react';
import { toUserMessage } from '@/services/http';

export interface AsyncResource<T> {
  data: T | null;
  /** הודעה מוכנה לתצוגה, או null. */
  error: string | null;
  /** טעינה ראשונה — אין עוד מה להציג. */
  isLoading: boolean;
  /** רענון כשיש כבר נתון — להצגה ב-RefreshControl. */
  isRefreshing: boolean;
  updatedAt: number | null;
  reload: (options?: { refresh?: boolean }) => Promise<void>;
}

interface Options {
  /** טען מיד בעלייה. כבה כשהטעינה מותנית בפעולת משתמש. */
  immediate?: boolean;
  /** הודעה כשהשגיאה אינה ApiError מסווגת. */
  fallbackMessage?: string;
}

/**
 * מנהל מחזור חיים של קריאה אסינכרונית אחת.
 *
 * קיים כי חמישה מסכים החזיקו את אותה שלישייה בנפרד, וכל אחד פספס משהו אחר:
 * אחד ניסח הודעת שגיאה שגויה, אחד עשה setState אחרי unmount, ואחד לא אפשר
 * ניסיון חוזר אחרי כשל.
 */
export function useAsyncResource<T>(
  fetcher: () => Promise<T>,
  { immediate = true, fallbackMessage }: Options = {},
): AsyncResource<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(immediate);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<number | null>(null);

  const isMounted = useRef(true);
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // מזהה בקשה — תשובה של קריאה שהוחלפה לא תדרוס תשובה חדשה יותר.
  const requestId = useRef(0);

  const fetcherRef = useRef(fetcher);
  useEffect(() => {
    fetcherRef.current = fetcher;
  }, [fetcher]);

  const reload = useCallback(
    async ({ refresh = false } = {}) => {
      const id = ++requestId.current;
      if (refresh) setIsRefreshing(true);
      else setIsLoading(true);

      try {
        const result = await fetcherRef.current();
        if (!isMounted.current || id !== requestId.current) return;
        setData(result);
        setUpdatedAt(Date.now());
        setError(null);
      } catch (e) {
        if (!isMounted.current || id !== requestId.current) return;
        setError(toUserMessage(e, fallbackMessage));
      } finally {
        if (isMounted.current && id === requestId.current) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    },
    [fallbackMessage],
  );

  const shouldLoadOnMount = useRef(immediate);
  useEffect(() => {
    if (shouldLoadOnMount.current) {
      shouldLoadOnMount.current = false;
      void reload();
    }
  }, [reload]);

  return { data, error, isLoading, isRefreshing, updatedAt, reload };
}
