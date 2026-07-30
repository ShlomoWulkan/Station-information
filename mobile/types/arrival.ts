export interface BusArrival {
  /**
   * מזהה ייחודי לנסיעה, מהשרת.
   *
   * קיים כי אין דרך לגזור מפתח יציב משדות התצוגה: שני אוטובוסים של אותו קו
   * יכולים להגיע באותה דקה, וזה ייצר מפתחות כפולים ב-React.
   */
  id: string;
  lineNumber: string;
  destination: string;
  minutesUntilArrival: number;
}
