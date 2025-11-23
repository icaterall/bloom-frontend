export interface Child {
  id?: number;
  parent_id?: number;
  full_name: string;
  date_of_birth: string;
  gender: 'male' | 'female' | 'other';
  primary_language?: string;
  other_languages?: string;
  diagnosis_status: 'autism' | 'gdd' | 'suspected' | 'none' | 'unknown';
  diagnosis_details?: string;
  school_status?: string;
  main_concerns?: string;
  family_goals?: string;
  child_status?: 'not_enrolled' | 'in_assessment' | 'enrolled' | 'on_waitlist';
  created_at?: string;
  updated_at?: string;
}

export interface ChildResponse {
  success: boolean;
  message?: string;
  data: Child | Child[];
}
