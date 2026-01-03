import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface BookingStats {
  total: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  no_shows: number;
  pending_review: number;
  online: number;
  in_centre: number;
}

export interface PaymentStats {
  total: number;
  total_revenue: number;
  successful: number;
  failed: number;
  pending: number;
  card: number;
  online_banking: number;
  cash: number;
  success_rate: string;
}

export interface TherapistStat {
  id: number;
  name: string;
  email: string;
  total_sessions: number;
  completed_sessions: number;
  cancelled_sessions: number;
  no_show_sessions: number;
  unique_children: number;
  avg_session_duration: string;
  completion_rate: string;
}

export interface ChildrenStats {
  total: number;
  enrolled: number;
  in_assessment: number;
  on_waitlist: number;
  not_enrolled: number;
  autism: number;
  gdd: number;
  suspected: number;
  no_diagnosis: number;
}

export interface WaitlistStats {
  total: number;
  avg_days: string;
  max_days: number;
  long_waitlist: number;
}

export interface SessionStats {
  total: number;
  upcoming: number;
  completed: number;
  cancelled: number;
  no_shows: number;
  avg_duration: string;
  completion_rate: string;
}

export interface StatusBreakdown {
  status: string;
  count: number;
  percentage: string;
}

export interface MonthlyTrend {
  month: string;
  bookings_count: number;
  completed_count: number;
  revenue: number;
}

export interface ReportsData {
  date_range: {
    start_date: string;
    end_date: string;
  };
  booking_stats: BookingStats;
  payment_stats: PaymentStats;
  therapist_stats: TherapistStat[];
  children_stats: ChildrenStats;
  waitlist_stats: WaitlistStats;
  session_stats: SessionStats;
  status_breakdown: StatusBreakdown[];
  monthly_trends: MonthlyTrend[];
}

export interface ReportsResponse {
  success: boolean;
  data: ReportsData;
}

@Injectable({
  providedIn: 'root'
})
export class ClinicalManagerReportsService {
  private apiUrl = `${environment.apiUrl}/clinical-manager/reports`;

  constructor(private http: HttpClient) {}

  /**
   * Get comprehensive reports
   * @param startDate Optional start date (ISO string)
   * @param endDate Optional end date (ISO string)
   */
  getReports(startDate?: string, endDate?: string): Observable<ReportsResponse> {
    let params = new HttpParams();
    
    if (startDate) {
      params = params.set('start_date', startDate);
    }
    
    if (endDate) {
      params = params.set('end_date', endDate);
    }

    return this.http.get<ReportsResponse>(this.apiUrl, { params });
  }
}

