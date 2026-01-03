import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Booking } from '../../shared/models/booking.model';

export interface TherapistDashboardData {
  todaySessions: Booking[];
  overdueNotesCount: number;
  unreadMessagesCount: number;
}

export interface TherapistDashboardResponse {
  success: boolean;
  data: TherapistDashboardData;
}

@Injectable({
  providedIn: 'root'
})
export class TherapistDashboardService {
  private apiUrl = `${environment.apiUrl}/therapist`;

  constructor(private http: HttpClient) {}

  /**
   * Get therapist dashboard data
   * GET /api/therapist/dashboard
   */
  getDashboard(): Observable<TherapistDashboardResponse> {
    return this.http.get<TherapistDashboardResponse>(`${this.apiUrl}/dashboard`);
  }
}

