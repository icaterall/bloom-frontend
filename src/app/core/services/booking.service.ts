import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Booking, CreateBookingRequest } from '../../shared/models/booking.model';
import { BookingType, BookingTypePrice } from '../../shared/models/booking-type.model';

/**
 * Booking Service
 * 
 * API Contracts:
 * - GET /api/parent/bookings?child_id=... → list bookings for child
 * - POST /api/parent/bookings → create booking (draft or awaiting payment)
 * - POST /api/parent/bookings/:id/pay → choose payment method + initiate payment
 * - POST /api/payments/webhook/stripe → webhook updates (backend only)
 */
@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private apiUrl = `${environment.apiUrl}/bookings`;
  private bookingTypesUrl = `${environment.apiUrl}/booking-types`;

  constructor(private http: HttpClient) {}

  /**
   * Create a new booking (draft or awaiting payment)
   * POST /api/parent/bookings → create booking
   */
  createBooking(booking: CreateBookingRequest): Observable<any> {
    return this.http.post(`${environment.apiUrl}/parent/bookings`, booking);
  }

  /**
   * Get bookings for the current parent
   * GET /api/parent/bookings?child_id=... → list bookings for child
   * @param childId Optional child ID to filter bookings
   */
  getBookings(childId?: number): Observable<{ success: boolean; data: Booking[] }> {
    let params = new HttpParams();
    if (childId) {
      params = params.set('child_id', childId.toString());
    }
    return this.http.get<{ success: boolean; data: Booking[] }>(`${environment.apiUrl}/parent/bookings`, { params });
  }

  /**
   * Get all active booking types
   * GET /api/booking-types → list active types
   * Returns: code, name, default_duration_min, payment_required, allowed_mode, default_location
   */
  getBookingTypes(): Observable<{ success: boolean; data: BookingType[] }> {
    return this.http.get<{ success: boolean; data: BookingType[] }>(this.bookingTypesUrl);
  }

  /**
   * Get booking type price
   * GET /api/booking-price?type={code}&mode={mode}&duration={min}
   * Returns: price, currency
   */
  getBookingTypePrice(code: string, mode: string, duration?: number): Observable<{ success: boolean; data: BookingTypePrice }> {
    let params = new HttpParams()
      .set('type', code)
      .set('mode', mode);
    if (duration) {
      params = params.set('duration', duration.toString());
    }
    return this.http.get<{ success: boolean; data: BookingTypePrice }>(`${environment.apiUrl}/booking-price`, { params });
  }

  /**
   * Choose payment method and initiate payment
   * POST /api/parent/bookings/:id/pay → choose payment method + initiate payment
   * @param bookingId Booking ID
   * @param paymentMethod Payment method: 'card', 'online_banking', or 'cash'
   */
  payBooking(bookingId: number, paymentMethod: string): Observable<{ checkout_url?: string; message?: string; status?: string }> {
    console.log(`[BookingService] Initiating payment for booking ${bookingId} via ${paymentMethod}`);
    return this.http.post<{ checkout_url?: string; message?: string; status?: string }>(
      `${environment.apiUrl}/parent/bookings/${bookingId}/pay`,
      { payment_method: paymentMethod }
    );
  }

  getBookingBySession(sessionId: string): Observable<{ success: boolean; data: Booking; verification?: any }> {
    console.log(`[BookingService] Fetching booking for session ${sessionId}`);
    return this.http.get<{ success: boolean; data: Booking; verification?: any }>(
      `${environment.apiUrl}/parent/bookings/by-session/${sessionId}`
    );
  }

  getBookingById(bookingId: number): Observable<{ success: boolean; data: Booking }> {
    return this.http.get<{ success: boolean; data: Booking }>(
      `${environment.apiUrl}/parent/bookings/${bookingId}`
    );
  }

  /**
   * Get failed bookings (for clinical managers)
   * @param search Search term
   * @param page Page number
   * @param limit Items per page
   */
  getFailedBookings(search?: string, page: number = 1, limit: number = 20): Observable<{
    success: boolean;
    data: any[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search && search.trim()) {
      params = params.set('search', search.trim());
    }

    return this.http.get<{
      success: boolean;
      data: any[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>(`${environment.apiUrl}/clinical-manager/bookings/failed`, { params });
  }
}
