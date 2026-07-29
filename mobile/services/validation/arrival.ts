import type { BusArrival } from '@/types';
import { asString, asStringOr, isFiniteNumber, isObject, type Parser } from './primitives';

export const parseArrival: Parser<BusArrival> = (raw) => {
  if (!isObject(raw)) return null;

  const lineNumber = asString(raw.lineNumber);
  if (lineNumber === null || !isFiniteNumber(raw.minutesUntilArrival)) return null;

  return {
    lineNumber,
    destination: asStringOr(raw.destination, ''),
    minutesUntilArrival: Math.max(0, Math.round(raw.minutesUntilArrival)),
    isRealTime: raw.isRealTime === true,
  };
};
