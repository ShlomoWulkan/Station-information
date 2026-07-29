export type ApiErrorKind =
  /** לא הצלחנו להגיע לשרת בכלל — אין רשת, DNS, סירוב חיבור. */
  | 'network'
  /** השרת לא ענה בזמן. */
  | 'timeout'
  /** 404 — המשאב לא קיים. */
  | 'notFound'
  /** 503 — ה-GTFS עדיין נטען בשרת. זמני, שווה לנסות שוב. */
  | 'warmingUp'
  /** 5xx או 4xx אחר. */
  | 'server'
  /** התשובה הגיעה אבל לא בצורה שציפינו לה. */
  | 'badResponse'
  /** EXPO_PUBLIC_API_URL חסר בבילד. */
  | 'notConfigured';

/**
 * שגיאת רשת עם סיבה מסווגת.
 *
 * הסיווג קיים כדי שהמסכים לא ינחשו: קודם כל מסך ניסח הודעה בעצמו, ולכן שרת
 * שנפל דווח למשתמש כ"תחנה לא נמצאה".
 */
export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status?: number;

  constructor(kind: ApiErrorKind, message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.kind = kind;
    this.status = status;
  }
}

/** ממפה קוד HTTP לסיבה. */
export function kindForStatus(status: number): ApiErrorKind {
  if (status === 404) return 'notFound';
  if (status === 503) return 'warmingUp';
  return 'server';
}
