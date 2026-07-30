import { useCallback, useState } from 'react';
import { errorStrings } from '@/constants/strings';
import { fetchStation } from '@/services/api';
import { ApiError, isRetryable, toUserMessage } from '@/services/http';
import type { Station } from '@/types';

interface Result {
  station: Station | null;
  error: string | null;
  isLoading: boolean;
  canRetry: boolean;
  lookup: (code: string) => void;
}

/** חיפוש תחנה בודדת לפי קוד. */
export function useStationLookup(): Result {
  const [station, setStation] = useState<Station | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [canRetry, setCanRetry] = useState(true);

  const lookup = useCallback(async (code: string) => {
    const trimmed = code.trim();
    if (!trimmed) return;

    setIsLoading(true);
    setError(null);
    setStation(null);
    try {
      setStation(await fetchStation(trimmed));
    } catch (e) {
      // רק 404 פירושו "לא נמצאה". קודם כל כשל — שרת שנפל, אין רשת, timeout —
      // דווח כתחנה לא קיימת, והמשתמש חיפש מספר אחר במקום לנסות שוב.
      const notFound = e instanceof ApiError && e.kind === 'notFound';
      setError(notFound ? errorStrings.stationNotFound(trimmed) : toUserMessage(e));
      setCanRetry(isRetryable(e));
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { station, error, isLoading, canRetry, lookup: (code) => void lookup(code) };
}
