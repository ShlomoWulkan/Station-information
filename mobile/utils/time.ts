/** גיל נתון בעברית, לתצוגה ליד תג העדכון. */
export function formatAge(ageMs: number): string {
  if (ageMs < 5_000) return 'עודכן כרגע';

  const seconds = Math.floor(ageMs / 1000);
  if (seconds < 60) return `עודכן לפני ${seconds} שניות`;

  const minutes = Math.floor(seconds / 60);
  if (minutes === 1) return 'עודכן לפני דקה';
  if (minutes < 60) return `עודכן לפני ${minutes} דקות`;

  const hours = Math.floor(minutes / 60);
  if (hours === 1) return 'עודכן לפני שעה';
  return `עודכן לפני ${hours} שעות`;
}
