import { HttpErrorResponse } from '@angular/common/http';

// ──────────────────────────────────────────────────────────────────────────────
// Shared HTTP error classification.
//
// Status 0 (offline / DNS failure / CORS preflight rejection) is the ONLY case
// that may be described to the user as a connection problem. Every other status
// is a real server response and must be surfaced as such — never as a generic
// "network issue" (client-reported defect, Phase 11).
// ──────────────────────────────────────────────────────────────────────────────

export type HttpErrorKind =
  | 'network'      // status 0: offline, DNS, or CORS preflight rejection
  | 'validation'   // 400 / 422
  | 'auth'         // 401
  | 'forbidden'    // 403
  | 'not_found'    // 404
  | 'conflict'     // 409
  | 'rate_limited' // 429
  | 'server'       // >= 500
  | 'unknown';

export interface ClassifiedHttpError {
  kind: HttpErrorKind;
  status: number;
  /** Backend-supplied human message (error.error?.message) when present. */
  backendMessage: string | null;
  /** Backend per-field validation errors ({field: message}) when present. */
  fieldErrors: Record<string, string> | null;
  /** i18n key for the generic fallback copy (errors.* in en.json / my.json). */
  fallbackKey: string;
  /** true when auth.interceptor already toasted/redirected for this error —
   *  components must not toast again, only render inline state. */
  handledGlobally: boolean;
  /** network / rate_limited / server → safe to offer a Retry action. */
  retryable: boolean;
}

/** URL fragments for which a 401 must NOT force a logout — single source of
 *  truth, imported by auth.interceptor. /auth/*: a 401 means bad credentials.
 *  /parent/bookings/by-session/: the payment-return page handles its own 401
 *  so the parent is never yanked off the payment confirmation (Phase 10). */
export const NO_LOGOUT_ON_401: string[] = [
  '/auth/login',
  '/auth/register',
  '/parent/bookings/by-session/',
];

const KIND_BY_STATUS: Record<number, HttpErrorKind> = {
  0: 'network',
  400: 'validation',
  401: 'auth',
  403: 'forbidden',
  404: 'not_found',
  409: 'conflict',
  422: 'validation',
  429: 'rate_limited',
};

const FALLBACK_KEY_BY_KIND: Record<HttpErrorKind, string> = {
  network: 'errors.network',
  validation: 'errors.validation',
  auth: 'errors.auth',
  forbidden: 'errors.forbidden',
  not_found: 'errors.notFound',
  conflict: 'errors.conflict',
  rate_limited: 'errors.rateLimited',
  server: 'errors.server',
  unknown: 'errors.generic',
};

export function classifyHttpError(error: unknown, requestUrl?: string): ClassifiedHttpError {
  if (!(error instanceof HttpErrorResponse)) {
    return {
      kind: 'unknown',
      status: -1,
      backendMessage: null,
      fieldErrors: null,
      fallbackKey: FALLBACK_KEY_BY_KIND.unknown,
      handledGlobally: false,
      retryable: false,
    };
  }

  const status = error.status;
  const kind: HttpErrorKind = KIND_BY_STATUS[status] ?? (status >= 500 ? 'server' : 'unknown');

  // error.error is a ProgressEvent on status 0 — guard all reads.
  const body = error.error && typeof error.error === 'object' ? error.error : null;
  const backendMessage = body && typeof body['message'] === 'string' ? body['message'] : null;
  const fieldErrors =
    body && body['errors'] && typeof body['errors'] === 'object' && !Array.isArray(body['errors'])
      ? (body['errors'] as Record<string, string>)
      : null;

  const url = requestUrl ?? error.url ?? '';
  const logoutExempt = NO_LOGOUT_ON_401.some((fragment) => url.includes(fragment));

  // Mirrors auth.interceptor's global handling: 0, 403, >=500 always toast there;
  // 401 toasts+logs out unless the URL is exempt.
  const handledGlobally =
    kind === 'network' ||
    kind === 'forbidden' ||
    kind === 'server' ||
    (kind === 'auth' && !logoutExempt);

  return {
    kind,
    status,
    backendMessage,
    fieldErrors,
    fallbackKey: FALLBACK_KEY_BY_KIND[kind],
    handledGlobally,
    retryable: kind === 'network' || kind === 'rate_limited' || kind === 'server',
  };
}

/** Preferred display text: the backend's specific message for client errors
 *  (4xx — it explains what the user can fix), the localized fallback for
 *  network/server/unknown failures (5xx bodies are internal wording like
 *  "Error creating booking" and must not surface verbatim). */
export function errorDisplayMessage(
  classified: ClassifiedHttpError,
  translate: (key: string) => string
): string {
  const internal = classified.kind === 'server' || classified.kind === 'network' || classified.kind === 'unknown';
  return (!internal && classified.backendMessage) || translate(classified.fallbackKey);
}
