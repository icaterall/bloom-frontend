import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ChildCaseUpdate {
  id?: number;
  child_id: number;
  booking_id?: number;
  therapist_id: number;
  status?: string;
  case_notes?: string;
  progress_summary?: string;
  goals?: string[] | string;
  next_steps?: string;
  attachments?: Attachment[];
  created_at?: string;
  updated_at?: string;
  therapist_name?: string;
  child_name?: string;
  booking_type_name?: string;
}

export interface Attachment {
  type: 'photo' | 'video' | 'document';
  url: string;
  filename: string;
  size: number;
  mimeType?: string;
  uploadedAt?: string;
}

export interface CaseUpdateResponse {
  success: boolean;
  message?: string;
  data: ChildCaseUpdate;
}

export interface CaseUpdatesListResponse {
  success: boolean;
  data: ChildCaseUpdate[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ChildCaseService {
  private therapistApiUrl = `${environment.apiUrl}/therapist`;
  private parentApiUrl = `${environment.apiUrl}/parent`;

  constructor(private http: HttpClient) {}

  /**
   * Create or update a case update for a child
   */
  createOrUpdateCaseUpdate(
    childId: number,
    data: Partial<ChildCaseUpdate>,
    files?: File[]
  ): Observable<CaseUpdateResponse> {
    const formData = new FormData();

    // Add text fields
    if (data.booking_id) formData.append('bookingId', data.booking_id.toString());
    if (data.status) formData.append('status', data.status);
    if (data.case_notes) formData.append('caseNotes', data.case_notes);
    if (data.progress_summary) formData.append('progressSummary', data.progress_summary);
    if (data.goals) {
      const goalsStr = Array.isArray(data.goals) ? JSON.stringify(data.goals) : data.goals;
      formData.append('goals', goalsStr);
    }
    if (data.next_steps) formData.append('nextSteps', data.next_steps);

    // Add files
    if (files && files.length > 0) {
      files.forEach((file, index) => {
        formData.append('attachments', file, file.name);
      });
    }

    return this.http.post<CaseUpdateResponse>(
      `${this.therapistApiUrl}/children/${childId}/case-updates`,
      formData
    );
  }

  /**
   * Get case updates for a child (for therapists)
   */
  getCaseUpdates(
    childId: number,
    bookingId?: number,
    page: number = 1,
    limit: number = 20
  ): Observable<CaseUpdatesListResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (bookingId) {
      params = params.set('bookingId', bookingId.toString());
    }

    return this.http.get<CaseUpdatesListResponse>(
      `${this.therapistApiUrl}/children/${childId}/case-updates`,
      { params }
    );
  }

  /**
   * Get case updates for a child (for parents)
   */
  getCaseUpdatesForParent(
    childId: number,
    bookingId?: number,
    page: number = 1,
    limit: number = 20
  ): Observable<CaseUpdatesListResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (bookingId) {
      params = params.set('bookingId', bookingId.toString());
    }

    return this.http.get<CaseUpdatesListResponse>(
      `${this.parentApiUrl}/children/${childId}/case-updates`,
      { params }
    );
  }

  /**
   * Get a single case update by ID
   */
  getCaseUpdateById(caseUpdateId: number): Observable<CaseUpdateResponse> {
    return this.http.get<CaseUpdateResponse>(
      `${this.therapistApiUrl}/case-updates/${caseUpdateId}`
    );
  }

  /**
   * Update child status (quick update)
   */
  updateChildStatus(childId: number, status: string): Observable<CaseUpdateResponse> {
    return this.http.put<CaseUpdateResponse>(
      `${this.therapistApiUrl}/children/${childId}/status`,
      { status }
    );
  }

  /**
   * Delete an attachment from a case update
   */
  deleteAttachment(caseUpdateId: number, fileUrl: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(
      `${this.therapistApiUrl}/case-updates/${caseUpdateId}/attachments`,
      { body: { fileUrl } }
    );
  }
}

