import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ContactParentRequest {
  subject: string;
  message: string;
  sendEmail?: boolean;
  sendNotification?: boolean;
}

export interface ContactParentResponse {
  success: boolean;
  message: string;
  data: {
    parentId: number;
    parentName: string;
    parentEmail: string;
    sentEmail: boolean;
    sentNotification: boolean;
  };
}

export interface ParentContactInfo {
  id: number;
  name: string;
  email: string;
  mobile?: string;
  preferred_language?: string;
  created_at: string;
  last_login_at?: string;
  email_verified: boolean;
  children_count: number;
}

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private apiUrl = `${environment.apiUrl}/clinical-manager/contact`;

  constructor(private http: HttpClient) {}

  /**
   * Get parent contact information
   * @param parentId Parent ID
   */
  getParentContactInfo(parentId: number): Observable<{ success: boolean; data: ParentContactInfo }> {
    return this.http.get<{ success: boolean; data: ParentContactInfo }>(`${this.apiUrl}/parent/${parentId}`);
  }

  /**
   * Send message/email to parent
   * @param parentId Parent ID
   * @param request Contact request
   */
  contactParent(parentId: number, request: ContactParentRequest): Observable<ContactParentResponse> {
    return this.http.post<ContactParentResponse>(`${this.apiUrl}/parent/${parentId}`, request);
  }
}

