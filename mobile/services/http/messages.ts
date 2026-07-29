import { errorStrings } from '@/constants/strings';
import { ApiError, type ApiErrorKind } from './errors';

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
  return error instanceof ApiError ? BY_KIND[error.kind] : fallback;
}

/** האם כדאי להציע "נסה שוב" — 404 לא ישתנה בלחיצה נוספת. */
export function isRetryable(error: unknown): boolean {
  if (!(error instanceof ApiError)) return true;
  return error.kind !== 'notFound' && error.kind !== 'notConfigured';
}
