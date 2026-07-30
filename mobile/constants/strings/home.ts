/** טקסטים של מסך הבית, מועדפים, אחרונים והגדרות. */
export const homeStrings = {
  buttons: {
    byLocation: { title: 'חיפוש לפי מיקום', subtitle: (radius: number) => `תחנות עד ${radius} מטר` },
    recent: { title: 'חיפושים אחרונים', subtitle: 'היסטוריה שמורה' },
    favorites: { title: 'מועדפים', subtitle: 'תחנות קבועות' },
    byNumber: { title: 'מספר תחנה', subtitle: 'הקלד מספר ישירות' },
    map: { title: 'מפה אינטראקטיבית', subtitle: 'הצג תחנות מסביב' },
  },
} as const;

export const favoritesStrings = {
  title: '⭐ מועדפים',
  emptyTitle: 'עדיין אין תחנות מועדפות',
  emptySubtitle: 'לחץ על ☆ ליד תחנה כדי לשמור אותה',
} as const;

export const recentStrings = {
  title: 'חיפושים אחרונים',
  emptyTitle: 'עדיין לא חיפשת תחנות',
  emptySubtitle: 'חיפושים יישמרו כאן אוטומטית',
  clear: 'נקה היסטוריה',
  clearConfirmTitle: 'נקה היסטוריה',
  clearConfirmBody: 'האם אתה בטוח שברצונך למחוק את כל החיפושים האחרונים?',
  clearConfirmAction: 'נקה',
  removeConfirmTitle: 'מחיקה',
  removeConfirmBody: (name: string) => `להסיר את "${name}" מהחיפושים האחרונים?`,
} as const;

export const settingsStrings = {
  title: '⚙️ הגדרות',
  accessibility: 'נגישות',
  accessibilityHint: 'גודל טקסט, ניגודיות והפחתת תנועה',
  about: 'אודות',
  version: (v: string) => `גרסה ${v}`,
  dataSource: 'הנתונים מסופקים על ידי משרד התחבורה',
  privacy: 'מדיניות פרטיות',
  privacyBody:
    'האפליקציה משתמשת במיקום שלך כדי למצוא תחנות קרובות. המיקום נשלח לשרת ' +
    'לצורך החיפוש בלבד ואינו נשמר. מועדפים והיסטוריית חיפוש נשמרים במכשיר שלך בלבד.',
} as const;

export const notFoundStrings = {
  title: 'דף זה לא קיים',
  navTitle: 'לא נמצא',
  backHome: 'חזור לדף הבית',
} as const;
