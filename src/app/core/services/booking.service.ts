import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Booking, CreateBookingRequest } from '../../shared/models/booking.model';
import { BookingType, BookingTypePrice } from '../../shared/models/booking-type.model';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private apiUrl = `${environment.apiUrl}/bookings`;
  private bookingTypesUrl = `${environment.apiUrl}/booking-types`;

  constructor(private http: HttpClient) {}

  createBooking(booking: CreateBookingRequest): Observable<any> {
    return this.http.post(`${environment.apiUrl}/parent/bookings`, booking);
  }

  getBookings(): Observable<{ success: boolean; data: Booking[] }> {
    return this.http.get<{ success: boolean; data: Booking[] }>(`${environment.apiUrl}/parent/bookings`);
  }

  getBookingTypes(): Observable<{ success: boolean; data: BookingType[] }> {
    return this.http.get<{ success: boolean; data: BookingType[] }>(this.bookingTypesUrl);
  }

  getBookingTypePrice(code: string, mode: string, duration?: number): Observable<{ success: boolean; data: BookingTypePrice }> {
    let params = new HttpParams().set('mode', mode);
    if (duration) {
      params = params.set('duration', duration.toString());
    }
    return this.http.get<{ success: boolean; data: BookingTypePrice }>(`${this.bookingTypesUrl}/${code}/price`, { params });
  }

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
}
