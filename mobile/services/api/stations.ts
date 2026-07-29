import { NEARBY_RADIUS_M } from '@/constants/config';
import type { Station } from '@/types';
import { ApiError, apiFetch, query, seg } from '../http';
import { parseList, parseStation } from '../validation';

/** תחנות ברדיוס מהנקודה הנתונה, ממוינות לפי מרחק. */
export async function fetchNearbyStations(lat: number, lon: number): Promise<Station[]> {
  const path = `/nearby${query({ lat, lon, radius: NEARBY_RADIUS_M })}`;
  return parseList(await apiFetch<unknown>(path), parseStation);
}

/** תחנות בתוך מסגרת גיאוגרפית — למפה. */
export async function fetchStopsInBounds(bounds: {
  minLat: number;
  maxLat: number;
  minLon: number;
  maxLon: number;
}): Promise<Station[]> {
  const path = `/stops${query({
    min_lat: bounds.minLat,
    max_lat: bounds.maxLat,
    min_lon: bounds.minLon,
    max_lon: bounds.maxLon,
  })}`;
  return parseList(await apiFetch<unknown>(path), parseStation);
}

/** תחנה בודדת לפי קוד. זורק ApiError('notFound') כשאינה קיימת. */
export async function fetchStation(stationCode: string): Promise<Station> {
  const station = parseStation(await apiFetch<unknown>(`/station/${seg(stationCode)}`));
  if (station === null) {
    throw new ApiError('badResponse', `unexpected station shape for ${stationCode}`);
  }
  return station;
}
