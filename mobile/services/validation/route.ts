import type { RouteStop, StationRoute } from '@/types';
import {
  asString,
  asStringOr,
  isFiniteNumber,
  isObject,
  type Parser,
} from './primitives';

export const parseStationRoute: Parser<StationRoute> = (raw) => {
  if (!isObject(raw)) return null;

  const lineNumber = asString(raw.lineNumber);
  if (lineNumber === null) return null;

  return { lineNumber, destination: asStringOr(raw.destination, '') };
};

/** תחנה במסלול חייבת קואורדינטות — היא מוצגת גם על מפה. */
export const parseRouteStop: Parser<RouteStop> = (raw) => {
  if (!isObject(raw)) return null;

  const id = asString(raw.id);
  const code = asString(raw.code);
  const name = typeof raw.name === 'string' ? raw.name : null;
  if (id === null || code === null || name === null) return null;
  if (!isFiniteNumber(raw.lat) || !isFiniteNumber(raw.lon)) return null;

  return {
    id,
    code,
    name,
    lat: raw.lat,
    lon: raw.lon,
    sequence: isFiniteNumber(raw.sequence) ? raw.sequence : 0,
    isCurrent: raw.isCurrent === true,
  };
};
