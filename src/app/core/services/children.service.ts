import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

/* ── List item (from GET /admin/children) ── */
export interface ChildListItem {
  id: number;
  full_name: string;
  date_of_birth: string;
  gender: string;
  primary_language: string;
  diagnosis_status: string;
  child_status: string;
  created_at: string;
  parent_name: string;
  parent_mobile: string;
  parent_email: string;
}

export interface ChildListResponse {
  success: boolean;
  data: ChildListItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/* ── Full profile (from GET /admin/children/:id/profile) ── */
export interface ChildDetail {
  id: number;
  parent_id: number;
  full_name: string;
  date_of_birth: string;
  gender: string;
  primary_language: string;
  diagnosis_status: string;
  diagnosis_details: string;
  main_concerns: string;
  child_status: string;
  created_at: string;
  updated_at: string;
}

export interface ParentDetail {
  id: number;
  name: string;
  email: string;
  mobile: string;
  preferred_language: string;
}

export interface ClinicalUpdate {
  id: number;
  status: string;
  case_notes: string;
  progress_summary: string;
  goals: string;
  next_steps: string;
  created_at: string;
  therapist_name: string;
}

export interface ChildFullProfile {
  child: ChildDetail;
  parent: ParentDetail;
  clinical_history: ClinicalUpdate[];
}

export interface ProfileResponse {
  success: boolean;
  data: ChildFullProfile;
}

@Injectable({
  providedIn: 'root'
})
export class ChildrenService {
  private apiUrl = `${environment.apiUrl}/admin/children`;

  constructor(private http: HttpClient) {}

  getChildren(page = 1, limit = 50, search = ''): Observable<ChildListResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    if (search) {
      params = params.set('search', search);
    }
    return this.http.get<ChildListResponse>(this.apiUrl, { params });
  }

  getChildProfile(id: number): Observable<ProfileResponse> {
    return this.http.get<ProfileResponse>(`${this.apiUrl}/${id}/profile`);
  }
}
