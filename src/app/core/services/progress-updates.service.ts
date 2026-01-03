import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ProgressUpdate {
  id?: number;
  child_id: number;
  booking_id?: number;
  therapist_id?: number;
  update_type: 'session_summary' | 'weekly_note' | 'milestone' | 'home_activity' | 'incident';
  title?: string;
  body: string;
  status: 'draft' | 'published';
  published_at?: string;
  created_at?: string;
  updated_at?: string;
  child_name?: string;
  booking_type_name?: string;
  media?: ProgressUpdateMedia[];
}

export interface ProgressUpdateMedia {
  id?: number;
  progress_update_id?: number;
  file_type: 'image' | 'video' | 'pdf';
  file_name: string;
  file_size?: number;
  mime_type?: string;
  s3_key?: string;
  s3_url?: string;
  uploaded_at?: string;
}

export interface CreateUpdateRequest {
  childId: number;
  bookingId?: number;
  updateType: 'session_summary' | 'weekly_note' | 'milestone' | 'home_activity' | 'incident';
  title?: string;
  body: string;
}

export interface ProgressUpdatesResponse {
  success: boolean;
  data: ProgressUpdate[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ProgressUpdateResponse {
  success: boolean;
  message?: string;
  data: ProgressUpdate;
}

@Injectable({
  providedIn: 'root'
})
export class ProgressUpdatesService {
  private therapistApiUrl = `${environment.apiUrl}/therapist`;
  private parentApiUrl = `${environment.apiUrl}/parent`;

  constructor(private http: HttpClient) {}

  /**
   * Create a progress update (draft)
   * POST /api/therapist/updates
   */
  createUpdate(data: CreateUpdateRequest): Observable<ProgressUpdateResponse> {
    return this.http.post<ProgressUpdateResponse>(`${this.therapistApiUrl}/updates`, data);
  }

  /**
   * Upload media for a progress update
   * POST /api/therapist/updates/:id/media
   */
  uploadMedia(updateId: number, files: File[]): Observable<ProgressUpdateResponse> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('media', file);
    });
    return this.http.post<ProgressUpdateResponse>(`${this.therapistApiUrl}/updates/${updateId}/media`, formData);
  }

  /**
   * Publish a progress update
   * POST /api/therapist/updates/:id/publish
   */
  publishUpdate(updateId: number): Observable<ProgressUpdateResponse> {
    return this.http.post<ProgressUpdateResponse>(`${this.therapistApiUrl}/updates/${updateId}/publish`, {});
  }

  /**
   * Get progress updates for a child (therapist view)
   * GET /api/therapist/children/:id/updates
   */
  getChildUpdates(childId: number, page: number = 1, limit: number = 20, status?: string): Observable<ProgressUpdatesResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    
    if (status) {
      params = params.set('status', status);
    }

    return this.http.get<ProgressUpdatesResponse>(`${this.therapistApiUrl}/children/${childId}/updates`, { params });
  }

  /**
   * Get progress updates for a child (parent view - published only)
   * GET /api/parent/children/:id/progress-updates
   */
  getChildProgressUpdatesForParent(childId: number, page: number = 1, limit: number = 20): Observable<ProgressUpdatesResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<ProgressUpdatesResponse>(`${this.parentApiUrl}/children/${childId}/progress-updates`, { params });
  }
}

