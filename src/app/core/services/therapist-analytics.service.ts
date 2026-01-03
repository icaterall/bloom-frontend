import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface TherapistAnalytics {
  sessions: {
    today: number;
    thisWeek: number;
    thisMonth: number;
    completedThisMonth: number;
  };
  upcomingSessions: any[];
  activeChildren: number;
  caseUpdates: {
    thisWeek: number;
    thisMonth: number;
  };
  recentCaseUpdates: any[];
}

export interface TherapistAnalyticsResponse {
  success: boolean;
  data: TherapistAnalytics;
}

@Injectable({
  providedIn: 'root'
})
export class TherapistAnalyticsService {
  private apiUrl = `${environment.apiUrl}/therapist`;

  constructor(private http: HttpClient) {}

  /**
   * Get therapist analytics
   */
  getAnalytics(): Observable<TherapistAnalyticsResponse> {
    return this.http.get<TherapistAnalyticsResponse>(`${this.apiUrl}/analytics`);
  }
}

