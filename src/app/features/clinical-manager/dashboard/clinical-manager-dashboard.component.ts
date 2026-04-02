import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ClinicalManagerAnalyticsService, ClinicalManagerAnalytics } from '../../../core/services/clinical-manager-analytics.service';
import { User } from '../../../shared/models/user.model';
import {
  LucideAngularModule, RefreshCw, AlertCircle, Clock, XCircle,
  CheckCircle2, TrendingUp, Activity, Users, Briefcase
} from 'lucide-angular';

@Component({
  selector: 'app-clinical-manager-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './clinical-manager-dashboard.component.html',
})
export class ClinicalManagerDashboardComponent implements OnInit {
  currentUser: User | null = null;
  isLoading = false;
  isRefreshing = false;
  error: string | null = null;
  analytics: ClinicalManagerAnalytics | null = null;

  // Icons
  readonly RefreshCwIcon = RefreshCw;
  readonly AlertCircleIcon = AlertCircle;
  readonly ClockIcon = Clock;
  readonly XCircleIcon = XCircle;
  readonly CheckCircle2Icon = CheckCircle2;
  readonly TrendingUpIcon = TrendingUp;
  readonly ActivityIcon = Activity;
  readonly UsersIcon = Users;
  readonly BriefcaseIcon = Briefcase;

  constructor(
    private authService: AuthService,
    private analyticsService: ClinicalManagerAnalyticsService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadData();
  }

  loadData(): void {
    this.isLoading = !this.analytics;
    this.isRefreshing = !!this.analytics;
    this.error = null;

    this.analyticsService.getAnalytics().subscribe({
      next: (response) => {
        this.isLoading = false;
        this.isRefreshing = false;
        if (response.success) {
          this.analytics = response.data;
        } else {
          this.error = 'Failed to load dashboard data';
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.isRefreshing = false;
        this.error = err.error?.message || 'Failed to load dashboard data';
      }
    });
  }

  get metrics() {
    return this.analytics?.metrics || {
      newPaidBookings: 0, sessionsToday: 0,
      waitingForAssessment: 0, noShowsThisWeek: 0
    };
  }

  get pendingBookings() { return this.analytics?.pendingBookings || []; }
  get todaySessions() { return this.analytics?.todaySessions || []; }
  get therapistWorkload() { return this.analytics?.therapistWorkload || []; }
  get recentUpdates() { return this.analytics?.recentUpdates || []; }

  formatTime(start: string | undefined, end: string | undefined): string {
    if (!start) return 'N/A';
    return end ? `${start}–${end}` : start;
  }

  fmtDate(d: string | undefined): string {
    if (!d) return 'N/A';
    return new Date(d).toLocaleDateString('en-MY', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  fmt(amount: number | undefined, currency = 'MYR'): string {
    if (!amount) return 'RM 0.00';
    return 'RM ' + amount.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  getLoadClass(load: string): string {
    switch (load) {
      case 'Light':  return 'bg-emerald-50 text-emerald-700';
      case 'Normal': return 'bg-blue-50 text-blue-700';
      case 'High':   return 'bg-red-50 text-red-700';
      default:       return 'bg-slate-100 text-slate-500';
    }
  }

  getUpdateIcon(type: string): any {
    switch (type) {
      case 'case_update': return TrendingUp;
      case 'booking':     return Clock;
      case 'payment':     return CheckCircle2;
      default:            return Activity;
    }
  }

  getUpdateColor(type: string): string {
    switch (type) {
      case 'case_update': return 'bg-blue-50 text-blue-700';
      case 'booking':     return 'bg-purple-50 text-purple-700';
      case 'payment':     return 'bg-emerald-50 text-emerald-700';
      default:            return 'bg-slate-100 text-slate-500';
    }
  }
}
