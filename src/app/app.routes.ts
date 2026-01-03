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
      {
        path: 'parents',
        loadComponent: () =>
          import('./features/clinical-manager/parents/parents-list.component')
            .then(m => m.ParentsListComponent),
        title: 'Parents & Children - Bloom Spectrum Centre'
      },
      {
        path: 'children',
        loadComponent: () =>
          import('./features/clinical-manager/children/children-list.component')
            .then(m => m.ChildrenListComponent),
        title: 'Children - Bloom Spectrum Centre'
      },
      {
        path: 'therapists',
        loadComponent: () =>
          import('./features/clinical-manager/therapists/therapists-list.component')
            .then(m => m.TherapistsListComponent),
        title: 'Therapists - Bloom Spectrum Centre'
      },
      {
        path: 'waitlist',
        loadComponent: () =>
          import('./features/clinical-manager/waitlist/waitlist.component')
            .then(m => m.WaitlistComponent),
        title: 'Waitlist - Bloom Spectrum Centre'
      },
      {
        path: 'reports',
        loadComponent: () =>
          import('./features/clinical-manager/reports/reports.component')
            .then(m => m.ReportsComponent),
        title: 'Reports - Bloom Spectrum Centre'
      },
      {
        path: 'bookings/failed',
        loadComponent: () =>
          import('./features/clinical-manager/failed-bookings/failed-bookings.component')
            .then(m => m.FailedBookingsComponent),
        title: 'Failed Bookings - Bloom Spectrum Centre'
      },
      {
        path: 'contact/parent/:id',
        loadComponent: () =>
          import('./features/clinical-manager/contact-parent/contact-parent.component')
            .then(m => m.ContactParentComponent),
        title: 'Contact Parent - Bloom Spectrum Centre'
      },
      {
        path: 'bookings',
        loadComponent: () =>
          import('./features/clinical-manager/bookings/bookings.component')
            .then(m => m.BookingsComponent),
        title: 'Bookings - Bloom Spectrum Centre'
      },
      {
        path: 'assignments',
        loadComponent: () =>
          import('./features/clinical-manager/assignments/assignments.component')
            .then(m => m.AssignmentsComponent),
        title: 'Assign Cases - Bloom Spectrum Centre'
      },
      {
        path: 'calendar',
        loadComponent: () =>
          import('./features/clinical-manager/calendar/calendar.component')
            .then(m => m.ClinicalManagerCalendarComponent),
        title: 'Sessions Calendar - Bloom Spectrum Centre'
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  // Therapist routes
  {
    path: 'therapist',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['therapist'] },
    loadComponent: () =>
      import('./features/therapist/layout/therapist-layout.component')
        .then(m => m.TherapistLayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/therapist/dashboard/therapist-dashboard.component')
            .then(m => m.TherapistDashboardComponent),
        title: 'Therapist Dashboard - Bloom Spectrum Centre'
      },
      {
        path: 'bookings',
        loadComponent: () =>
          import('./features/therapist/bookings/therapist-bookings.component')
            .then(m => m.TherapistBookingsComponent),
        title: 'My Bookings - Bloom Spectrum Centre'
      },
      {
        path: 'sessions',
        loadComponent: () =>
          import('./features/therapist/sessions/therapist-sessions.component')
            .then(m => m.TherapistSessionsComponent),
        title: 'My Sessions - Bloom Spectrum Centre'
      },
      {
        path: 'sessions/:bookingId',
        loadComponent: () =>
          import('./features/therapist/sessions/session-details/session-details.component')
            .then(m => m.SessionDetailsComponent),
        title: 'Session Details - Bloom Spectrum Centre'
      },
      {
        path: 'updates/new',
        loadComponent: () =>
          import('./features/therapist/updates/update-composer.component')
            .then(m => m.UpdateComposerComponent),
        title: 'Create Update - Bloom Spectrum Centre'
      },
      {
        path: 'cases',
        loadComponent: () =>
          import('./features/therapist/cases/therapist-cases.component')
            .then(m => m.TherapistCasesComponent),
        title: 'Child Cases - Bloom Spectrum Centre'
      },
      {
        path: 'children',
        loadComponent: () =>
          import('./features/therapist/children/therapist-children.component')
            .then(m => m.TherapistChildrenComponent),
        title: 'My Children - Bloom Spectrum Centre'
      },
      {
        path: 'children/:childId',
        loadComponent: () =>
          import('./features/therapist/children/child-profile/therapist-child-profile.component')
            .then(m => m.TherapistChildProfileComponent),
        title: 'Child Profile - Bloom Spectrum Centre'
      },
      {
        path: 'notifications',
        loadComponent: () =>
          import('./features/therapist/notifications/therapist-notifications.component')
            .then(m => m.TherapistNotificationsComponent),
        title: 'Notifications - Bloom Spectrum Centre'
      },
      {
        path: 'children/:childId/case-updates',
        loadComponent: () =>
          import('./features/therapist/child-case-updates/child-case-updates.component')
            .then(m => m.ChildCaseUpdatesComponent),
        title: 'Child Case Updates - Bloom Spectrum Centre'
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  // Finance routes
  {
    path: 'finance',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['finance', 'admin'] },
    loadComponent: () =>
      import('./features/finance/layout/finance-layout.component')
        .then(m => m.FinanceLayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/finance/dashboard/finance-dashboard.component')
            .then(m => m.FinanceDashboardComponent),
        title: 'Finance Dashboard - Bloom Spectrum Centre'
      },
      {
        path: 'payments',
        loadComponent: () =>
          import('./features/finance/payments/finance-payments.component')
            .then(m => m.FinancePaymentsComponent),
        title: 'Payments - Bloom Spectrum Centre'
      },
      {
        path: 'cash',
        loadComponent: () =>
          import('./features/finance/cash/finance-cash.component')
            .then(m => m.FinanceCashComponent),
        title: 'Cash Desk - Bloom Spectrum Centre'
      },
      {
        path: 'invoices',
        loadComponent: () =>
          import('./features/finance/invoices/finance-invoices.component')
            .then(m => m.FinanceInvoicesComponent),
        title: 'Invoices - Bloom Spectrum Centre'
      },
      {
        path: 'receipts',
        loadComponent: () =>
          import('./features/finance/receipts/finance-receipts.component')
            .then(m => m.FinanceReceiptsComponent),
        title: 'Receipts - Bloom Spectrum Centre'
      },
      {
        path: 'statements',
        loadComponent: () =>
          import('./features/finance/statements/finance-statements.component')
            .then(m => m.FinanceStatementsComponent),
        title: 'Statements - Bloom Spectrum Centre'
      },
      {
        path: 'reports',
        loadComponent: () =>
          import('./features/finance/reports/finance-reports.component')
            .then(m => m.FinanceReportsComponent),
        title: 'Reports - Bloom Spectrum Centre'
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./features/finance/settings/finance-settings.component')
            .then(m => m.FinanceSettingsComponent),
        title: 'Settings - Bloom Spectrum Centre'
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
        path: 'home',
        canActivate: [profileCompleteGuard],
        loadComponent: () =>
          import('./features/parent/dashboard/parent-dashboard.component')
            .then(m => m.ParentDashboardComponent),
        title: 'Parent Dashboard - Bloom Spectrum Centre'
      },
      {
        path: 'children',
        canActivate: [profileCompleteGuard],
        loadComponent: () =>
          import('./features/parent/children/children-list.component')
            .then(m => m.ChildrenListComponent),
        title: 'My Children - Bloom Spectrum Centre'
      },
      {
        path: 'children/:childId',
        canActivate: [profileCompleteGuard],
        loadComponent: () =>
          import('./features/parent/children/child-profile.component')
            .then(m => m.ChildProfileComponent),
        title: 'Child Profile - Bloom Spectrum Centre'
      },
      {
        path: 'children/:childId/book',
        canActivate: [profileCompleteGuard],
        loadComponent: () =>
          import('./features/parent/children/child-booking.component')
            .then(m => m.ChildBookingComponent),
        title: 'Book Session - Bloom Spectrum Centre'
      },
      {
        path: 'bookings/:bookingId',
        canActivate: [profileCompleteGuard],
        loadComponent: () =>
          import('./features/parent/bookings/booking-details.component')
            .then(m => m.BookingDetailsComponent),
        title: 'Booking Details - Bloom Spectrum Centre'
      },
      {
        path: 'payments',
        canActivate: [profileCompleteGuard],
        loadComponent: () =>
          import('./features/parent/payments/payments-history.component')
            .then(m => m.PaymentsHistoryComponent),
        title: 'Payment History - Bloom Spectrum Centre'
      },
      {
        path: 'schedule',
        canActivate: [profileCompleteGuard],
        loadComponent: () =>
          import('./features/parent/schedule/parent-schedule.component')
            .then(m => m.ParentScheduleComponent),
        title: 'Schedule - Bloom Spectrum Centre'
      },
      {
        path: 'sessions',
        canActivate: [profileCompleteGuard],
        loadComponent: () =>
          import('./features/parent/sessions/sessions-list.component')
            .then(m => m.SessionsListComponent),
        title: 'Sessions - Bloom Spectrum Centre'
      },
      {
        path: 'sessions/:sessionId',
        canActivate: [profileCompleteGuard],
        loadComponent: () =>
          import('./features/parent/sessions/session-details.component')
            .then(m => m.SessionDetailsComponent),
        title: 'Session Details - Bloom Spectrum Centre'
      },
      {
        path: 'updates',
        canActivate: [profileCompleteGuard],
        loadComponent: () =>
          import('./features/parent/updates/child-updates.component')
            .then(m => m.ChildUpdatesComponent),
        title: 'Child Updates - Bloom Spectrum Centre'
      },
      {
        path: 'settings',
        canActivate: [profileCompleteGuard],
        loadComponent: () =>
          import('./features/parent/settings/settings.component')
            .then(m => m.SettingsComponent),
        title: 'Settings - Bloom Spectrum Centre'
      },
      {
        path: 'bookings/success',
        // No guard needed - parent route already has authGuard + roleGuard
        loadComponent: () =>
          import('./features/parent/bookings/booking-success.component')
            .then(m => m.BookingSuccessComponent),
        title: 'Payment Successful - Bloom Spectrum Centre'
      },
      {
        path: 'bookings/cancel',
        // No guard needed - parent route already has authGuard + roleGuard
        loadComponent: () =>
          import('./features/parent/bookings/booking-cancel.component')
            .then(m => m.BookingCancelComponent),
        title: 'Payment Cancelled - Bloom Spectrum Centre'
      },
      { path: '', redirectTo: 'home', pathMatch: 'full' }
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
