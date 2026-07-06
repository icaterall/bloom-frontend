import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// Public website contact enquiries (Phase 10).
// Distinct from ContactService, which is the clinical-manager → parent
// messaging tool.

export interface ContactEnquiryRequest {
  fullName: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  /** Honeypot — must stay empty; bots that fill it are silently dropped. */
  website?: string;
}

export interface ContactEnquiry {
  id: number;
  full_name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  status: 'new' | 'reviewed';
  source: string;
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: number | null;
  reviewed_by_name?: string | null;
}

export interface ContactEnquiryListResponse {
  success: boolean;
  data: {
    enquiries: ContactEnquiry[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
    statusCounts: { new?: number; reviewed?: number };
  };
}

@Injectable({ providedIn: 'root' })
export class ContactEnquiriesService {
  private apiUrl = `${environment.apiUrl}/contact/enquiries`;

  constructor(private http: HttpClient) {}

  /** Public: submit a website enquiry (no auth required). */
  submitEnquiry(request: ContactEnquiryRequest): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(this.apiUrl, request);
  }

  /** Staff (admin / clinical manager): list enquiries. */
  getEnquiries(options: { status?: string; search?: string; page?: number; limit?: number } = {}):
    Observable<ContactEnquiryListResponse> {
    let params = new HttpParams();
    if (options.status) params = params.set('status', options.status);
    if (options.search) params = params.set('search', options.search);
    if (options.page) params = params.set('page', options.page);
    if (options.limit) params = params.set('limit', options.limit);
    return this.http.get<ContactEnquiryListResponse>(this.apiUrl, { params });
  }

  /** Staff (admin / clinical manager): mark an enquiry reviewed. */
  markReviewed(id: number): Observable<{ success: boolean; data: Partial<ContactEnquiry> }> {
    return this.http.patch<{ success: boolean; data: Partial<ContactEnquiry> }>(
      `${this.apiUrl}/${id}/reviewed`,
      {}
    );
  }
}
