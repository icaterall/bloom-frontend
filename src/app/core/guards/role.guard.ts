import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  console.log('[roleGuard] Checking route:', state.url);

  // Get required roles from route data
  const requiredRoles = route.data['roles'] as string[];
  console.log('[roleGuard] Required roles:', requiredRoles);
  
  if (!requiredRoles || requiredRoles.length === 0) {
    console.log('[roleGuard] No role requirement, allowing access');
    return true; // No role requirement
  }

  const user = authService.getCurrentUser();
  console.log('[roleGuard] Current user:', user?.email, 'role:', user?.role);
  
  if (!user) {
    console.warn('[roleGuard] No current user, redirecting to /login.');
    router.navigate(['/login']);
    return false;
  }

  // Check if user has one of the required roles
  if (requiredRoles.includes(user.role)) {
    console.log('[roleGuard] User has required role, allowing access');
    return true;
  }

  // User doesn't have required role, redirect to their dashboard
  console.warn('[roleGuard] Access denied for role', user.role, 'required roles:', requiredRoles);
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
    case 'staff':
      router.navigate(['/staff/dashboard']);
      break;
    case 'finance':
      router.navigate(['/finance/dashboard']);
      break;
    default:
      router.navigate(['/']);
  }
  
  return false;
};
