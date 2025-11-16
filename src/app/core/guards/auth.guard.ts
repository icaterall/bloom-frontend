import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs/operators';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Check if user is authenticated
  if (authService.isAuthenticatedUser()) {
    return true;
  }

  // Try to load user from token
  const token = authService.getToken();
  if (token) {
    return authService.loadCurrentUser().pipe(
      take(1),
      map(response => {
        if (response.success) {
          return true;
        } else {
          router.navigate(['/login'], { 
            queryParams: { returnUrl: state.url }
          });
          return false;
        }
      })
    );
  }

  // Not authenticated, redirect to login
  router.navigate(['/login'], { 
    queryParams: { returnUrl: state.url }
  });
  return false;
};
