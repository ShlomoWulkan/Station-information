import type { Station } from '@/types';
import { asOptionalNumber, asString, isObject, type Parser } from './primitives';

export const parseStation: Parser<Station> = (raw) => {
  if (!isObject(raw)) return null;

  const id = asString(raw.id);
  const code = asString(raw.code);
  const name = typeof raw.name === 'string' ? raw.name : null;
  if (id === null || code === null || name === null) return null;

  return {
    id,
    code,
    name,
    lat: asOptionalNumber(raw.lat),
    lon: asOptionalNumber(raw.lon),
    distance: asOptionalNumber(raw.distance),
  };
};
