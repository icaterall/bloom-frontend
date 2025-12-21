import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    // Dynamic reset password route: render at runtime (no prerender params needed)
    path: 'auth/reset-password/:token',
    renderMode: RenderMode.Server
  },
  {
    // Parent routes require authentication - must render client-side
    path: 'parent/**',
    renderMode: RenderMode.Client
  },
  {
    // Admin routes require authentication - must render client-side
    path: 'admin/**',
    renderMode: RenderMode.Client
  },
  {
    // Clinical manager routes require authentication
    path: 'clinical-manager/**',
    renderMode: RenderMode.Client
  },
  {
    // Therapist routes require authentication
    path: 'therapist/**',
    renderMode: RenderMode.Client
  },
  {
    // Login page - client-side for proper auth handling
    path: 'login',
    renderMode: RenderMode.Client
  },
  {
    // All other routes are still prerendered by default
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
