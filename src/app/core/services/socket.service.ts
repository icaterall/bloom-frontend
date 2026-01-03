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
   * Show browser notification
   */
  private async showBrowserNotification(notification: Notification): Promise<void> {
    if ('Notification' in window && Notification.permission === 'granted') {
      const title = this.getNotificationTitle(notification.type);
      const body = this.getNotificationBody(notification);
      
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico'
      });
    } else if ('Notification' in window && Notification.permission !== 'denied') {
      // Request permission
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          this.showBrowserNotification(notification);
        }
      });
    }
  }

  /**
   * Get notification title based on type
   */
  private getNotificationTitle(type: string): string {
    const titles: { [key: string]: string } = {
      'booking_created': 'New Booking Created',
      'payment_succeeded': 'Payment Successful',
      'payment_failed': 'Payment Failed',
      'booking_status_updated': 'Booking Status Updated'
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
        return `Payment of ${data.currency} ${data.amount} for booking #${data.bookingId} was successful.`;
      case 'payment_failed':
        return `Payment for booking #${data.bookingId} failed. Please try again.`;
      case 'booking_status_updated':
        return `Booking #${data.bookingId} status has been updated.`;
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


