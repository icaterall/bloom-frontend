import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Booking } from '../../shared/models/booking.model';
import { ChildCaseUpdate } from './child-case.service';
import { Child } from '../../shared/models/child.model';

export interface TherapistSessionsResponse {
  success: boolean;
  data: Booking[];
}

export interface SessionsFilters {
  from?: string; // YYYY-MM-DD
  to?: string; // YYYY-MM-DD
  status?: 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  mode?: 'in_centre' | 'online';
}

@Injectable({
  providedIn: 'root'
})
export class TherapistSessionsService {
  private apiUrl = `${environment.apiUrl}/therapist`;

  constructor(private http: HttpClient) {}

  /**
   * Get therapist sessions with filters
   * GET /api/therapist/sessions?from=...&to=...&status=...&mode=...
   */
  getSessions(filters?: SessionsFilters): Observable<TherapistSessionsResponse> {
    let params = new HttpParams();
    
    if (filters) {
      if (filters.from) {
        params = params.set('from', filters.from);
      }
      if (filters.to) {
        params = params.set('to', filters.to);
      }
      if (filters.status) {
        params = params.set('status', filters.status);
      }
      if (filters.mode) {
        params = params.set('mode', filters.mode);
      }
    }

    return this.http.get<TherapistSessionsResponse>(`${this.apiUrl}/sessions`, { params });
  }

  /**
   * Get session details by booking ID
   * GET /api/therapist/sessions/:bookingId
   */
  getSessionById(bookingId: number): Observable<{
    success: boolean;
    data: {
      booking: Booking;
      child: Child;
      previousUpdates: ChildCaseUpdate[];
    };
  }> {
    return this.http.get<{
      success: boolean;
      data: {
        booking: Booking;
        child: Child;
        previousUpdates: ChildCaseUpdate[];
      };
    }>(`${this.apiUrl}/sessions/${bookingId}`);
  }

  /**
   * Mark session as completed
   * POST /api/therapist/sessions/:bookingId/complete
   */
  markCompleted(bookingId: number): Observable<{ success: boolean; message?: string; data: Booking }> {
    return this.http.post<{ success: boolean; message?: string; data: Booking }>(
      `${this.apiUrl}/sessions/${bookingId}/complete`,
      {}
    );
  }

  /**
   * Mark session as no-show
   * POST /api/therapist/sessions/:bookingId/no-show
   */
  markNoShow(bookingId: number): Observable<{ success: boolean; message?: string; data: Booking }> {
    return this.http.post<{ success: boolean; message?: string; data: Booking }>(
      `${this.apiUrl}/sessions/${bookingId}/no-show`,
      {}
    );
  }
}

