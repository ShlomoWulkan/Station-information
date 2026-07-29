import { useMemo } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { commonStrings } from '@/constants/strings';
import type { Station } from '@/types';

/**
 * בונה Station מפרמטרי הנתיב.
 *
 * פרמטרי ניווט הם תמיד מחרוזות, גם כשהמקור היה מספר — ההמרה מרוכזת כאן כדי
 * שהמסך לא יטפל בה, ו-useMemo כדי שהאובייקט לא ייבנה מחדש בכל רינדור (הוא
 * נכנס ל-dependency arrays).
 */
export function useStationParams(): { code: string; station: Station } {
  const { code, name, lat, lon } = useLocalSearchParams<{
    code: string;
    name?: string;
    lat?: string;
    lon?: string;
  }>();

  const stationCode = String(code);

  const station = useMemo<Station>(
    () => ({
      id: stationCode,
      code: stationCode,
      name: name || commonStrings.stationLabel(stationCode),
      lat: lat ? Number(lat) : undefined,
      lon: lon ? Number(lon) : undefined,
    }),
    [stationCode, name, lat, lon],
  );

  return { code: stationCode, station };
}
