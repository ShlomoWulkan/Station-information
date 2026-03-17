import type { Station } from '@/types';

const BASE_URL = 'http://204.168.150.129:5000';

export async function fetchNearbyStations(lat: number, lon: number): Promise<Station[]> {
  const res = await fetch(`${BASE_URL}/nearby?lat=${lat}&lon=${lon}`);
  if (!res.ok) throw new Error(`שגיאת שרת: ${res.status}`);
  return res.json();
}
