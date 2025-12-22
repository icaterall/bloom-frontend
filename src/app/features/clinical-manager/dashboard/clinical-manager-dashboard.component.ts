import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ClinicalManagerAnalyticsService, ClinicalManagerAnalytics } from '../../../core/services/clinical-manager-analytics.service';
import { User } from '../../../shared/models/user.model';
import { LucideAngularModule, TrendingUp, Clock, AlertCircle, CheckCircle, XCircle } from 'lucide-angular';

@Component({
  selector: 'app-clinical-manager-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './clinical-manager-dashboard.component.html',
  styleUrls: ['./clinical-manager-dashboard.component.css']
})
export class ClinicalManagerDashboardComponent implements OnInit {
  currentUser: User | null = null;
  isLoading = false;
  error: string | null = null;
  todayDate = new Date();
  analytics: ClinicalManagerAnalytics | null = null;

  // Icons
  readonly TrendingUpIcon = TrendingUp;
  readonly ClockIcon = Clock;
  readonly AlertCircleIcon = AlertCircle;
  readonly CheckCircleIcon = CheckCircle;
  readonly XCircleIcon = XCircle;

  constructor(
    private authService: AuthService,
    private analyticsService: ClinicalManagerAnalyticsService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    this.error = null;
    
    this.analyticsService.getAnalytics().subscribe({
      next: (response) => {
        if (response.success) {
          this.analytics = response.data;
        } else {
          this.error = 'Failed to load dashboard data';
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        this.error = error.error?.message || 'Failed to load dashboard data';
        this.isLoading = false;
      }
    });
  }

  get dashboardMetrics() {
    return this.analytics?.metrics || {
      newPaidBookings: 0,
      sessionsToday: 0,
      waitingForAssessment: 0,
      noShowsThisWeek: 0
    };
  }

  get pendingBookings() {
    return this.analytics?.pendingBookings || [];
  }

  get todaySessions() {
    return this.analytics?.todaySessions || [];
  }

  get therapistWorkload() {
    return this.analytics?.therapistWorkload || [];
  }

  get recentUpdates() {
    return this.analytics?.recentUpdates || [];
  }

  formatTime(startTime: string | undefined, endTime: string | undefined): string {
    if (!startTime) return 'N/A';
    return endTime ? `${startTime}-${endTime}` : startTime;
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatCurrency(amount: number | undefined, currency: string = 'MYR'): string {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-MY', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  getUpdateIcon(type: string): any {
    switch (type) {
      case 'case_update': return TrendingUp;
      case 'booking': return Clock;
      case 'payment': return CheckCircle;
      default: return CheckCircle;
    }
  }

  getUpdateColor(type: string): string {
    switch (type) {
      case 'case_update': return 'bg-blue-100 text-blue-800';
      case 'booking': return 'bg-purple-100 text-purple-800';
      case 'payment': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getLoadClass(load: string): string {
    switch (load) {
      case 'Light': return 'bg-green-100 text-green-800';
      case 'Normal': return 'bg-blue-100 text-blue-800';
      case 'High': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Scheduled': return 'bg-blue-100 text-blue-800';
      case 'In progress': return 'bg-green-100 text-green-800';
      case 'Completed': return 'bg-gray-100 text-gray-800';
      case 'No-show': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getAlertClass(type: string): string {
    switch (type) {
      case 'warning': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'danger': return 'bg-red-50 border-red-200 text-red-800';
      case 'info': return 'bg-blue-50 border-blue-200 text-blue-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  }

}
