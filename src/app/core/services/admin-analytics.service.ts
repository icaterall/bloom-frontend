import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AnalyticsData {
  overview: {
    totalChildren: number;
    totalParents: number;
    totalStaff: number;
    activeBookings: number;
    completedSessionsThisMonth: number;
  };
  revenue: {
    total: number;
    totalCount: number;
    today: number;
    todayCount: number;
    thisMonth: number;
    thisMonthCount: number;
  };
  failedPayments: any[];
  cashPaymentsPending: any[];
  staffWorkload: any[];
  recentUpdates: any[];
}

export interface AnalyticsResponse {
  success: boolean;
  data: AnalyticsData;
}

@Injectable({
  providedIn: 'root'
})
export class AdminAnalyticsService {
  private apiUrl = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) {}

  /**
   * Get comprehensive analytics
   */
  getAnalytics(): Observable<AnalyticsResponse> {
    return this.http.get<AnalyticsResponse>(`${this.apiUrl}/analytics`);
  }

  /**
   * Mark cash payment as paid
   */
  markCashPaid(bookingId: number): Observable<{ success: boolean; message: string; data: any }> {
    return this.http.post<{ success: boolean; message: string; data: any }>(
      `${this.apiUrl}/cash-payments/${bookingId}/mark-paid`,
      {}
    );
  }

  /**
   * Notify parent about cash payment
   */
  notifyParent(bookingId: number, message?: string): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(
      `${this.apiUrl}/cash-payments/${bookingId}/notify`,
      { message }
    );
  }
}

