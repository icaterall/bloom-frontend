import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Booking } from '../../shared/models/booking.model';

export interface BookingsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  booking_type?: string;
  mode?: string;
  therapist_id?: number;
  date_from?: string;
  date_to?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface PaginatedBookingsResponse {
  success: boolean;
  data: Booking[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ConfirmedBookingsResponse {
  success: boolean;
  data: Booking[];
}

export interface BookingStats {
  total: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  pending: number;
  today: number;
  thisWeek: number;
  thisMonth: number;
}

export interface BookingStatsResponse {
  success: boolean;
  data: BookingStats;
}

@Injectable({
  providedIn: 'root'
})
export class ClinicalManagerBookingsService {
  private apiUrl = `${environment.apiUrl}/clinical-manager/bookings`;

  constructor(private http: HttpClient) {}

  /**
   * Get all confirmed bookings ordered by nearest date
   */
  getConfirmedBookings(): Observable<ConfirmedBookingsResponse> {
    return this.http.get<ConfirmedBookingsResponse>(this.apiUrl);
  }

  /**
   * Get paginated bookings with filters
   */
  getBookings(params: BookingsQueryParams = {}): Observable<PaginatedBookingsResponse> {
    let httpParams = new HttpParams();

    if (params.page) httpParams = httpParams.set('page', params.page.toString());
    if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());
    if (params.search) httpParams = httpParams.set('search', params.search);
    if (params.status) httpParams = httpParams.set('status', params.status);
    if (params.booking_type) httpParams = httpParams.set('booking_type', params.booking_type);
    if (params.mode) httpParams = httpParams.set('mode', params.mode);
    if (params.therapist_id) httpParams = httpParams.set('therapist_id', params.therapist_id.toString());
    if (params.date_from) httpParams = httpParams.set('date_from', params.date_from);
    if (params.date_to) httpParams = httpParams.set('date_to', params.date_to);
    if (params.sort_by) httpParams = httpParams.set('sort_by', params.sort_by);
    if (params.sort_order) httpParams = httpParams.set('sort_order', params.sort_order);

    return this.http.get<PaginatedBookingsResponse>(this.apiUrl, { params: httpParams });
  }

  /**
   * Get booking statistics
   */
  getBookingStats(): Observable<BookingStatsResponse> {
    return this.http.get<BookingStatsResponse>(`${this.apiUrl}/stats`);
  }

  /**
   * Get single booking by ID
   */
  getBookingById(id: number): Observable<{ success: boolean; data: Booking }> {
    return this.http.get<{ success: boolean; data: Booking }>(`${this.apiUrl}/${id}`);
  }

  /**
   * Update booking status
   */
  updateBookingStatus(id: number, status: string, notes?: string): Observable<{ success: boolean; data: Booking }> {
    return this.http.patch<{ success: boolean; data: Booking }>(`${this.apiUrl}/${id}/status`, { status, notes });
  }

  /**
   * Export bookings to CSV
   */
  exportBookings(params: BookingsQueryParams = {}): Observable<Blob> {
    let httpParams = new HttpParams();

    if (params.status) httpParams = httpParams.set('status', params.status);
    if (params.booking_type) httpParams = httpParams.set('booking_type', params.booking_type);
    if (params.date_from) httpParams = httpParams.set('date_from', params.date_from);
    if (params.date_to) httpParams = httpParams.set('date_to', params.date_to);

    return this.http.get(`${this.apiUrl}/export`, {
      params: httpParams,
      responseType: 'blob'
    });
  }
}
