import { useCallback, useEffect, useRef, useState } from 'react';
import { MAP_MAX_MARKER_DELTA, MAP_STOPS_DEBOUNCE_MS } from '@/constants/config';
import { errorStrings } from '@/constants/strings';
import { fetchStopsInBounds } from '@/services/api';
import { toUserMessage } from '@/services/http';
import { hasCoords, type LocatedStation } from '@/types';
import { regionToBounds, type MapRegion } from './bounds';

interface Result {
  stations: LocatedStation[];
  /** כשל רענון — מוצג כבאנר, בלי למחוק סמנים קיימים. */
  error: string | null;
  /** התצוגה רחבה מדי לסמנים; המסך מציג רמז להתקרב. */
  isZoomedOut: boolean;
  loadFor: (region: MapRegion) => void;
}

/**
 * תחנות לתצוגה במפה, נטענות מחדש בהשהיה אחרי הזזת המפה.
 *
 * הסמנים דורשים קואורדינטות, ולכן מסונן כאן פעם אחת במקום `!` בכל שימוש.
 */
export function useMapStations(): Result {
  const [stations, setStations] = useState<LocatedStation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isZoomedOut, setIsZoomedOut] = useState(false);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMounted = useRef(true);

  useEffect(
    () => () => {
      isMounted.current = false;
      // בלי זה, יציאה מהמסך בזמן ההשהיה מפעילה setState על קומפוננטה מפורקת.
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    },
    [],
  );

  const load = useCallback(async (region: MapRegion) => {
    try {
      const results = await fetchStopsInBounds(regionToBounds(region));
      if (!isMounted.current) return;
      setStations(results.filter(hasCoords));
      setError(null);
    } catch (e) {
      if (!isMounted.current) return;
      setError(toUserMessage(e, errorStrings.stationsFailed));
    }
  }, []);

  const loadFor = useCallback(
    (region: MapRegion) => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);

      // בתצוגה רחבה השרת מחזיר מאות תחנות שממילא חופפות. לא מבקשים בכלל.
      if (region.latitudeDelta > MAP_MAX_MARKER_DELTA) {
        setIsZoomedOut(true);
        setStations([]);
        return;
      }

      setIsZoomedOut(false);
      debounceTimer.current = setTimeout(() => void load(region), MAP_STOPS_DEBOUNCE_MS);
    },
    [load],
  );

  return { stations, error, isZoomedOut, loadFor };
}
