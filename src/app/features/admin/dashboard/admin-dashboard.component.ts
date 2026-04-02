import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import {
  AdminDashboardService,
  DashboardStats,
} from './admin-dashboard.service';
import { User } from '../../../shared/models/user.model';

import {
  LucideAngularModule,
  RefreshCw,
  Baby,
  Users,
  UserCheck,
  CalendarCheck,
  TrendingUp,
  DollarSign,
  Banknote,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  XCircle,
  Bell,
  CreditCard,
  AlertCircle,
  Briefcase,
  Activity,
} from 'lucide-angular';

/* ═══════════════════════════════════════════
   KPI Card Descriptor
   ═══════════════════════════════════════════ */
interface KpiCard {
  label: string;
  value: number;
  icon: any;
  iconBg: string;   // Tailwind bg class for the icon circle
  iconColor: string; // Tailwind text class for the icon
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  stats: DashboardStats | null = null;
  isLoading = true;
  error: string | null = null;

  /* ── Icon references ────────────────── */
  readonly RefreshCwIcon    = RefreshCw;
  readonly DollarSignIcon   = DollarSign;
  readonly BanknoteIcon     = Banknote;
  readonly ArrowUpRightIcon = ArrowUpRight;
  readonly ClockIcon        = Clock;
  readonly CheckCircle2Icon = CheckCircle2;
  readonly XCircleIcon      = XCircle;
  readonly BellIcon         = Bell;
  readonly CreditCardIcon   = CreditCard;
  readonly AlertCircleIcon  = AlertCircle;
  readonly BriefcaseIcon    = Briefcase;
  readonly ActivityIcon     = Activity;
  readonly TrendingUpIcon   = TrendingUp;
  readonly UsersIcon        = Users;

  /* ── KPI Card definitions (populated on data load) ── */
  kpiCards: KpiCard[] = [];

  /* ── Interaction state ──────────────── */
  notifyingBookingId: number | null = null;
  markingPaidBookingId: number | null = null;
  isRefreshing = false;

  private subs = new Subscription();

  constructor(
    private authService: AuthService,
    public dashService: AdminDashboardService,
  ) {}

  /* ═══════════════════════════════════════
     Lifecycle
     ═══════════════════════════════════════ */

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();

    // Subscribe to service streams
    this.subs.add(
      this.dashService.stats$.subscribe((s) => {
        this.stats = s;
        if (s) this.buildKpiCards(s);
      }),
    );
    this.subs.add(
      this.dashService.loading$.subscribe((l) => {
        this.isLoading = l;
        if (!l) this.isRefreshing = false;
      }),
    );
    this.subs.add(
      this.dashService.error$.subscribe((e) => (this.error = e)),
    );

    // Initial load
    this.dashService.loadDashboardStats();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  /* ═══════════════════════════════════════
     Actions
     ═══════════════════════════════════════ */

  refreshData(): void {
    this.isRefreshing = true;
    this.dashService.loadDashboardStats();
  }

  markCashPaid(bookingId: number): void {
    if (this.markingPaidBookingId === bookingId) return;
    this.markingPaidBookingId = bookingId;

    this.dashService.markCashPaid(bookingId).subscribe({
      next: (res) => {
        if (res.success) {
          this.dashService.loadDashboardStats();
        }
        this.markingPaidBookingId = null;
      },
      error: () => {
        this.markingPaidBookingId = null;
      },
    });
  }

  notifyParent(bookingId: number): void {
    if (this.notifyingBookingId === bookingId) return;
    this.notifyingBookingId = bookingId;

    this.dashService.notifyParent(bookingId).subscribe({
      next: () => {
        this.notifyingBookingId = null;
      },
      error: () => {
        this.notifyingBookingId = null;
      },
    });
  }

  /* ═══════════════════════════════════════
     Helpers (delegated to service)
     ═══════════════════════════════════════ */

  fmt(amount: number, currency = 'MYR'): string {
    return this.dashService.formatCurrency(amount, currency);
  }

  relTime(date: string | undefined): string {
    return this.dashService.getRelativeTime(date);
  }

  fmtDate(dateString: string | undefined): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  /* ── Update type helpers ────────────── */

  getUpdateIcon(type: string): any {
    switch (type) {
      case 'case_update': return TrendingUp;
      case 'booking':     return CalendarCheck;
      case 'payment':     return DollarSign;
      default:            return Activity;
    }
  }

  getUpdateColor(type: string): string {
    switch (type) {
      case 'case_update': return 'bg-blue-100 text-blue-700';
      case 'booking':     return 'bg-violet-100 text-violet-700';
      case 'payment':     return 'bg-emerald-100 text-emerald-700';
      default:            return 'bg-slate-100 text-slate-600';
    }
  }

  /* ── Build KPI card array from stats ── */
  private buildKpiCards(s: DashboardStats): void {
    this.kpiCards = [
      {
        label: 'Total Children',
        value: s.kpis.totalChildren,
        icon: Baby,
        iconBg: 'bg-blue-50',
        iconColor: 'text-[#2663eb]',
      },
      {
        label: 'Total Parents',
        value: s.kpis.totalParents,
        icon: Users,
        iconBg: 'bg-violet-50',
        iconColor: 'text-violet-600',
      },
      {
        label: 'Active Staff',
        value: s.kpis.activeStaff,
        icon: UserCheck,
        iconBg: 'bg-indigo-50',
        iconColor: 'text-indigo-600',
      },
      {
        label: 'Active Bookings',
        value: s.kpis.activeBookings,
        icon: CalendarCheck,
        iconBg: 'bg-emerald-50',
        iconColor: 'text-emerald-600',
      },
      {
        label: 'Completed (Month)',
        value: s.kpis.completedThisMonth,
        icon: TrendingUp,
        iconBg: 'bg-amber-50',
        iconColor: 'text-amber-600',
      },
    ];
  }
}
