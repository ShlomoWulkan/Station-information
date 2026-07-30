import { errorStrings } from '@/constants/strings';
import { ApiError, UserFacingError, type ApiErrorKind } from './errors';

const BY_KIND: Record<ApiErrorKind, string> = {
  network: errorStrings.network,
  timeout: errorStrings.timeout,
  notFound: errorStrings.notFound,
  warmingUp: errorStrings.warmingUp,
  server: errorStrings.server,
  badResponse: errorStrings.badResponse,
  notConfigured: errorStrings.notConfigured,
};

/** ממיר שגיאה כלשהי לטקסט להצגה למשתמש. */
export function toUserMessage(error: unknown, fallback: string = errorStrings.generic): string {
  if (error instanceof ApiError) return BY_KIND[error.kind];
  if (error instanceof UserFacingError) return error.message;
  return fallback;
}

/** האם כדאי להציע "נסה שוב" — 404 לא ישתנה בלחיצה נוספת. */
export function isRetryable(error: unknown): boolean {
  if (!(error instanceof ApiError)) return true;
  return error.kind !== 'notFound' && error.kind !== 'notConfigured';
}
