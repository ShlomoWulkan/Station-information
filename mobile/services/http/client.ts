import { API_URL, API_URL_MISSING, REQUEST_TIMEOUT_MS } from '@/constants/config';
import { ApiError, kindForStatus } from './errors';

/** בורח מקטע נתיב. קוד תחנה נכנס ל-URL ולא עבר בריחה עד כה. */
export function seg(value: string | number): string {
  return encodeURIComponent(String(value));
}

/** בונה query string, משמיט ערכים ריקים. */
export function query(params: Record<string, string | number | undefined>): string {
  const pairs = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`);
  return pairs.length > 0 ? `?${pairs.join('&')}` : '';
}

async function request(path: string, init?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(`${API_URL}${path}`, { ...init, signal: controller.signal });
  } catch (e) {
    // abort אחרי הטיימר הוא timeout; כל השאר הוא כשל רשת.
    if (controller.signal.aborted) {
      throw new ApiError('timeout', `timed out after ${REQUEST_TIMEOUT_MS}ms: ${path}`);
    }
    throw new ApiError('network', e instanceof Error ? e.message : `network failure: ${path}`);
  } finally {
    clearTimeout(timer);
  }
}

/**
 * קריאה יחידה לשרת. מרכזת timeout (fetch ב-RN נתקע ללא הגבלה על רשת גרועה —
 * ספינר נצחי בלי שגיאה) וסיווג כשלים.
 */
export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  if (API_URL_MISSING) {
    throw new ApiError('notConfigured', 'EXPO_PUBLIC_API_URL is not set');
  }

  const res = await request(path, init);
  if (!res.ok) {
    throw new ApiError(kindForStatus(res.status), `${res.status} ${path}`, res.status);
  }

  let body: unknown;
  try {
    body = await res.json();
  } catch {
    throw new ApiError('badResponse', `response was not valid JSON: ${path}`);
  }

  // כמה נתיבים בשרת מחזירים 200 עם {"error": ...}.
  if (body !== null && typeof body === 'object' && 'error' in body) {
    throw new ApiError('server', String((body as { error: unknown }).error));
  }

  return body as T;
}
