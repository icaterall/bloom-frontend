import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Parent {
  parent_id: number;
  parent_name: string;
  parent_email: string;
  parent_mobile?: string;
  parent_created_at: string;
  parent_last_login?: string;
  children: Child[];
  children_count: number;
}

export interface Child {
  id: number;
  full_name: string;
  date_of_birth: string;
  gender?: string;
  diagnosis_status?: string;
  created_at: string;
}

export interface ParentsResponse {
  success: boolean;
  data: Parent[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ParentService {
  private apiUrl = `${environment.apiUrl}/clinical-manager/parents`;

  constructor(private http: HttpClient) {}

  /**
   * Get all parents with their children
   * @param search Search term (parent name, email, or child name)
   * @param page Page number
   * @param limit Items per page
   */
  getParents(search?: string, page: number = 1, limit: number = 20): Observable<ParentsResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search && search.trim()) {
      params = params.set('search', search.trim());
    }

    return this.http.get<ParentsResponse>(this.apiUrl, { params });
  }

  /**
   * Get single parent with children details
   * @param id Parent ID
   */
  getParentById(id: number): Observable<{ success: boolean; data: Parent }> {
    return this.http.get<{ success: boolean; data: Parent }>(`${this.apiUrl}/${id}`);
  }
}

