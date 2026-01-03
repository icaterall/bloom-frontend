import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Child, ChildResponse } from '../../shared/models/child.model';

@Injectable({
  providedIn: 'root'
})
export class ChildService {
  private apiUrl = `${environment.apiUrl}/children`;

  constructor(private http: HttpClient) {}

  /**
   * Get all children for current user
   * GET /api/children → list my children
   */
  getChildren(): Observable<ChildResponse> {
    return this.http.get<ChildResponse>(this.apiUrl);
  }

  /**
   * Get single child by ID
   */
  getChildById(id: number): Observable<ChildResponse> {
    return this.http.get<ChildResponse>(`${this.apiUrl}/${id}`);
  }

  /**
   * Create a new child profile
   * POST /api/children → create child
   */
  createChild(childData: Child): Observable<ChildResponse> {
    return this.http.post<ChildResponse>(this.apiUrl, childData);
  }

  /**
   * Update child profile
   */
  updateChild(id: number, childData: Partial<Child>): Observable<ChildResponse> {
    return this.http.patch<ChildResponse>(`${this.apiUrl}/${id}`, childData);
  }

  /**
   * Delete child profile
   */
  deleteChild(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
