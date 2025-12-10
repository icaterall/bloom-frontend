import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { profileCompleteGuard } from './core/guards/profile-complete.guard';

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
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./features/auth/forgot-password/forgot-password.component')
        .then(m => m.ForgotPasswordComponent),
    title: 'Forgot Password - Bloom Spectrum Centre'
  },
  {
    path: 'auth/reset-password/:token',
    loadComponent: () =>
      import('./features/auth/reset-password/reset-password.component')
        .then(m => m.ResetPasswordComponent),
    title: 'Reset Password - Bloom Spectrum Centre'
  },
  {
    path: 'auth/activate',
    loadComponent: () =>
      import('./features/auth/activate-account/activate-account.component')
        .then(m => m.ActivateAccountComponent),
    title: 'Activate Account - Bloom Spectrum Centre'
  },
  {
    path: 'auth/google/callback',
    loadComponent: () =>
      import('./features/auth/google-callback/google-callback.component')
        .then(m => m.GoogleCallbackComponent),
    title: 'Google Login - Bloom Spectrum Centre'
  },
  // Admin routes
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin'] },
    loadComponent: () =>
      import('./features/admin/layout/admin-layout.component')
        .then(m => m.AdminLayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/admin/dashboard/admin-dashboard.component')
            .then(m => m.AdminDashboardComponent),
        title: 'Admin Dashboard - Bloom Spectrum Centre'
      },
      {
        path: 'staff',
        loadComponent: () =>
          import('./features/admin/staff/staff-list.component')
            .then(m => m.StaffListComponent),
        title: 'Staff Management - Bloom Spectrum Centre'
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  // Clinical Manager routes
  {
    path: 'clinical-manager',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['clinical_manager', 'admin'] },
    loadComponent: () =>
      import('./features/clinical-manager/layout/clinical-manager-layout.component')
        .then(m => m.ClinicalManagerLayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/clinical-manager/dashboard/clinical-manager-dashboard.component')
            .then(m => m.ClinicalManagerDashboardComponent),
        title: 'Clinical Manager Dashboard - Bloom Spectrum Centre'
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  // Parent routes
  {
    path: 'parent',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['parent'] },
    loadComponent: () =>
      import('./features/parent/layout/parent-layout.component')
        .then(m => m.ParentLayoutComponent),
    children: [
      {
        path: 'onboarding/profile',
        loadComponent: () =>
          import('./features/parent/onboarding/profile-completion.component')
            .then(m => m.ProfileCompletionComponent),
        title: 'Complete Your Profile - Bloom Spectrum Centre'
      },
      {
        path: 'dashboard',
        canActivate: [profileCompleteGuard],
        loadComponent: () =>
          import('./features/parent/dashboard/parent-dashboard.component')
            .then(m => m.ParentDashboardComponent),
        title: 'Parent Dashboard - Bloom Spectrum Centre'
      },
      {
        path: 'settings',
        canActivate: [profileCompleteGuard],
        loadComponent: () =>
          import('./features/parent/settings/settings.component')
            .then(m => m.SettingsComponent),
        title: 'Settings - Bloom Spectrum Centre'
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
