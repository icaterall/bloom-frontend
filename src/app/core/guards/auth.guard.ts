import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs/operators';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  console.log('[authGuard] Checking route:', state.url);

  // Check if user is authenticated
  if (authService.isAuthenticatedUser()) {
    console.log('[authGuard] User is authenticated, allowing access');
    return true;
  }

  // Try to load user from token
  const token = authService.getToken();
  console.log('[authGuard] Token exists:', !!token);
  if (token) {
    console.log('[authGuard] Loading user from token...');
    return authService.loadCurrentUser().pipe(
      take(1),
      map(response => {
        console.log('[authGuard] loadCurrentUser response:', response.success);
        if (response.success) {
          console.log('[authGuard] User loaded successfully, allowing access to:', state.url);
          return true;
        } else {
          console.log('[authGuard] User load failed, redirecting to login');
          router.navigate(['/login'], { 
            queryParams: { returnUrl: state.url }
          });
          return false;
        }
      })
    );
  }

  // Not authenticated, redirect to login
  console.log('[authGuard] No token, redirecting to login');
  router.navigate(['/login'], { 
    queryParams: { returnUrl: state.url }
  });
  return false;
};
