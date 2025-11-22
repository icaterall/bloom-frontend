import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    // Dynamic reset password route: render at runtime (no prerender params needed)
    path: 'auth/reset-password/:token',
    renderMode: RenderMode.Server
  },
  {
    // All other routes are still prerendered by default
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
