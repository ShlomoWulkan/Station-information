export interface BusArrival {
  lineNumber: string;
  destination: string;
  minutesUntilArrival: number;
  /** true כשהזמן מגיע ממערכת הזמן-אמת ולא מלוח הזמנים המתוכנן. */
  isRealTime: boolean;
}
