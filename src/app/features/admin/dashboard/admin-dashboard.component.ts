import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { AdminAnalyticsService, AnalyticsData } from '../../../core/services/admin-analytics.service';
import { User } from '../../../shared/models/user.model';
import { LucideAngularModule, TrendingUp, Users, Baby, DollarSign, AlertCircle, Clock, CheckCircle, XCircle, Bell, CreditCard } from 'lucide-angular';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  currentUser: User | null = null;
  analytics: AnalyticsData | null = null;
  isLoading = true;
  error: string | null = null;

  // Icons
  readonly TrendingUpIcon = TrendingUp;
  readonly UsersIcon = Users;
  readonly BabyIcon = Baby;
  readonly DollarSignIcon = DollarSign;
  readonly AlertCircleIcon = AlertCircle;
  readonly ClockIcon = Clock;
  readonly CheckCircleIcon = CheckCircle;
  readonly XCircleIcon = XCircle;
  readonly BellIcon = Bell;
  readonly CreditCardIcon = CreditCard;

  // Notification states
  notifyingBookingId: number | null = null;
  markingPaidBookingId: number | null = null;

  constructor(
    private authService: AuthService,
    private analyticsService: AdminAnalyticsService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadAnalytics();
  }

  loadAnalytics(): void {
    this.isLoading = true;
    this.error = null;
    
    this.analyticsService.getAnalytics().subscribe({
      next: (response) => {
        if (response.success) {
          this.analytics = response.data;
        } else {
          this.error = 'Failed to load analytics';
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading analytics:', error);
        this.error = error.error?.message || 'Failed to load analytics';
        this.isLoading = false;
      }
    });
  }

  markCashPaid(bookingId: number): void {
    if (this.markingPaidBookingId === bookingId) return;
    
    this.markingPaidBookingId = bookingId;
    this.analyticsService.markCashPaid(bookingId).subscribe({
      next: (response) => {
        if (response.success) {
          // Reload analytics
          this.loadAnalytics();
          alert('Cash payment marked as paid successfully!');
        } else {
          alert('Failed to mark payment as paid');
        }
        this.markingPaidBookingId = null;
      },
      error: (error) => {
        console.error('Error marking cash paid:', error);
        alert(error.error?.message || 'Failed to mark payment as paid');
        this.markingPaidBookingId = null;
      }
    });
  }

  notifyParent(bookingId: number, message?: string): void {
    if (this.notifyingBookingId === bookingId) return;
    
    const customMessage = message || prompt('Enter a custom message (optional):');
    if (customMessage === null && message === undefined) return; // User cancelled
    
    this.notifyingBookingId = bookingId;
    this.analyticsService.notifyParent(bookingId, customMessage || undefined).subscribe({
      next: (response) => {
        if (response.success) {
          alert('Parent notified successfully!');
        } else {
          alert('Failed to notify parent');
        }
        this.notifyingBookingId = null;
      },
      error: (error) => {
        console.error('Error notifying parent:', error);
        alert(error.error?.message || 'Failed to notify parent');
        this.notifyingBookingId = null;
      }
    });
  }

  formatCurrency(amount: number, currency: string = 'MYR'): string {
    return new Intl.NumberFormat('en-MY', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric'
    });
  }

  getRelativeTime(dateString: string | undefined): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return this.formatDate(dateString);
  }

  getUpdateIcon(type: string): any {
    switch (type) {
      case 'case_update': return TrendingUp;
      case 'booking': return Clock;
      case 'payment': return DollarSign;
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
}
