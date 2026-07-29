export interface Station {
  id: string;
  name: string;
  code: string;
  lat?: number;
  lon?: number;
  /** מטרים מנקודת החיפוש. קיים רק בתשובת /nearby. */
  distance?: number;
}

/** תחנה עם קואורדינטות מובטחות — לשימוש במפה. */
export type LocatedStation = Station & { lat: number; lon: number };

export function hasCoords(station: Station): station is LocatedStation {
  return typeof station.lat === 'number' && typeof station.lon === 'number';
}
