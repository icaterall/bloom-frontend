import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface FinancePayment {
  id: number;
  booking_id: number | null;
  parent_id: number | null;
  amount: number | string;
  currency: string;
  method: string;          // 'card' | 'online_banking' | 'cash'
  provider: string;        // 'stripe' | 'cash' | 'manual_bank' | ...
  status: string;          // 'pending' | 'succeeded' | 'failed' | 'refunded' | 'cancelled'
  paid_at: string | null;
  created_at: string;
  booking_type?: string;
  booking_status?: string;
  booking_payment_status?: string;
  child_name?: string;
  parent_name?: string;
  parent_email?: string;
}

export interface FinancePaymentsResponse {
  success: boolean;
  data: FinancePayment[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}

export interface FinanceSummary {
  total_pending_revenue: number;
  total_confirmed_revenue: number;
  total_failed_revenue: number;
  total_refunded_revenue: number;
  total_payments: number;
  pending_count: number;
  succeeded_count: number;
  failed_count: number;
  card_count: number;
  cash_count: number;
  bank_count: number;
  period: { month: string; year: number };
}

/**
 * Finance Service — read-only access to the existing backend finance endpoints.
 * GET /api/v1/finance/payments  (role: finance | admin)
 * GET /api/v1/finance/summary   (role: finance | admin)
 */
@Injectable({ providedIn: 'root' })
export class FinanceService {
  private readonly apiUrl = `${environment.apiUrl}/finance`;

  constructor(private http: HttpClient) {}

  getPayments(opts: { status?: string; method?: string; page?: number; limit?: number } = {}): Observable<FinancePaymentsResponse> {
    let params = new HttpParams();
    if (opts.status) params = params.set('status', opts.status);
    if (opts.method) params = params.set('method', opts.method);
    params = params.set('page', String(opts.page ?? 1));
    params = params.set('limit', String(opts.limit ?? 50));
    return this.http.get<FinancePaymentsResponse>(`${this.apiUrl}/payments`, { params });
  }

  getSummary(): Observable<{ success: boolean; data: FinanceSummary }> {
    return this.http.get<{ success: boolean; data: FinanceSummary }>(`${this.apiUrl}/summary`);
  }

  // ── Phase 4 actions (finance/admin) — mounted under /payments, not /finance ──
  private readonly paymentsUrl = `${environment.apiUrl}/payments`;

  /** Approve a pending manual (cash/bank) payment. PUT /payments/:id/approve */
  approvePayment(paymentId: number, notes?: string): Observable<{ success: boolean; message?: string }> {
    return this.http.put<{ success: boolean; message?: string }>(
      `${this.paymentsUrl}/${paymentId}/approve`, { notes: notes || null });
  }

  /** Reject a pending manual payment. PUT /payments/:id/reject */
  rejectPayment(paymentId: number, reason?: string): Observable<{ success: boolean; message?: string }> {
    return this.http.put<{ success: boolean; message?: string }>(
      `${this.paymentsUrl}/${paymentId}/reject`, { reason: reason || null });
  }

  /** Refund a succeeded Stripe payment. PUT /payments/:id/refund */
  refundPayment(paymentId: number, body: { amount?: number; reason?: string } = {}): Observable<{ success: boolean; message?: string }> {
    return this.http.put<{ success: boolean; message?: string }>(
      `${this.paymentsUrl}/${paymentId}/refund`, body);
  }
}
