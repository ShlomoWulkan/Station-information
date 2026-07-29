/** טקסטים של מסך התחנה ומסך תחנות הקו. */
export const stationStrings = {
  tabs: {
    arrivals: 'זמני הגעה',
    routes: 'קווים',
  },

  filterPlaceholder: 'סינון לפי מספר קו...',
  filterLabel: 'סינון לפי מספר קו',

  noArrivals: 'אין נסיעות בזמן הקרוב',
  noFilterMatch: (filter: string) => `אין קו שמכיל "${filter}"`,
  noRoutes: 'אין מידע על קווים',
  showingLastKnown: 'מוצג הנתון האחרון שהתקבל.',

  addFavorite: 'הוסף למועדפים',
  removeFavorite: 'הסר ממועדפים',
  routeLabel: (line: string, destination: string) => `קו ${line} לכיוון ${destination}`,

  now: 'עכשיו',
  minutesShort: (minutes: number) => `${minutes} דק'`,

  routeStopsTitle: 'תחנות הקו',
  hereBadge: 'כאן',

  fixturesWarning: 'נתוני דמו — לא זמני אמת',

  live: {
    live: 'עדכון בזמן אמת',
    stale: 'הנתון אינו מעודכן',
    offline: 'אין חיבור לשרת',
  },
} as const;
