export interface MapRegion {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

export interface Bounds {
  minLat: number;
  maxLat: number;
  minLon: number;
  maxLon: number;
}

/** ממיר אזור מפה (מרכז + טווח) למסגרת שהשרת מצפה לה. */
export function regionToBounds(region: MapRegion): Bounds {
  const halfLat = region.latitudeDelta / 2;
  const halfLon = region.longitudeDelta / 2;
  return {
    minLat: region.latitude - halfLat,
    maxLat: region.latitude + halfLat,
    minLon: region.longitude - halfLon,
    maxLon: region.longitude + halfLon,
  };
}

/** אזור התחלתי סביב נקודה, בזום קרוב. */
export function regionAround(latitude: number, longitude: number, delta = 0.01): MapRegion {
  return { latitude, longitude, latitudeDelta: delta, longitudeDelta: delta };
}
