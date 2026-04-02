import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Tour,
  TourStatus,
  TourListResponse,
  TourActionResponse,
} from '../../shared/models/tour.model';

@Injectable({
  providedIn: 'root',
})
export class ToursService {
  private readonly apiUrl = `${environment.apiUrl}/admin/tours`;

  constructor(private http: HttpClient) {}

  /**
   * Fetch every tour booking (booking_type = 'tour').
   * The backend filters & joins parent/child names automatically.
   */
  getTours(): Observable<TourListResponse> {
    return this.http.get<TourListResponse>(this.apiUrl);
  }

  /**
   * Advance a tour through the pipeline.
   *
   * @param id             Booking ID
   * @param status         Target status
   * @param confirmedDate  Required when moving to 'confirmed' — ISO-8601
   */
  updateStatus(
    id: number,
    status: TourStatus,
    confirmedDate?: string,
  ): Observable<TourActionResponse> {
    const body: Record<string, unknown> = { status };
    if (confirmedDate) {
      body['confirmed_start_at'] = confirmedDate;
    }
    return this.http.put<TourActionResponse>(
      `${this.apiUrl}/${id}/status`,
      body,
    );
  }

  /**
   * Persist an internal note against a tour booking.
   */
  addNote(id: number, note: string): Observable<TourActionResponse> {
    return this.http.post<TourActionResponse>(
      `${this.apiUrl}/${id}/add-note`,
      { notes: note },
    );
  }
}
