import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

/**
 * Clinical-manager / admin management of parent cancellation & reschedule requests (Phase 4).
 * All routes require role clinical_manager or admin.
 */
@Injectable({ providedIn: 'root' })
export class ClinicalManagerRequestsService {
  private readonly apiUrl = `${environment.apiUrl}/clinical-manager`;

  constructor(private http: HttpClient) {}

  getCancellationRequests(): Observable<{ success: boolean; data: any[] }> {
    return this.http.get<{ success: boolean; data: any[] }>(`${this.apiUrl}/cancellation-requests`);
  }
  approveCancellation(id: number): Observable<{ success: boolean; message?: string }> {
    return this.http.post<{ success: boolean; message?: string }>(`${this.apiUrl}/cancellation-requests/${id}/approve`, {});
  }
  rejectCancellation(id: number): Observable<{ success: boolean; message?: string }> {
    return this.http.post<{ success: boolean; message?: string }>(`${this.apiUrl}/cancellation-requests/${id}/reject`, {});
  }

  getRescheduleRequests(): Observable<{ success: boolean; data: any[] }> {
    return this.http.get<{ success: boolean; data: any[] }>(`${this.apiUrl}/reschedule-requests`);
  }
  approveReschedule(id: number): Observable<{ success: boolean; message?: string }> {
    return this.http.post<{ success: boolean; message?: string }>(`${this.apiUrl}/reschedule-requests/${id}/approve`, {});
  }
  rejectReschedule(id: number): Observable<{ success: boolean; message?: string }> {
    return this.http.post<{ success: boolean; message?: string }>(`${this.apiUrl}/reschedule-requests/${id}/reject`, {});
  }
}
