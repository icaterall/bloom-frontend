import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TherapistNotificationsService, TherapistNotification } from '../../../core/services/therapist-notifications.service';
import { SocketService } from '../../../core/services/socket.service';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { LucideAngularModule, Bell, Check, CheckCheck, Calendar, Clock, AlertCircle, X } from 'lucide-angular';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-therapist-notifications',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe, LucideAngularModule],
  templateUrl: './therapist-notifications.component.html',
  styleUrls: ['./therapist-notifications.component.css']
})
export class TherapistNotificationsComponent implements OnInit, OnDestroy {
  notifications: TherapistNotification[] = [];
  unreadCount = 0;
  isLoading = false;
  error: string | null = null;
  filterUnread = false;
  private subscriptions = new Subscription();

  // Icons
  readonly BellIcon = Bell;
  readonly CheckIcon = Check;
  readonly CheckCheckIcon = CheckCheck;
  readonly CalendarIcon = Calendar;
  readonly ClockIcon = Clock;
  readonly AlertCircleIcon = AlertCircle;
  readonly XIcon = X;

  constructor(
    private notificationsService: TherapistNotificationsService,
    private socketService: SocketService
  ) {}

  ngOnInit(): void {
    this.loadNotifications();
    this.setupSocketListeners();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadNotifications(): void {
    this.isLoading = true;
    this.error = null;

    this.notificationsService.getNotifications(this.filterUnread).subscribe({
      next: (response) => {
        if (response.success) {
          this.notifications = response.data;
          this.unreadCount = response.unreadCount;
        } else {
          this.error = 'Failed to load notifications';
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading notifications:', error);
        this.error = error.error?.message || 'Failed to load notifications. Please try again.';
        this.isLoading = false;
      }
    });
  }

  setupSocketListeners(): void {
    // Listen for new notifications via socket
    const notifSub = this.socketService.getNotifications().subscribe((notification) => {
      // Reload notifications when new one arrives
      this.loadNotifications();
    });
    this.subscriptions.add(notifSub);
  }

  toggleFilter(): void {
    this.filterUnread = !this.filterUnread;
    this.loadNotifications();
  }

  markAsRead(notification: TherapistNotification): void {
    if (notification.read) return;

    this.notificationsService.markAsRead(notification.id).subscribe({
      next: (response) => {
        if (response.success) {
          notification.read = true;
          notification.read_at = new Date().toISOString();
          this.unreadCount = Math.max(0, this.unreadCount - 1);
        }
      },
      error: (error) => {
        console.error('Error marking notification as read:', error);
      }
    });
  }

  markAllAsRead(): void {
    if (this.unreadCount === 0) return;

    this.notificationsService.markAllAsRead().subscribe({
      next: (response) => {
        if (response.success) {
          this.notifications.forEach(n => {
            n.read = true;
            n.read_at = new Date().toISOString();
          });
          this.unreadCount = 0;
        }
      },
      error: (error) => {
        console.error('Error marking all notifications as read:', error);
      }
    });
  }

  getNotificationIcon(type: string): any {
    switch (type) {
      case 'booking_assigned_to_you':
        return this.CalendarIcon;
      case 'session_starting_soon':
        return this.ClockIcon;
      case 'parent_replied':
        return this.AlertCircleIcon;
      default:
        return this.BellIcon;
    }
  }

  getNotificationRoute(notification: TherapistNotification): string[] | null {
    if (notification.data?.bookingId) {
      return ['/therapist/sessions', notification.data.bookingId];
    }
    if (notification.data?.childId) {
      return ['/therapist/children', notification.data.childId];
    }
    return null;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
    if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }
}

