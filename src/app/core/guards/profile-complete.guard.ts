import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Profile Completion Guard
 * Redirects to profile completion page if user's profile is incomplete
 * Use this guard on routes that require a complete profile (e.g., parent dashboard)
 */
export const profileCompleteGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Check if user is authenticated
  if (!authService.isAuthenticatedUser()) {
    router.navigate(['/login']);
    return false;
  }

  const currentUser = authService.getCurrentUser();
  
  // If no user, redirect to login
  if (!currentUser) {
    router.navigate(['/login']);
    return false;
  }

  // Allow access to the profile completion page itself
  if (state.url.includes('/parent/onboarding/profile')) {
    return true;
  }

  // Check if profile is complete
  if (!currentUser.profileComplete) {
    // Profile is incomplete, redirect to completion page
    router.navigate(['/parent/onboarding/profile']);
    return false;
  }

  // Profile is complete, allow access
  return true;
};
