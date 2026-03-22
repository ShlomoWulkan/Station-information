import type { Station, BusArrival } from '@/types';

const BASE_URL = 'http://204.168.150.129:5000';

export async function fetchNearbyStations(lat: number, lon: number): Promise<Station[]> {
  const res = await fetch(`${BASE_URL}/nearby?lat=${lat}&lon=${lon}&radius=250`);
  if (!res.ok) throw new Error(`שגיאת שרת: ${res.status}`);
  return res.json();
}

export async function fetchStopsInBounds(
  minLat: number, maxLat: number, minLon: number, maxLon: number
): Promise<Station[]> {
  const res = await fetch(`${BASE_URL}/stops?min_lat=${minLat}&max_lat=${maxLat}&min_lon=${minLon}&max_lon=${maxLon}`);
  if (!res.ok) throw new Error(`שגיאת שרת: ${res.status}`);
  return res.json();
}

export async function fetchStation(stationCode: string): Promise<Station> {
  const res = await fetch(`${BASE_URL}/station/${stationCode}`);
  if (res.status === 404) throw new Error(`תחנה ${stationCode} לא נמצאה`);
  if (!res.ok) throw new Error(`שגיאת שרת: ${res.status}`);
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data;
}

export async function fetchArrivals(stationCode: string): Promise<BusArrival[]> {
  const res = await fetch(`${BASE_URL}/arrivals/${stationCode}`);
  if (!res.ok) throw new Error(`שגיאת שרת: ${res.status}`);
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data;
}

export async function fetchRouteStops(lineNumber: string): Promise<{ id: string; code: string; name: string; lat: number; lon: number; sequence: number }[]> {
  const res = await fetch(`${BASE_URL}/route-stops/${lineNumber}`);
  if (res.status === 404) throw new Error(`לא נמצאו תחנות לקו ${lineNumber}`);
  if (!res.ok) throw new Error(`שגיאת שרת: ${res.status}`);
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data;
}

export async function fetchRoutes(stationCode: string): Promise<{ lineNumber: string; destination: string }[]> {
  const res = await fetch(`${BASE_URL}/routes/${stationCode}`);
  if (!res.ok) throw new Error(`שגיאת שרת: ${res.status}`);
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data;
}
