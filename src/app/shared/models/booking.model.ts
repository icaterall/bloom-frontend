export interface Booking {
  id?: number;
  parent_id?: number;
  child_id: number;
  booking_type: 'tour' | 'consultation' | 'centre_session' | 'online_session';
  mode: 'in_centre' | 'online';
  start_at?: string; // ISO date string (legacy)
  preferred_start_at?: string; // ISO date string
  preferred_end_at?: string; // ISO date string
  confirmed_start_at?: string; // ISO date string
  confirmed_end_at?: string; // ISO date string
  end_at?: string;
  location?: string;
  status?: 'pending' | 'awaiting_payment' | 'awaiting_cash_payment' | 'awaiting_clinical_review' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
  payment_method?: 'card' | 'online_banking' | 'cash';
  payment_status?: 'not_required' | 'unpaid' | 'pending' | 'paid' | 'failed' | 'refunded';
  payment_required?: boolean;
  price?: number;
  currency?: string;
  notes?: string;
  created_at?: string;
  
  // Joined fields
  child_name?: string;
  child_gender?: string;
  child_dob?: string;
  parent_name?: string;
  parent_email?: string;
  parent_mobile?: string;
  booking_type_name?: string;
  therapist_id?: number;
  therapist_name?: string;
  online_meeting_link?: string;
  therapist_response?: 'accepted' | 'rejected' | null;
  therapist_response_at?: string;
}

export interface CreateBookingRequest {
  child_id: number;
  booking_type: string;
  mode: string;
  preferred_start_at: string;
  preferred_end_at?: string;
  payment_method?: string | null;
  notes?: string | null;
}
