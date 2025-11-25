export interface Booking {
  id?: number;
  parent_id?: number;
  child_id: number;
  booking_type: 'tour' | 'consultation' | 'centre_session' | 'online_session';
  mode: 'in_centre' | 'online';
  start_at: string; // ISO date string
  end_at?: string;
  location?: string;
  status?: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
  notes?: string;
  created_at?: string;
  
  // Joined fields
  child_name?: string;
  child_gender?: string;
  child_dob?: string;
}

export interface CreateBookingRequest {
  child_id: number;
  booking_type: string;
  mode: string;
  start_at: string;
  notes?: string;
}
