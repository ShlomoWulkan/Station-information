import type { Station, BusArrival } from '@/types';

export const USE_MOCK = true;

export const mockStations: Station[] = [
  { id: '1', name: 'רחוב הרצל / דיזנגוף', code: '34512', lat: 32.08, lon: 34.78, distance: 45 },
  { id: '2', name: 'כיכר רבין', code: '21034', lat: 32.083, lon: 34.781, distance: 80 },
  { id: '3', name: 'תחנה מרכזית תל אביב', code: '10200', lat: 32.065, lon: 34.777, distance: 95 },
];

export const mockArrivals: Record<string, BusArrival[]> = {
  '34512': [
    { lineNumber: '5', destination: 'בת ים', minutesUntilArrival: 3, isRealTime: true },
    { lineNumber: '61', destination: 'פתח תקווה', minutesUntilArrival: 8, isRealTime: true },
    { lineNumber: '189', destination: 'ראשון לציון', minutesUntilArrival: 14, isRealTime: false },
  ],
  '21034': [
    { lineNumber: '51', destination: 'קריית שאול', minutesUntilArrival: 2, isRealTime: true },
    { lineNumber: '7', destination: 'חולון', minutesUntilArrival: 11, isRealTime: true },
  ],
  '10200': [
    { lineNumber: '480', destination: 'ירושלים', minutesUntilArrival: 5, isRealTime: true },
    { lineNumber: '240', destination: 'חיפה', minutesUntilArrival: 20, isRealTime: false },
  ],
};

export function getArrivals(stationCode: string): BusArrival[] {
  return mockArrivals[stationCode] ?? [];
}

export function searchByCode(code: string): Station | undefined {
  return mockStations.find(s => s.code === code);
}

export function getNearbyStations(): Station[] {
  return mockStations;
}
