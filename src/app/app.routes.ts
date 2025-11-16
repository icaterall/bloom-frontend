import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./landing-page/landing-page.component')
        .then(m => m.LandingPageComponent),
    title: 'Bloom Spectrum Centre - Every child can grow'
  },
  // Test route (remove in production)
  {
    path: 'test-connection',
    loadComponent: () =>
      import('./test-connection.component')
        .then(m => m.TestConnectionComponent),
    title: 'Test Backend Connection'
  },
  // Auth routes
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component')
        .then(m => m.LoginComponent),
    title: 'Login - Bloom Spectrum Centre'
  },
  // Admin routes
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin'] },
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/admin/dashboard/admin-dashboard.component')
            .then(m => m.AdminDashboardComponent),
        title: 'Admin Dashboard - Bloom Spectrum Centre'
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  // Parent routes
  {
    path: 'parent',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['parent'] },
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/parent/dashboard/parent-dashboard.component')
            .then(m => m.ParentDashboardComponent),
        title: 'Parent Dashboard - Bloom Spectrum Centre'
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  {
    path: 'programmes',
    loadComponent: () =>
      import('./pages/programmes/programmes')
        .then(m => m.ProgrammesComponent),
    title: 'Our Programmes - Bloom Spectrum Centre'
  },
  {
    path: 'book-tour',
    loadComponent: () =>
      import('./pages/book-tour/book-tour')
        .then(m => m.BookTourComponent),
    title: 'Book a Tour - Bloom Spectrum Centre'
  },
  {
    path: 'fees',
    loadComponent: () =>
      import('./pages/fees/fees')
        .then(m => m.Fees),
    title: 'Fees - Bloom Spectrum Centre'
  },
  {
    path: 'faqs',
    loadComponent: () =>
      import('./pages/faqs/faqs')
        .then(m => m.Faqs),
    title: 'FAQs - Bloom Spectrum Centre'
  },
  {
    path: 'contact',
    loadComponent: () =>
      import('./pages/contact/contact')
        .then(m => m.Contact),
    title: 'Contact Us - Bloom Spectrum Centre'
  },
  { path: '**', redirectTo: '' }
];
