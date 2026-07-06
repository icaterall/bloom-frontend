import {
  HttpInterceptorFn,
  HttpErrorResponse,
  HttpRequest,
  HttpHandlerFn,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

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

// 401s from these URLs are handled by the calling component, never by a
// global forced logout.
const NO_LOGOUT_ON_401 = [
  '/auth/login',
  '/auth/register',
  '/parent/bookings/by-session/',
];

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
) => {
  const authService = inject(AuthService);
  const router      = inject(Router);
  const toast       = inject(ToastService);

  // Attach token
  const token = authService.getToken();
  let authedReq = req;
  if (token) {
    authedReq = addToken(req, token);
  }

  return next(authedReq).pipe(
    catchError((error: HttpErrorResponse) => {

      // ── 401 Unauthorized → session expired, force logout ──
      if (error.status === 401) {
        if (!NO_LOGOUT_ON_401.some(url => req.url.includes(url))) {
          handleLogout(authService, router, toast);
        }
        return throwError(() => error);
      }

      // ── 403 Forbidden ─────────────────────────
      if (error.status === 403) {
        toast.warning(
          'Access Denied',
          'You do not have permission to perform this action.',
        );
        redirectToDashboard(authService, router);
        return throwError(() => error);
      }

      // ── 500 Internal Server Error ─────────────
      if (error.status >= 500) {
        toast.error(
          'Server Error',
          'Something went wrong on our end. Please try again shortly.',
        );
        return throwError(() => error);
      }

      // ── 0 (network unreachable) ───────────────
      if (error.status === 0) {
        toast.warning(
          'Network Issue',
          'Unable to reach the server. Please check your connection.',
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
): void {
  toast.info('Session Expired', 'Please sign in again to continue.');
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
