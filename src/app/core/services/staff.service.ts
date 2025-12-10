import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Staff {
  id: number;
  name: string;
  email: string;
  mobile?: string;
  role: 'clinical_manager' | 'therapist';
  is_active: boolean;
  email_verified: boolean;
  created_at: string;
  last_login_at?: string;
}

export interface CreateStaffRequest {
  name: string;
  email: string;
  mobile?: string;
  role: 'clinical_manager' | 'therapist';
  preferred_language?: 'en' | 'my';
}

export interface StaffResponse {
  success: boolean;
  message?: string;
  data?: Staff | Staff[];
}

@Injectable({
  providedIn: 'root'
})
export class StaffService {
  private apiUrl = `${environment.apiUrl}/admin/staff`;

  constructor(private http: HttpClient) {}

  getStaff(): Observable<StaffResponse> {
    return this.http.get<StaffResponse>(this.apiUrl);
  }

  createStaff(staffData: CreateStaffRequest): Observable<StaffResponse> {
    return this.http.post<StaffResponse>(this.apiUrl, staffData);
  }

  updateStaff(id: number, updates: Partial<Staff>): Observable<StaffResponse> {
    return this.http.patch<StaffResponse>(`${this.apiUrl}/${id}`, updates);
  }
}
