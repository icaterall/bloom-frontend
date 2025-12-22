import { Injectable, signal, OnDestroy, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment';
import { Subject, Observable } from 'rxjs';

export interface Notification {
  id: string;
  type: string;
  data: any;
  timestamp: string;
  read: boolean;
  userId?: number;
  userSpecific?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class SocketService implements OnDestroy {
  private readonly TOKEN_KEY = 'bloom_auth_token';
  private readonly platformId = inject(PLATFORM_ID);
  
  private socket: Socket | null = null;
  private isConnected = signal<boolean>(false);
  private isAuthenticated = signal<boolean>(false);
  private notifications = signal<Notification[]>([]);
  private unreadCount = signal<number>(0);
  
  private notificationSubject = new Subject<Notification>();
  public notification$ = this.notificationSubject.asObservable();

  constructor() {
    // Only initialize socket in browser
    if (isPlatformBrowser(this.platformId)) {
      // Initialize socket connection when service is created
      this.initializeSocket();
    }
  }

  /**
   * Get token from localStorage (same key as AuthService uses)
   */
  private getToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Initialize socket connection
   */
  private initializeSocket(): void {
    const token = this.getToken();
    
    if (!token) {
      console.log('[SocketService] No token available, socket will connect without auth');
    }

    // Connect to socket server
    this.socket = io(environment.apiSocketUrl, {
      transports: ['websocket', 'polling'],
      auth: {
        token: token || undefined
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    // Connection event handlers
    this.socket.on('connect', () => {
      console.log('[SocketService] Connected to server:', this.socket?.id);
      this.isConnected.set(true);
      
      // Authenticate if we have a token
      if (token) {
        this.authenticate(token);
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.log('[SocketService] Disconnected:', reason);
      this.isConnected.set(false);
      this.isAuthenticated.set(false);
    });

    this.socket.on('connect_error', (error) => {
      console.error('[SocketService] Connection error:', error);
      this.isConnected.set(false);
    });

    // Authentication handlers
    this.socket.on('authenticated', (data: { userId: number; role: string }) => {
      console.log('[SocketService] Authenticated:', data);
      this.isAuthenticated.set(true);
    });

    this.socket.on('auth_error', (error: { message: string }) => {
      console.error('[SocketService] Authentication error:', error);
      this.isAuthenticated.set(false);
    });

    // Notification handler
    this.socket.on('notification', (notification: Notification) => {
      console.log('[SocketService] Received notification:', notification);
      this.handleNotification(notification);
    });
  }

  /**
   * Authenticate socket connection with token
   */
  authenticate(token: string): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit('authenticate', { token });
    } else {
      console.warn('[SocketService] Cannot authenticate: socket not connected');
    }
  }

  /**
   * Handle incoming notification
   */
  private handleNotification(notification: Notification): void {
    // Add to notifications list
    const currentNotifications = this.notifications();
    this.notifications.set([notification, ...currentNotifications]);
    
    // Update unread count
    this.unreadCount.set(this.unreadCount() + 1);
    
    // Emit to subscribers
    this.notificationSubject.next(notification);
    
    // Show browser notification if permission granted
    this.showBrowserNotification(notification);
  }

  /**
   * Show browser notification (push notification)
   */
  private async showBrowserNotification(notification: Notification): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    if (!('Notification' in window)) {
      console.log('[SocketService] Browser does not support notifications');
      return;
    }

    // Request permission if not already granted or denied
    if (Notification.permission === 'default') {
      try {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          console.log('[SocketService] Notification permission denied');
          return;
        }
      } catch (error) {
        console.error('[SocketService] Error requesting notification permission:', error);
        return;
      }
    }

    if (Notification.permission === 'granted') {
      try {
        const title = this.getNotificationTitle(notification.type);
        const body = this.getNotificationBody(notification);
        
        const notificationOptions: NotificationOptions = {
          body,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: notification.id, // Prevent duplicate notifications
          requireInteraction: notification.type === 'booking_assigned_to_you', // Keep important notifications visible
          data: {
            notificationId: notification.id,
            type: notification.type,
            ...notification.data
          }
        };

        const browserNotification = new Notification(title, notificationOptions);
        
        // Auto-close after 5 seconds (except for important ones)
        if (!notificationOptions.requireInteraction) {
          setTimeout(() => {
            browserNotification.close();
          }, 5000);
        }

        // Handle click on notification
        browserNotification.onclick = () => {
          window.focus();
          browserNotification.close();
          // You can add navigation logic here based on notification type
        };

        console.log('[SocketService] Browser notification shown:', title);
      } catch (error) {
        console.error('[SocketService] Error showing browser notification:', error);
      }
    } else {
      console.log('[SocketService] Notification permission not granted');
    }
  }

  /**
   * Request notification permission (can be called from UI)
   */
  async requestNotificationPermission(): Promise<boolean> {
    if (!isPlatformBrowser(this.platformId) || !('Notification' in window)) {
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      console.warn('[SocketService] Notification permission was previously denied');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('[SocketService] Error requesting notification permission:', error);
      return false;
    }
  }

  /**
   * Check if notifications are supported and enabled
   */
  isNotificationSupported(): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }
    return 'Notification' in window && Notification.permission === 'granted';
  }

  /**
   * Get notification title based on type
   */
  private getNotificationTitle(type: string): string {
    const titles: { [key: string]: string } = {
      'booking_created': 'New Booking Created',
      'payment_succeeded': 'Payment Successful',
      'payment_failed': 'Payment Failed',
      'booking_status_updated': 'Booking Status Updated',
      'booking_assigned': 'Booking Assigned',
      'booking_assigned_to_you': 'New Booking Assigned to You',
      'booking_accepted_by_therapist': 'Session Accepted by Therapist',
      'clinical_manager_message': 'Message from Clinical Manager',
      'payment_succeeded_clinical_manager': 'New Payment Received',
      'child_case_updated': 'Child Case Update',
      'cash_payment_confirmed': 'Cash Payment Confirmed',
      'cash_payment_reminder': 'Cash Payment Reminder'
    };
    return titles[type] || 'New Notification';
  }

  /**
   * Get notification body text
   */
  private getNotificationBody(notification: Notification): string {
    const { type, data } = notification;
    
    switch (type) {
      case 'booking_created':
        return `Booking #${data.bookingId} has been created successfully.`;
      case 'payment_succeeded':
        return `Payment of ${data.currency || 'MYR'} ${data.amount || 'N/A'} for booking #${data.bookingId} was successful.`;
      case 'payment_failed':
        return `Payment for booking #${data.bookingId} failed. Please try again.`;
      case 'booking_status_updated':
        return `Booking #${data.bookingId} status has been updated.`;
      case 'booking_assigned':
        return `Booking #${data.bookingId} has been assigned to ${data.therapistName || 'a therapist'}.`;
      case 'booking_assigned_to_you':
        const startTime = data.confirmedStartAt ? new Date(data.confirmedStartAt).toLocaleString() : 'scheduled time';
        return `You have been assigned to booking #${data.bookingId} for ${data.childName || 'a child'}. Session: ${startTime}`;
      case 'booking_accepted_by_therapist':
        const sessionTime = data.confirmedStartAt ? new Date(data.confirmedStartAt).toLocaleString() : 'scheduled time';
        return `Your booking #${data.bookingId} has been accepted. Session confirmed for ${sessionTime}${data.googleMeetLink ? '. Google Meet link available.' : ''}`;
      case 'clinical_manager_message':
        return data.subject || 'You have a new message from Clinical Manager.';
      case 'payment_succeeded_clinical_manager':
        return `New payment received for booking #${data.bookingId}. Please review and assign.`;
      case 'child_case_updated':
        const updateType = data.updateType === 'created' ? 'created' : 'updated';
        const hasAttachments = data.hasAttachments ? ` (${data.attachmentsCount} ${data.attachmentsCount === 1 ? 'file' : 'files'})` : '';
        return `Your therapist has ${updateType} a case update for ${data.childName || 'your child'}${hasAttachments}.`;
      case 'cash_payment_confirmed':
        return `Your cash payment of ${data.currency || 'MYR'} ${data.amount || 'N/A'} for booking #${data.bookingId} has been confirmed.`;
      case 'cash_payment_reminder':
        const payBy = data.payByDate ? new Date(data.payByDate).toLocaleDateString() : 'soon';
        return `Reminder: Please pay ${data.currency || 'MYR'} ${data.amount || 'N/A'} for booking #${data.bookingId} by ${payBy}.`;
      default:
        return 'You have a new notification.';
    }
  }

  /**
   * Mark notification as read
   */
  markAsRead(notificationId: string): void {
    const notifications = this.notifications().map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    );
    this.notifications.set(notifications);
    
    // Update unread count
    const unread = notifications.filter(n => !n.read).length;
    this.unreadCount.set(unread);
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead(): void {
    const notifications = this.notifications().map(n => ({ ...n, read: true }));
    this.notifications.set(notifications);
    this.unreadCount.set(0);
  }

  /**
   * Get notifications observable
   */
  getNotifications(): Observable<Notification> {
    return this.notification$;
  }

  /**
   * Get current notifications signal
   */
  getNotificationsSignal() {
    return this.notifications.asReadonly();
  }

  /**
   * Get unread count signal
   */
  getUnreadCountSignal() {
    return this.unreadCount.asReadonly();
  }

  /**
   * Get connection status signal
   */
  getConnectionStatusSignal() {
    return this.isConnected.asReadonly();
  }

  /**
   * Get authentication status signal
   */
  getAuthStatusSignal() {
    return this.isAuthenticated.asReadonly();
  }

  /**
   * Reconnect socket (useful after login)
   */
  reconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
    this.initializeSocket();
  }

  /**
   * Disconnect socket
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnected.set(false);
    this.isAuthenticated.set(false);
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}


