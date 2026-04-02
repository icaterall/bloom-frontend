import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Lead {
  id: number;
  respondent_name: string;
  respondent_email: string;
  respondent_phone: string;
  response_text: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface LeadResponse {
  success: boolean;
  message?: string;
  data?: Lead | Lead[];
}

export interface ConvertedUser {
  id: number;
  name: string;
  email: string;
  mobile: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export interface ConvertResponse {
  success: boolean;
  message?: string;
  data?: ConvertedUser;
}

@Injectable({
  providedIn: 'root'
})
export class LeadsService {
  private apiUrl = `${environment.apiUrl}/admin/leads`;

  constructor(private http: HttpClient) {}

  getLeads(status?: 'new' | 'contacted'): Observable<LeadResponse> {
    let params = new HttpParams();
    if (status) {
      params = params.set('status', status);
    }
    return this.http.get<LeadResponse>(this.apiUrl, { params });
  }

  markContacted(id: number): Observable<LeadResponse> {
    return this.http.put<LeadResponse>(`${this.apiUrl}/${id}/contacted`, {});
  }

  convertToParent(id: number): Observable<ConvertResponse> {
    return this.http.post<ConvertResponse>(`${this.apiUrl}/${id}/convert`, {});
  }
}
