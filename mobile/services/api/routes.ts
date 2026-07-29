import type { RouteStop, StationRoute } from '@/types';
import { apiFetch, seg } from '../http';
import { parseList, parseRouteStop, parseStationRoute } from '../validation';

/** הקווים שעוצרים בתחנה. 503 בזמן שה-GTFS נטען → ApiError('warmingUp'). */
export async function fetchRoutes(stationCode: string): Promise<StationRoute[]> {
  const raw = await apiFetch<unknown>(`/routes/${seg(stationCode)}`);
  return parseList(raw, parseStationRoute);
}

/** תחנות המסלול של קו מסוים שעובר בתחנה, לפי סדר הנסיעה. */
export async function fetchRouteStops(
  stationCode: string,
  lineNumber: string,
): Promise<RouteStop[]> {
  const path = `/route-stops/${seg(stationCode)}/${seg(lineNumber)}`;
  const raw = await apiFetch<unknown>(path);
  return parseList(raw, parseRouteStop).sort((a, b) => a.sequence - b.sequence);
}
