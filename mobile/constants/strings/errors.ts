/** טקסטים של שגיאות. ממופים מ-ApiErrorKind ב-services/http/messages.ts. */
export const errorStrings = {
  network: 'אין חיבור לשרת. בדוק את החיבור לאינטרנט ונסה שוב.',
  timeout: 'השרת לא הגיב בזמן. נסה שוב.',
  notFound: 'לא נמצא.',
  warmingUp: 'הנתונים עדיין נטענים בשרת. נסה שוב בעוד כמה רגעים.',
  server: 'תקלה בשרת. נסה שוב בעוד מספר רגעים.',
  badResponse: 'התקבלה תשובה לא תקינה מהשרת.',
  notConfigured: 'כתובת השרת אינה מוגדרת באפליקציה.',

  generic: 'משהו נכשל. נסה שוב.',
  arrivalsFailed: 'לא ניתן לטעון זמני הגעה.',
  routesFailed: 'לא ניתן לטעון את רשימת הקווים.',
  routeStopsFailed: 'לא ניתן לטעון את תחנות הקו.',
  stationsFailed: 'לא ניתן לטעון תחנות.',
  locationDenied: 'נדרשת הרשאת מיקום',
  locationFailed: 'לא ניתן לקבוע את מיקומך',
  mapFailed: 'שגיאה בטעינת המפה',
  stationNotFound: (code: string) => `תחנה ${code} לא נמצאה`,
} as const;
