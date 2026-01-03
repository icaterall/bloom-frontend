import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface CalendarSession {
  id: number;
  status: string;
  mode: string;
  confirmed_start_at: string;
  confirmed_end_at?: string;
  preferred_start_at?: string;
  preferred_end_at?: string;
  online_meeting_link?: string;
  location?: string;
  notes?: string;
  child_name: string;
  child_dob?: string;
  child_gender?: string;
  parent_name: string;
  parent_email?: string;
  parent_mobile?: string;
  therapist_id?: number;
  therapist_name?: string;
  therapist_email?: string;
  booking_type_name?: string;
  booking_type?: string;
}

export interface CalendarSessionsResponse {
  success: boolean;
  data: CalendarSession[];
}

@Injectable({
  providedIn: 'root'
})
export class ClinicalManagerCalendarService {
  private apiUrl = `${environment.apiUrl}/clinical-manager/calendar`;

  constructor(private http: HttpClient) {}

  /**
   * Get sessions for calendar view
   * @param startDate Start date (ISO string, optional - defaults to start of current month)
   * @param endDate End date (ISO string, optional - defaults to end of current month)
   */
  getSessions(startDate?: string, endDate?: string): Observable<CalendarSessionsResponse> {
    let params = new HttpParams();
    
    if (startDate) {
      params = params.set('start_date', startDate);
    }
    
    if (endDate) {
      params = params.set('end_date', endDate);
    }

    return this.http.get<CalendarSessionsResponse>(`${this.apiUrl}/sessions`, { params });
  }
}

