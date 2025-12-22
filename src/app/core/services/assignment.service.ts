import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Therapist {
  id: number;
  name: string;
  email: string;
  mobile?: string;
  isAvailable: boolean;
  conflicts: number;
  todayBookingsCount: number;
}

export interface AvailableTherapistsResponse {
  success: boolean;
  data: {
    requestedTime: {
      start_at: string;
      end_at: string;
    };
    therapists: Therapist[];
  };
}

export interface Booking {
  id: number;
  parent_id: number;
  child_id: number;
  child_name?: string;
  child_dob?: string;
  child_gender?: string;
  parent_name?: string;
  parent_email?: string;
  parent_mobile?: string;
  booking_type: string;
  booking_type_name?: string;
  mode: string;
  preferred_start_at: string;
  preferred_end_at?: string;
  confirmed_start_at?: string;
  confirmed_end_at?: string;
  status: string;
  payment_status: string;
  price: number;
  currency: string;
  therapist_id?: number;
  therapist_name?: string;
  notes?: string;
}

export interface AssignBookingRequest {
  booking_id: number;
  therapist_id: number;
  confirmed_start_at?: string;
  confirmed_end_at?: string;
  notes?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AssignmentService {
  private apiUrl = `${environment.apiUrl}/clinical-manager/assignments`;

  constructor(private http: HttpClient) {}

  /**
   * Get bookings awaiting assignment
   */
  getPendingAssignments(): Observable<{ success: boolean; data: Booking[] }> {
    return this.http.get<{ success: boolean; data: Booking[] }>(`${this.apiUrl}/pending`);
  }

  /**
   * Get available therapists for a specific date/time
   * @param startAt Start time (ISO string)
   * @param endAt End time (ISO string, optional)
   * @param bookingId Booking ID to exclude from conflict check (optional)
   */
  getAvailableTherapists(startAt: string, endAt?: string, bookingId?: number): Observable<AvailableTherapistsResponse> {
    let params = new HttpParams().set('start_at', startAt);
    
    if (endAt) {
      params = params.set('end_at', endAt);
    }
    
    if (bookingId) {
      params = params.set('booking_id', bookingId.toString());
    }

    return this.http.get<AvailableTherapistsResponse>(`${this.apiUrl}/available-therapists`, { params });
  }

  /**
   * Assign booking to therapist
   * @param request Assignment request
   */
  assignBooking(request: AssignBookingRequest): Observable<{ success: boolean; message: string; data: Booking }> {
    return this.http.post<{ success: boolean; message: string; data: Booking }>(`${this.apiUrl}/assign`, request);
  }
}

