import {
  HttpInterceptorFn,
  HttpErrorResponse,
  HttpRequest,
  HttpHandlerFn,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  catchError,
  switchMap,
  throwError,
  BehaviorSubject,
  filter,
  take,
  Observable,
} from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

// ──────────────────────────────────────────────
// Enterprise HTTP Interceptor
//
// 1. Attaches Bearer token to every outgoing request.
// 2. On 401 → attempts a silent token refresh via
//    /refresh-token. If refresh succeeds the original
//    request is retried transparently. If it fails
//    the user is logged out and redirected to /login.
// 3. On 403 → shows a toast + redirects to the role
//    dashboard.
// 4. On 500 → shows a user-friendly error toast.
// 5. Queues concurrent requests during a refresh so
//    only ONE refresh call is in-flight at a time.
// ──────────────────────────────────────────────

let isRefreshing = false;
const refreshSubject = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
) => {
  const authService  = inject(AuthService);
  const router       = inject(Router);
  const toast        = inject(ToastService);

  // Attach token
  const token = authService.getToken();
  let authedReq = req;
  if (token) {
    authedReq = addToken(req, token);
  }

  return next(authedReq).pipe(
    catchError((error: HttpErrorResponse) => {

      // ── 401 Unauthorized ──────────────────────
      if (error.status === 401 && !isRefreshUrl(req.url)) {
        return handle401(authedReq, next, authService, router, toast);
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

function isRefreshUrl(url: string): boolean {
  return url.includes('/auth/refresh-token');
}

/**
 * Handle a 401 by attempting a silent refresh.
 * If another refresh is already in-flight, queue this request
 * and replay it once the new token arrives.
 */
function handle401(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  authService: AuthService,
  router: Router,
  toast: ToastService,
): Observable<any> {

  if (!isRefreshing) {
    isRefreshing = true;
    refreshSubject.next(null); // block queued requests

    return authService.refreshToken().pipe(
      switchMap((result: any) => {
        isRefreshing = false;

        if (result && result.success !== false) {
          const newToken = authService.getToken()!;
          refreshSubject.next(newToken);
          // Retry the original request with the fresh token
          return next(addToken(req, newToken));
        }

        // Refresh failed → logout
        refreshSubject.next(null);
        handleLogout(authService, router, toast);
        return throwError(() => new HttpErrorResponse({ status: 401 }));
      }),
      catchError(() => {
        isRefreshing = false;
        refreshSubject.next(null);
        handleLogout(authService, router, toast);
        return throwError(() => new HttpErrorResponse({ status: 401 }));
      }),
    );
  }

  // A refresh is already in progress — wait for it, then retry.
  return refreshSubject.pipe(
    filter(token => token !== null),
    take(1),
    switchMap(token => next(addToken(req, token!))),
  );
}

function handleLogout(
  authService: AuthService,
  router: Router,
  toast: ToastService,
): void {
  toast.info('Session Expired', 'Please sign in again to continue.');
  authService.logout();
  router.navigate(['/login']);
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
