import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface TherapistStats {
  confirmed_bookings: number;
  completed_bookings: number;
  cancelled_bookings: number;
  no_show_bookings: number;
  upcoming_bookings: number;
  children_count: number;
}

export interface Therapist {
  id: number;
  name: string;
  email: string;
  mobile?: string;
  is_active: boolean;
  email_verified: boolean;
  created_at: string;
  last_login_at?: string;
  preferred_language?: string;
  confirmed_bookings_count?: number;
  completed_bookings_count?: number;
  cancelled_bookings_count?: number;
  no_show_bookings_count?: number;
  upcoming_bookings_count?: number;
  unique_children_count?: number;
  stats: TherapistStats;
}

export interface RecentBooking {
  id: number;
  status: string;
  confirmed_start_at?: string;
  confirmed_end_at?: string;
  preferred_start_at: string;
  preferred_end_at?: string;
  mode: string;
  child_name: string;
  parent_name: string;
  booking_type_name?: string;
}

export interface TherapistWithDetails extends Therapist {
  recent_bookings?: RecentBooking[];
}

export interface TherapistsResponse {
  success: boolean;
  data: Therapist[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ClinicalManagerTherapistsService {
  private apiUrl = `${environment.apiUrl}/clinical-manager/therapists`;

  constructor(private http: HttpClient) {}

  /**
   * Get all therapists with their statistics
   * @param search Search term (therapist name, email, or mobile)
   * @param page Page number
   * @param limit Items per page
   */
  getTherapists(search?: string, page: number = 1, limit: number = 20): Observable<TherapistsResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search && search.trim()) {
      params = params.set('search', search.trim());
    }

    return this.http.get<TherapistsResponse>(this.apiUrl, { params });
  }

  /**
   * Get single therapist with detailed statistics
   * @param id Therapist ID
   */
  getTherapistById(id: number): Observable<{ success: boolean; data: TherapistWithDetails }> {
    return this.http.get<{ success: boolean; data: TherapistWithDetails }>(`${this.apiUrl}/${id}`);
  }
}

