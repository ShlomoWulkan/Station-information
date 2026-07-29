/** טקסטים של פאנל הנגישות. */
export const a11yStrings = {
  openPanel: 'פתח אפשרויות נגישות',
  openPanelHint: 'פותח פאנל עם הגדרות נגישות',
  closePanel: 'סגור פאנל נגישות',
  title: '♿ נגישות',

  textSizeSection: 'גודל טקסט',
  textSizeLabel: (label: string) => `גודל טקסט ${label}`,
  sizes: { normal: 'רגיל', large: 'גדול', xlarge: 'גדול מאוד' },

  highContrast: 'ניגודיות גבוהה',
  highContrastSub: 'מגביר את הניגוד בין טקסט לרקע',
  reduceMotion: 'הפחתת תנועה',
  reduceMotionSub: 'מבטל אנימציות ואפקטים נעים',

  statementSection: 'הצהרת נגישות',
  statementBody:
    'אפליקציה זו עומדת ברמת נגישות AA בהתאם לתקן WCAG 2.1 ולחוק שוויון זכויות לאנשים עם מוגבלות (תשנ"ח-1998).',
  statementContact: 'לפניות בנושא נגישות ניתן לפנות לכתובת: ptsupport@mot.gov.il',
  statementUpdated: (date: string) => `עדכון אחרון: ${date}`,

  reset: 'אפס הגדרות נגישות',
} as const;
