import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

/* ── Finance ── */
export interface FinanceResponse {
  success: boolean;
  kpis: {
    totalRevenue: number;
    revenueThisMonth: number;
    pendingRevenue: number;
    transactions: number;
  };
  charts: {
    trendLabels: string[];
    trendData: number[];
    methodLabels: string[];
    methodData: number[];
  };
}

/* ── Clinical ── */
export interface ClinicalResponse {
  success: boolean;
  dateRange: { start_date: string; end_date: string };
  kpis: {
    totalSessions: number;
    completed: number;
    noShow: number;
    cancelled: number;
    noShowRate: number;
    hoursDelivered: number;
  };
  statusBreakdown: { status: string; count: number }[];
  therapists: {
    therapistId: number;
    therapistName: string;
    totalSessions: number;
    completed: number;
    noShow: number;
    hoursDelivered: number;
    completionRate: number;
  }[];
}

/* ── Audit ── */
export interface AuditLog {
  id: number;
  user_name: string;
  user_role: string;
  action: string;
  action_type: string;
  entity_type: string;
  entity_id: number;
  status: string;
  created_at: string;
}

export interface AuditResponse {
  success: boolean;
  logs: AuditLog[];
  pagination: {
    page: number;
    limit: number;
    totalRows: number;
    totalPages: number;
  };
}

@Injectable({ providedIn: 'root' })
export class ReportsService {
  private apiUrl = `${environment.apiUrl}/admin/reports`;

  constructor(private http: HttpClient) {}

  getFinance(): Observable<FinanceResponse> {
    return this.http.get<FinanceResponse>(`${this.apiUrl}/finance`);
  }

  getClinical(startDate: string, endDate: string): Observable<ClinicalResponse> {
    const params = new HttpParams()
      .set('start_date', startDate)
      .set('end_date', endDate);
    return this.http.get<ClinicalResponse>(`${this.apiUrl}/clinical`, { params });
  }

  getAudit(filters: {
    page?: number; limit?: number;
    start_date?: string; end_date?: string;
    user_role?: string; action_type?: string;
  }): Observable<AuditResponse> {
    let params = new HttpParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== '') params = params.set(k, String(v));
    });
    return this.http.get<AuditResponse>(`${this.apiUrl}/audit`, { params });
  }
}
