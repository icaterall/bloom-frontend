import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface CenterHour {
  id?: number;
  day_of_week: number;
  day_name?: string;
  open_time: string | null;   // 'HH:mm'
  close_time: string | null;
  is_closed: boolean;
}

export interface AdminBookingType {
  id: number;
  code: string;
  name: string;
  default_duration_min: number;
  payment_required: boolean;
  allowed_mode: string;
  default_location: string | null;
  is_active: boolean;
  sort_order: number;
}

export interface PricingRule {
  id: number;
  mode?: string;
  duration_min?: number | null;
  price?: number | string;
  currency?: string;
  is_active?: boolean;
}

/**
 * Admin business-rules configuration (Phase 4 UI over existing /config endpoints).
 * GET  /config/center-hours        (any auth)   · PUT /config/center-hours (admin)
 * GET  /config/booking-types       (admin)      · PUT /config/booking-types/:id (admin)
 * GET  /config/pricing             (admin)
 */
@Injectable({ providedIn: 'root' })
export class AdminConfigService {
  private readonly apiUrl = `${environment.apiUrl}/config`;

  constructor(private http: HttpClient) {}

  getCenterHours(): Observable<{ success: boolean; data: CenterHour[] }> {
    return this.http.get<{ success: boolean; data: CenterHour[] }>(`${this.apiUrl}/center-hours`);
  }
  updateCenterHours(schedule: CenterHour[]): Observable<{ success: boolean; message?: string }> {
    return this.http.put<{ success: boolean; message?: string }>(`${this.apiUrl}/center-hours`, { schedule });
  }

  getBookingTypes(): Observable<{ success: boolean; data: AdminBookingType[] }> {
    return this.http.get<{ success: boolean; data: AdminBookingType[] }>(`${this.apiUrl}/booking-types`);
  }
  setBookingTypeActive(id: number, isActive: boolean): Observable<{ success: boolean; message?: string }> {
    return this.http.put<{ success: boolean; message?: string }>(`${this.apiUrl}/booking-types/${id}`, { is_active: isActive });
  }

  getPricing(): Observable<{ success: boolean; data: PricingRule[] }> {
    return this.http.get<{ success: boolean; data: PricingRule[] }>(`${this.apiUrl}/pricing`);
  }
}
