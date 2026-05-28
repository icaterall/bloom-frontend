import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AvailabilitySlot {
  id?: number;
  day_of_week: number;     // 0=Sun … 6=Sat
  start_time: string;      // 'HH:mm'
  end_time: string;        // 'HH:mm'
  is_available?: boolean;
}

export interface AvailabilityResponse {
  success: boolean;
  message?: string;
  data: { weekly: AvailabilitySlot[]; time_off: any[] };
}

/**
 * Therapist self-service availability (Phase 5).
 * GET  /api/v1/therapist/availability
 * PUT  /api/v1/therapist/availability   body { slots: AvailabilitySlot[] }
 */
@Injectable({ providedIn: 'root' })
export class TherapistAvailabilityService {
  private readonly apiUrl = `${environment.apiUrl}/therapist/availability`;

  constructor(private http: HttpClient) {}

  getMine(): Observable<AvailabilityResponse> {
    return this.http.get<AvailabilityResponse>(this.apiUrl);
  }

  setMine(slots: AvailabilitySlot[]): Observable<AvailabilityResponse> {
    return this.http.put<AvailabilityResponse>(this.apiUrl, { slots });
  }
}
