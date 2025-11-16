export interface User {
  id: number;
  name: string;
  email: string;
  mobile?: string;
  role: 'admin' | 'parent' | 'staff';
  is_active: boolean;
  email_verified: boolean;
  auth_provider: 'local' | 'google';
  google_id?: string;
  last_login_at?: string;
  created_at: string;
  updated_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: User;
  };
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data?: {
    user: User;
  };
}
