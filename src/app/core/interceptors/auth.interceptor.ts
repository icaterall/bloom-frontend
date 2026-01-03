import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Get token
  const token = authService.getToken();

  // Clone request and add token if available
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // Handle response
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Handle 401 Unauthorized
      if (error.status === 401) {
        console.error('Unauthorized access - logging out');
        authService.logout();
        router.navigate(['/login']);
      }

      // Handle 403 Forbidden
      if (error.status === 403) {
        console.error('[authInterceptor] 403 Forbidden - URL:', req.url);
        console.error('[authInterceptor] Redirecting to dashboard...');
        // Redirect to appropriate dashboard based on role
        const user = authService.getCurrentUser();
        if (user) {
          switch (user.role) {
            case 'admin':
              router.navigate(['/admin/dashboard']);
              break;
            case 'parent':
              router.navigate(['/parent/home']);
              break;
            case 'clinical_manager':
              router.navigate(['/clinical-manager/dashboard']);
              break;
            case 'therapist':
              router.navigate(['/therapist/dashboard']);
              break;
            default:
              router.navigate(['/']);
          }
        }
      }

      return throwError(() => error);
    })
  );
};
