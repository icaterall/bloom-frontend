import { Injectable, signal, OnDestroy, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment';
import { Subject, Observable } from 'rxjs';
import { AppStore } from '../state/app.store';
import { ToastService, ToastType } from './toast.service';

export interface Notification {
  id: string;
  type: string;
  title?: string;
  message?: string;
  data: any;
  timestamp: string;
  read: boolean;
  userId?: number;
  userSpecific?: boolean;
}

@Injectable({ providedIn: 'root' })
export class SocketService implements OnDestroy {
  private readonly TOKEN_KEY   = 'bloom_auth_token';
  private readonly platformId  = inject(PLATFORM_ID);
  private readonly store       = inject(AppStore);
  private readonly toast       = inject(ToastService);

  private socket: Socket | null = null;
  private isAuthenticated = signal<boolean>(false);

  private notificationSubject = new Subject<Notification>();
  public  notification$       = this.notificationSubject.asObservable();

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.initializeSocket();
    }
  }

  // ── Token ──────────────────────────────────────────

  private getToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    return localStorage.getItem(this.TOKEN_KEY);
  }

  // ── Socket lifecycle ───────────────────────────────

  private initializeSocket(): void {
    const token = this.getToken();

    this.socket = io(environment.apiSocketUrl, {
      transports: ['websocket', 'polling'],
      auth: { token: token || undefined },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      this.store.setSocketConnected(true);
      if (token) this.authenticate(token);
    });

    this.socket.on('disconnect', () => {
      this.store.setSocketConnected(false);
      this.isAuthenticated.set(false);
    });

    this.socket.on('connect_error', () => {
      this.store.setSocketConnected(false);
    });

    this.socket.on('authenticated', () => {
      this.isAuthenticated.set(true);
    });

    this.socket.on('auth_error', () => {
      this.isAuthenticated.set(false);
    });

    this.socket.on('notification', (notification: Notification) => {
      this.handleNotification(notification);
    });
  }

  authenticate(token: string): void {
    if (this.socket?.connected) {
      this.socket.emit('authenticate', { token });
    }
  }

  // ── Notification handling ──────────────────────────

  private handleNotification(notification: Notification): void {
    // Push into the global store
    this.store.addNotification(notification);
    // Emit to local subscribers
    this.notificationSubject.next(notification);
    // Show toastr notification
    this.showToastrNotification(notification);
    // Browser notification (for background tabs)
    this.showBrowserNotification(notification);
  }

  /**
   * Map the incoming socket notification to a toastr toast.
   * Uses the title/message from the backend if present,
   * otherwise falls back to local type-based defaults.
   */
  private showToastrNotification(notification: Notification): void {
    const title   = notification.title   || this.getNotificationTitle(notification.type);
    const message = notification.message || this.getNotificationBody(notification);
    const toastType = this.mapNotificationTypeToToast(notification.type);

    this.toast.show(toastType, title, message);
  }

  /** Decide toast severity based on the notification type string. */
  private mapNotificationTypeToToast(type: string): ToastType {
    switch (type) {
      case 'payment_succeeded':
      case 'booking_accepted_by_therapist':
      case 'cash_payment_confirmed':
        return 'success';

      case 'payment_failed':
        return 'error';

      case 'cash_payment_reminder':
        return 'warning';

      // Everything else is informational
      default:
        return 'info';
    }
  }

  private async showBrowserNotification(notification: Notification): Promise<void> {
    if (!('Notification' in window)) return;

    if (Notification.permission === 'granted') {
      this.createBrowserNotification(notification);
    } else if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        this.createBrowserNotification(notification);
      }
    }
  }

  private createBrowserNotification(notification: Notification): void {
    const title = notification.title || this.getNotificationTitle(notification.type);
    const body  = notification.message || this.getNotificationBody(notification);
    new window.Notification(title, { body, icon: '/favicon.ico', badge: '/favicon.ico' });
  }

  private getNotificationTitle(type: string): string {
    const titles: Record<string, string> = {
      booking_created:              'New Booking Created',
      payment_succeeded:            'Payment Successful',
      payment_failed:               'Payment Failed',
      booking_status_updated:       'Booking Status Updated',
      booking_assigned:             'Booking Assigned',
      booking_assigned_to_you:      'New Session Assigned',
      booking_accepted_by_therapist:'Session Accepted',
      clinical_manager_message:     'Clinical Manager Message',
      payment_succeeded_clinical_manager: 'New Payment Received',
      child_case_updated:           'Case Update',
      cash_payment_confirmed:       'Cash Payment Confirmed',
      cash_payment_reminder:        'Payment Reminder',
    };
    return titles[type] || 'New Notification';
  }

  private getNotificationBody(notification: Notification): string {
    const { type, data } = notification;
    switch (type) {
      case 'booking_created':
        return `Booking #${data.bookingId} has been created successfully.`;
      case 'payment_succeeded':
        return `Payment of ${data.currency} ${data.amount} for booking #${data.bookingId} was successful.`;
      case 'payment_failed':
        return `Payment for booking #${data.bookingId} failed. Please try again.`;
      case 'booking_status_updated':
        return `Booking #${data.bookingId} status has been updated.`;
      case 'booking_assigned':
        return `Booking #${data.bookingId} has been assigned to ${data.therapistName || 'a therapist'}.`;
      case 'booking_assigned_to_you':
        return `You have been assigned to booking #${data.bookingId} for ${data.childName || 'a child'}.`;
      case 'booking_accepted_by_therapist':
        return `Your booking #${data.bookingId} has been accepted by the therapist.`;
      case 'child_case_updated':
        return `A case update has been posted for ${data.childName || 'your child'}.`;
      case 'cash_payment_confirmed':
        return `Cash payment of ${data.currency || 'MYR'} ${data.amount} for booking #${data.bookingId} confirmed.`;
      case 'cash_payment_reminder':
        return `Please pay ${data.currency || 'MYR'} ${data.amount} for booking #${data.bookingId} by ${data.payByDate || 'the due date'}.`;
      default:
        return 'You have a new notification.';
    }
  }

  // ── Public helpers ─────────────────────────────────

  markAsRead(notificationId: string): void {
    this.store.markNotificationRead(notificationId);
  }

  markAllAsRead(): void {
    this.store.markAllNotificationsRead();
  }

  getNotifications(): Observable<Notification> {
    return this.notification$;
  }

  /** @deprecated Use AppStore.notifications signal directly */
  getNotificationsSignal()     { return this.store.notifications; }
  /** @deprecated Use AppStore.unreadNotificationCount signal directly */
  getUnreadCountSignal()       { return this.store.unreadNotificationCount; }
  /** @deprecated Use AppStore.socketConnected signal directly */
  getConnectionStatusSignal()  { return this.store.socketConnected; }
  getAuthStatusSignal()        { return this.isAuthenticated.asReadonly(); }

  reconnect(): void {
    if (this.socket) this.socket.disconnect();
    this.initializeSocket();
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.store.setSocketConnected(false);
    this.isAuthenticated.set(false);
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}
