import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Child } from '../../shared/models/child.model';

export interface ChildWithParent extends Child {
  parent_id: number;
  parent_name: string;
  parent_email: string;
  parent_mobile?: string;
}

export interface ChildrenResponse {
  success: boolean;
  data: ChildWithParent[];
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
export class ClinicalManagerChildrenService {
  private apiUrl = `${environment.apiUrl}/clinical-manager/children`;

  constructor(private http: HttpClient) {}

  /**
   * Get all children with their parent information
   * @param search Search term (child name, parent name, or parent email)
   * @param page Page number
   * @param limit Items per page
   */
  getChildren(search?: string, page: number = 1, limit: number = 20): Observable<ChildrenResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search && search.trim()) {
      params = params.set('search', search.trim());
    }

    return this.http.get<ChildrenResponse>(this.apiUrl, { params });
  }

  /**
   * Get single child with parent details
   * @param id Child ID
   */
  getChildById(id: number): Observable<{ success: boolean; data: ChildWithParent }> {
    return this.http.get<{ success: boolean; data: ChildWithParent }>(`${this.apiUrl}/${id}`);
  }
}

