/** טקסטים שחוזרים ביותר ממסך אחד. */
export const commonStrings = {
  appName: 'מידע תחנה',
  tagline: 'זמני הגעת אוטובוסים · ישראל',

  retry: 'נסה שוב',
  cancel: 'ביטול',
  delete: 'מחק',
  close: 'סגור',
  search: 'חפש',

  stationLabel: (code: string) => `תחנה ${code}`,
  distanceMeters: (meters: number) => `${meters} מטר`,

  nav: {
    home: 'בית',
    map: 'מפה',
    favorites: 'מועדפים',
    settings: 'הגדרות',
  },
} as const;
