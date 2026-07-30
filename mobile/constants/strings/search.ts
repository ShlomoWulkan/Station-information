/** טקסטים של מסכי החיפוש והמפה. */
export const searchStrings = {
  byLocationTitle: 'תחנות קרובות',
  byLocationEmpty: 'לא נמצאו תחנות בקרבת מקומך',
  refresh: 'רענן',

  byNumberTitle: 'חיפוש לפי מספר תחנה',
  byNumberPlaceholder: 'מספר תחנה...',
  byNumberLabel: 'מספר תחנה',
} as const;

export const mapStrings = {
  loading: 'טוען מפה...',
  recenter: 'חזור למיקום שלי',
  zoomInForStations: 'התקרב כדי לראות תחנות',
  stationsFailed: 'לא ניתן לרענן תחנות',
  tapForArrivals: 'לחץ לזמני הגעה',
  closePopup: 'סגור',
} as const;
