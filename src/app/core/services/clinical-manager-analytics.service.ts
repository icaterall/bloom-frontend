import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ClinicalManagerAnalytics {
  metrics: {
    newPaidBookings: number;
    sessionsToday: number;
    waitingForAssessment: number;
    noShowsThisWeek: number;
  };
  todaySessions: any[];
  pendingBookings: any[];
  therapistWorkload: any[];
  recentUpdates: any[];
}

export interface ClinicalManagerAnalyticsResponse {
  success: boolean;
  data: ClinicalManagerAnalytics;
}

@Injectable({
  providedIn: 'root'
})
export class ClinicalManagerAnalyticsService {
  private apiUrl = `${environment.apiUrl}/clinical-manager`;

  constructor(private http: HttpClient) {}

  /**
   * Get comprehensive analytics for clinical manager
   */
  getAnalytics(): Observable<ClinicalManagerAnalyticsResponse> {
    return this.http.get<ClinicalManagerAnalyticsResponse>(`${this.apiUrl}/analytics`);
  }
}

