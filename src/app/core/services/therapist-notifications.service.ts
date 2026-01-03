import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface TherapistNotification {
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
  display_title?: string;
}

export interface NotificationsResponse {
  success: boolean;
  data: TherapistNotification[];
  unreadCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class TherapistNotificationsService {
  private apiUrl = `${environment.apiUrl}/therapist`;

  constructor(private http: HttpClient) {}

  /**
   * Get notifications for therapist
   * GET /api/therapist/notifications
   */
  getNotifications(unreadOnly: boolean = false): Observable<NotificationsResponse> {
    let params = new HttpParams();
    if (unreadOnly) {
      params = params.set('unreadOnly', 'true');
    }
    return this.http.get<NotificationsResponse>(`${this.apiUrl}/notifications`, { params });
  }

  /**
   * Mark notification as read
   * POST /api/therapist/notifications/:id/read
   */
  markAsRead(notificationId: number): Observable<{ success: boolean; message?: string }> {
    return this.http.post<{ success: boolean; message?: string }>(
      `${this.apiUrl}/notifications/${notificationId}/read`,
      {}
    );
  }

  /**
   * Mark all notifications as read
   * POST /api/therapist/notifications/read-all
   */
  markAllAsRead(): Observable<{ success: boolean; message?: string }> {
    return this.http.post<{ success: boolean; message?: string }>(
      `${this.apiUrl}/notifications/read-all`,
      {}
    );
  }
}

