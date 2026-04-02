import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, of } from 'rxjs';
import { environment } from '../../../../environments/environment';

/* ═══════════════════════════════════════════
   Bloom Spectrum – Admin Dashboard Models
   ═══════════════════════════════════════════ */

/** KPI metrics for the admin overview cards */
export interface DashboardKPIs {
  totalChildren: number;
  totalParents: number;
  activeStaff: number;
  activeBookings: number;
  completedThisMonth: number;
}

/** Revenue breakdown in MYR (Malaysian Ringgit) */
export interface DashboardRevenue {
  total: number;
  totalCount: number;
  today: number;
  todayCount: number;
  thisMonth: number;
  thisMonthCount: number;
  currency: string;  // defaults to 'MYR'
}

/** A manual (cash/bank) payment awaiting admin approval */
export interface PendingPayment {
  id: number;
  parent_id: number;
  parent_name: string;
  parent_email: string;
  child_name: string;
  booking_type: string;
  booking_type_name: string;
  amount: number;
  price: number;
  currency: string;
  pay_by_date?: string;
  created_at: string;
}

/** A payment that failed during Stripe processing */
export interface FailedPayment {
  id: number;
  booking_id: number;
  parent_name: string;
  parent_email: string;
  child_name: string;
  booking_type_name: string;
  amount: number;
  currency: string;
  error_message?: string;
  created_at: string;
}

/** Staff member workload entry */
export interface StaffWorkload {
  id: number;
  name: string;
  email: string;
  role: string;
  today_sessions: number;
  active_bookings: number;
  case_updates_count: number;
}

/** Recent system activity or booking event */
export interface RecentUpdate {
  id: number;
  type: 'booking' | 'payment' | 'case_update' | 'system';
  child_name: string;
  parent_name: string;
  status?: string;
  amount?: number;
  currency?: string;
  description?: string;
  created_at: string;
}

/** The complete dashboard payload from GET /api/admin/dashboard-stats */
export interface DashboardStats {
  kpis: DashboardKPIs;
  revenue: DashboardRevenue;
  pending_payments: PendingPayment[];
  failed_payments: FailedPayment[];
  staff_workload: StaffWorkload[];
  recent_updates: RecentUpdate[];
}

/** Standard API envelope */
export interface DashboardResponse {
  success: boolean;
  message?: string;
  data: DashboardStats;
}

/* ═══════════════════════════════════════════
   Admin Dashboard Service
   ═══════════════════════════════════════════ */
@Injectable({ providedIn: 'root' })
export class AdminDashboardService {
  private readonly apiUrl = `${environment.apiUrl}/admin`;

  /** Reactive state — components subscribe to this */
  private statsSubject = new BehaviorSubject<DashboardStats | null>(null);
  stats$ = this.statsSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();

  private errorSubject = new BehaviorSubject<string | null>(null);
  error$ = this.errorSubject.asObservable();

  constructor(private http: HttpClient) {}

  /* ── Fetch dashboard data ──────────────── */

  /**
   * Load all dashboard stats from the backend.
   * Maps the existing /admin/analytics endpoint to our
   * DashboardStats interface for forward-compatibility with
   * the planned /api/admin/dashboard-stats endpoint.
   */
  loadDashboardStats(): void {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    this.http
      .get<{ success: boolean; data: any }>(`${this.apiUrl}/analytics`)
      .pipe(
        tap((res) => {
          if (res.success) {
            // Map the existing analytics response shape to our DashboardStats model
            const raw = res.data;
            const stats: DashboardStats = {
              kpis: {
                totalChildren:     raw.overview?.totalChildren ?? 0,
                totalParents:      raw.overview?.totalParents ?? 0,
                activeStaff:       raw.overview?.totalStaff ?? 0,
                activeBookings:    raw.overview?.activeBookings ?? 0,
                completedThisMonth: raw.overview?.completedSessionsThisMonth ?? 0,
              },
              revenue: {
                total:          raw.revenue?.total ?? 0,
                totalCount:     raw.revenue?.totalCount ?? 0,
                today:          raw.revenue?.today ?? 0,
                todayCount:     raw.revenue?.todayCount ?? 0,
                thisMonth:      raw.revenue?.thisMonth ?? 0,
                thisMonthCount: raw.revenue?.thisMonthCount ?? 0,
                currency:       'MYR',
              },
              pending_payments: raw.cashPaymentsPending ?? [],
              failed_payments:  raw.failedPayments ?? [],
              staff_workload:   raw.staffWorkload ?? [],
              recent_updates:   raw.recentUpdates ?? [],
            };
            this.statsSubject.next(stats);
          } else {
            this.errorSubject.next('Failed to load dashboard data');
          }
          this.loadingSubject.next(false);
        }),
        catchError((err) => {
          console.error('[AdminDashboardService] Error loading stats:', err);
          this.errorSubject.next(
            err.error?.message || 'Unable to connect to the server',
          );
          this.loadingSubject.next(false);
          return of(null);
        }),
      )
      .subscribe();
  }

  /* ── Actions ───────────────────────────── */

  /**
   * Approve a manual (cash/bank) payment and mark the booking as paid.
   */
  markCashPaid(bookingId: number): Observable<{ success: boolean; message: string; data: any }> {
    return this.http.post<{ success: boolean; message: string; data: any }>(
      `${this.apiUrl}/cash-payments/${bookingId}/mark-paid`,
      {},
    );
  }

  /**
   * Send a payment reminder notification to a parent.
   */
  notifyParent(
    bookingId: number,
    message?: string,
  ): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(
      `${this.apiUrl}/cash-payments/${bookingId}/notify`,
      { message },
    );
  }

  /* ── Utility ───────────────────────────── */

  /** Format a numeric amount as RM (Malaysian Ringgit) */
  formatCurrency(amount: number, currency = 'MYR'): string {
    return new Intl.NumberFormat('en-MY', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(amount);
  }

  /** Produce a human-readable relative timestamp */
  getRelativeTime(dateString: string | undefined): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now  = new Date();
    const diffMs   = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60_000);
    const diffHrs  = Math.floor(diffMs / 3_600_000);
    const diffDays = Math.floor(diffMs / 86_400_000);

    if (diffMins < 1)  return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHrs  < 24) return `${diffHrs}h ago`;
    if (diffDays < 7)  return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }
}
