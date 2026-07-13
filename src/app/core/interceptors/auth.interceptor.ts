import {
  HttpInterceptorFn,
  HttpErrorResponse,
  HttpRequest,
  HttpHandlerFn,
} from '@angular/common/http';
import { inject, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';
import { TranslationService } from '../../shared/services/translation.service';
import { NO_LOGOUT_ON_401 } from '../errors/http-error';

// ──────────────────────────────────────────────
// HTTP Interceptor
//
// 1. Attaches Bearer token to every outgoing request.
// 2. On 401 → the session is no longer valid. The backend issues a single
//    access token and has NO refresh-token endpoint, so we clear the session
//    and redirect to /login rather than attempting a (non-existent) refresh.
//    Exceptions (Phase 10):
//      - auth endpoints (/auth/login, /auth/register): a 401 means bad
//        credentials, not an expired session — no logout, no toast.
//      - payment-return verification (/parent/bookings/by-session/): the
//        success page must stay visible and handle the 401 itself, so the
//        parent is never yanked off their payment confirmation.
//    The forced logout also preserves a returnUrl so the user can come back
//    to where they were after re-authenticating.
// 3. On 403 → shows a toast + redirects to the role dashboard.
// 4. On 500 → shows a user-friendly error toast.
// 5. On 0 (network) → shows a connectivity toast.
// ──────────────────────────────────────────────

// 401 exemption list lives in core/errors/http-error.ts (NO_LOGOUT_ON_401) so
// the interceptor and classifyHttpError can never drift apart.

// English copy used only while /assets/i18n/<lang>.json is still loading.
const BOOT_FALLBACKS: Record<string, string> = {
  'errors.networkTitle': 'Connection Problem',
  'errors.networkBody': 'We could not connect to the server. Please check your connection and try again.',
  'errors.serverTitle': 'Server Error',
  'errors.serverBody': 'Something went wrong on our end. Please try again shortly.',
  'errors.serverTemporaryBody': 'The service is temporarily unavailable. Please try again shortly.',
  'errors.forbiddenTitle': 'Access Denied',
  'errors.forbiddenBody': 'You do not have permission to perform this action.',
  'errors.sessionExpiredTitle': 'Session Expired',
  'errors.sessionExpiredBody': 'Please sign in again to continue.',
};

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
) => {
  const authService = inject(AuthService);
  const router      = inject(Router);
  const toast       = inject(ToastService);
  // TranslationService itself uses HttpClient (to load /assets/i18n/*.json),
  // so injecting it eagerly here would create a DI cycle through this very
  // interceptor. Resolve it lazily, and never for i18n asset requests.
  const injector    = inject(Injector);

  // Attach token
  const token = authService.getToken();
  let authedReq = req;
  if (token) {
    authedReq = addToken(req, token);
  }

  return next(authedReq).pipe(
    catchError((error: HttpErrorResponse) => {

      // Translation-asset failures must not toast (and resolving the
      // TranslationService while it is constructing would be circular).
      if (req.url.includes('/assets/i18n/')) {
        return throwError(() => error);
      }
      const i18nService = injector.get(TranslationService);
      // translate() returns the raw key until the i18n JSON has loaded —
      // fall back to English copy so a boot-time failure never shows
      // "errors.networkTitle" to the user.
      const i18n = {
        translate: (key: string): string => {
          const value = i18nService.translate(key);
          return value === key ? (BOOT_FALLBACKS[key] ?? key) : value;
        },
      };

      // ── 401 Unauthorized → session expired, force logout ──
      if (error.status === 401) {
        if (!NO_LOGOUT_ON_401.some(url => req.url.includes(url))) {
          handleLogout(authService, router, toast, i18n);
        }
        return throwError(() => error);
      }

      // ── 403 Forbidden ─────────────────────────
      if (error.status === 403) {
        toast.warning(
          i18n.translate('errors.forbiddenTitle'),
          i18n.translate('errors.forbiddenBody'),
        );
        redirectToDashboard(authService, router);
        return throwError(() => error);
      }

      // ── 5xx Server / upstream errors ──────────
      if (error.status >= 500) {
        toast.error(
          i18n.translate('errors.serverTitle'),
          i18n.translate(error.status === 502 || error.status === 503
            ? 'errors.serverTemporaryBody'
            : 'errors.serverBody'),
        );
        return throwError(() => error);
      }

      // ── 0: no HTTP response at all (offline, DNS, CORS rejection) ──
      // This is the ONLY case worded as a connection problem; real HTTP
      // responses (4xx/5xx) must never be presented as network failures.
      if (error.status === 0) {
        toast.warning(
          i18n.translate('errors.networkTitle'),
          i18n.translate('errors.networkBody'),
        );
        return throwError(() => error);
      }

      // ── Everything else ───────────────────────
      return throwError(() => error);
    }),
  );
};

// ── Helpers ──────────────────────────────────────────

function addToken(req: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return req.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
  });
}

function handleLogout(
  authService: AuthService,
  router: Router,
  toast: ToastService,
  i18n: { translate(key: string): string },
): void {
  toast.info(i18n.translate('errors.sessionExpiredTitle'), i18n.translate('errors.sessionExpiredBody'));
  // Preserve where the user was (e.g. a payment-return URL with its
  // session_id) so login can bring them straight back.
  authService.logout(router.url);
}

function redirectToDashboard(authService: AuthService, router: Router): void {
  const user = authService.getCurrentUser();
  if (!user) return;
  const dashboards: Record<string, string> = {
    admin:            '/admin/dashboard',
    parent:           '/parent/home',
    clinical_manager: '/clinical-manager/dashboard',
    therapist:        '/therapist/dashboard',
    finance:          '/finance/dashboard',
  };
  router.navigate([dashboards[user.role] ?? '/']);
}
