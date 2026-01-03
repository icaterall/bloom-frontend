import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Booking } from '../../shared/models/booking.model';

export interface TherapistBookingsResponse {
  success: boolean;
  data: Booking[];
}

@Injectable({
  providedIn: 'root'
})
export class TherapistBookingService {
  private apiUrl = `${environment.apiUrl}/therapist`;

  constructor(private http: HttpClient) {}

  /**
   * Get all bookings assigned to the therapist
   * @param status Optional status filter
   */
  getMyBookings(status?: string): Observable<TherapistBookingsResponse> {
    let params = new HttpParams();
    if (status) {
      params = params.set('status', status);
    }
    return this.http.get<TherapistBookingsResponse>(`${this.apiUrl}/bookings`, { params });
  }

  /**
   * Accept a booking assignment
   * @param bookingId Booking ID to accept
   * @param payload Optional payload including notes, confirmed times, and Google Meet link
   */
  acceptBooking(
    bookingId: number,
    payload: {
      notes?: string;
      confirmed_start_at?: string;
      confirmed_end_at?: string;
      google_meet_link?: string;
    } = {}
  ): Observable<{ success: boolean; message: string; data: Booking }> {
    return this.http.post<{ success: boolean; message: string; data: Booking }>(
      `${this.apiUrl}/bookings/${bookingId}/accept`,
      payload
    );
  }

  /**
   * Reject a booking assignment
   * @param bookingId Booking ID to reject
   * @param reason Rejection reason
   */
  rejectBooking(bookingId: number, reason?: string): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(
      `${this.apiUrl}/bookings/${bookingId}/reject`,
      { reason }
    );
  }

  /**
   * Get children assigned to the therapist
   */
  getMyChildren(): Observable<{ success: boolean; data: any[] }> {
    return this.http.get<{ success: boolean; data: any[] }>(`${this.apiUrl}/children`);
  }

  /**
   * Get a single child by ID with details, sessions, and updates
   */
  getChildById(childId: number): Observable<{
    success: boolean;
    data: {
      child: any;
      sessions: any[];
      progressUpdates: any[];
    };
  }> {
    return this.http.get<{
      success: boolean;
      data: {
        child: any;
        sessions: any[];
        progressUpdates: any[];
      };
    }>(`${this.apiUrl}/children/${childId}`);
  }
}

