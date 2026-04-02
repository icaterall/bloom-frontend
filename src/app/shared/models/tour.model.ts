/**
 * Tour / Centre-Visit booking model.
 * Maps to rows in the `bookings` table where booking_type = 'tour'.
 */
export type TourStatus = 'pending' | 'confirmed' | 'completed' | 'no_show';

export interface Tour {
  id: number;
  parent_name: string;
  parent_email?: string;
  parent_mobile: string;
  child_name?: string;
  preferred_start_at: string;   // ISO-8601
  confirmed_start_at?: string;  // ISO-8601, set once scheduled
  status: TourStatus;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface TourListResponse {
  success: boolean;
  data: Tour[];
}

export interface TourActionResponse {
  success: boolean;
  message: string;
  data: Tour;
}
