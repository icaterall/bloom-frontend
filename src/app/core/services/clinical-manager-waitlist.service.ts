import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Child } from '../../shared/models/child.model';

export interface WaitlistBooking {
  booking_id?: number;
  status?: string;
  preferred_start_at?: string;
  confirmed_start_at?: string;
  booking_type?: string;
  booking_created_at?: string;
}

export interface WaitlistChild extends Child {
  parent_id: number;
  parent_name: string;
  parent_email: string;
  parent_mobile?: string;
  parent_preferred_language?: string;
  days_on_waitlist: number;
  latest_booking?: WaitlistBooking | null;
}

export interface WaitlistResponse {
  success: boolean;
  data: WaitlistChild[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UpdateWaitlistStatusRequest {
  new_status: 'not_enrolled' | 'in_assessment' | 'enrolled';
}

@Injectable({
  providedIn: 'root'
})
export class ClinicalManagerWaitlistService {
  private apiUrl = `${environment.apiUrl}/clinical-manager/waitlist`;

  constructor(private http: HttpClient) {}

  /**
   * Get all children on waitlist
   * @param search Search term (child name, parent name, or parent email)
   * @param page Page number
   * @param limit Items per page
   */
  getWaitlist(search?: string, page: number = 1, limit: number = 20): Observable<WaitlistResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search && search.trim()) {
      params = params.set('search', search.trim());
    }

    return this.http.get<WaitlistResponse>(this.apiUrl, { params });
  }

  /**
   * Get single waitlist child with detailed information
   * @param id Child ID
   */
  getWaitlistChildById(id: number): Observable<{ success: boolean; data: WaitlistChild & { bookings?: any[] } }> {
    return this.http.get<{ success: boolean; data: WaitlistChild & { bookings?: any[] } }>(`${this.apiUrl}/${id}`);
  }

  /**
   * Update child status from waitlist
   * @param id Child ID
   * @param newStatus New status (not_enrolled, in_assessment, enrolled)
   */
  updateWaitlistStatus(id: number, newStatus: 'not_enrolled' | 'in_assessment' | 'enrolled'): Observable<{ success: boolean; message: string; data: any }> {
    return this.http.patch<{ success: boolean; message: string; data: any }>(
      `${this.apiUrl}/${id}/update-status`,
      { new_status: newStatus }
    );
  }
}

