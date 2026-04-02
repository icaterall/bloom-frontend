import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AppStore } from '../state/app.store';
import { Notification } from './socket.service';

// ──────────────────────────────────────────────
// Universal Notification Service
// Works for ALL roles: parent, therapist,
// clinical_manager, admin, finance.
// Calls the role-agnostic /notifications endpoint.
// ──────────────────────────────────────────────

export interface NotificationItem {
  id: number;
  user_id: number;
  type: string;
  title: string;
  message: string;
  data: any;
  read: boolean;
  read_at?: string;
  created_at: string;
  updated_at: string;
}

export interface NotificationsResponse {
  success: boolean;
  data: NotificationItem[];
  unreadCount: number;
  total: number;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly apiUrl = `${environment.apiUrl}/notifications`;
  private readonly http   = inject(HttpClient);
  private readonly store  = inject(AppStore);

  /**
   * Fetch notifications for the currently authenticated user.
   * Works for any role — the backend resolves the user from the JWT.
   */
  getNotifications(options: {
    unreadOnly?: boolean;
    limit?: number;
    offset?: number;
  } = {}): Observable<NotificationsResponse> {
    let params = new HttpParams();
    if (options.unreadOnly) params = params.set('unreadOnly', 'true');
    if (options.limit)      params = params.set('limit', options.limit.toString());
    if (options.offset)     params = params.set('offset', options.offset.toString());

    return this.http.get<NotificationsResponse>(this.apiUrl, { params }).pipe(
      tap(res => {
        if (res.success && res.data) {
          // Sync the store with the fetched notifications
          const mapped: Notification[] = res.data.map(n => ({
            id: String(n.id),
            type: n.type,
            title: n.title,
            message: n.message,
            data: n.data,
            timestamp: n.created_at,
            read: n.read,
          }));
          this.store.setNotifications(mapped);
        }
      }),
    );
  }

  /**
   * Mark a single notification as read.
   */
  markAsRead(notificationId: number): Observable<{ success: boolean; message?: string }> {
    return this.http.post<{ success: boolean; message?: string }>(
      `${this.apiUrl}/${notificationId}/read`,
      {},
    ).pipe(
      tap(res => {
        if (res.success) {
          this.store.markNotificationRead(String(notificationId));
        }
      }),
    );
  }

  /**
   * Mark all notifications as read.
   */
  markAllAsRead(): Observable<{ success: boolean; message?: string }> {
    return this.http.post<{ success: boolean; message?: string }>(
      `${this.apiUrl}/read-all`,
      {},
    ).pipe(
      tap(res => {
        if (res.success) {
          this.store.markAllNotificationsRead();
        }
      }),
    );
  }

  /**
   * Delete a single notification.
   */
  delete(notificationId: number): Observable<{ success: boolean; message?: string }> {
    return this.http.delete<{ success: boolean; message?: string }>(
      `${this.apiUrl}/${notificationId}`,
    );
  }
}
