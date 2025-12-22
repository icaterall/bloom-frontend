import { Injectable, signal, inject, Injector } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { User, LoginRequest, LoginResponse, AuthResponse, UpdateProfileRequest } from '../../shared/models/user.model';
import { environment } from '../../../environments/environment';
import { SocketService } from './socket.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'bloom_auth_token';
  private readonly USER_KEY = 'bloom_auth_user';
  private readonly API_URL = environment.apiUrl;
  
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  // Using signals for reactive state
  public isAuthenticated = signal<boolean>(false);
  public userRole = signal<string | null>(null);
  public profileComplete = signal<boolean>(true); // Default to true to avoid premature redirects

  private injector = inject(Injector);

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Try to recover session on app init
    console.log('[AuthService] Constructor called, initializing auth...');
    this.initializeAuth();
  }

  /**
   * Get SocketService lazily to avoid circular dependency
   */
  private getSocketService(): SocketService | null {
    try {
      return this.injector.get(SocketService, null);
    } catch {
      return null;
    }
  }

  /**
   * Initialize authentication state
   */
  private async initializeAuth(): Promise<void> {
    console.log('[AuthService] initializeAuth started');
    const token = this.getToken();
    console.log('[AuthService] Token exists:', !!token);
    if (!token) {
      console.log('[AuthService] No token, skipping initialization');
      return;
    }

    // 1) Try to restore user directly from localStorage (fast path)
    const storedUser = this.getStoredUser();
    console.log('[AuthService] Stored user exists:', !!storedUser);
    if (storedUser) {
      console.log('[AuthService] Restoring user from localStorage:', storedUser.email);
      this.setCurrentUser(storedUser);
      return;
    }

    // 2) Fallback: try to load from backend using the token
    await this.loadCurrentUser().toPromise().catch(() => {
      // If loading fails, clear auth state so we don't keep a broken session
      this.clearAuth();
    });
  }

  /**
   * Login with email and password
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    console.log('===== FRONTEND LOGIN DEBUG START =====');
    console.log('1. Frontend - Login URL:', `${this.API_URL}/auth/login`);
    console.log('2. Frontend - Credentials being sent:', {
      email: credentials.email,
      password: credentials.password ? `[PROVIDED - ${credentials.password.length} chars]` : '[NOT PROVIDED]'
    });
    
    return this.http.post<LoginResponse>(`${this.API_URL}/auth/login`, credentials)
      .pipe(
        tap((response) => {
          console.log('3. Frontend - Raw response received:', response);
          
          if (response.success && response.data) {
            console.log('4. Frontend - Login successful!');
            console.log('5. Frontend - User data:', response.data.user);
            console.log('6. Frontend - Token received:', response.data.token ? 'YES' : 'NO');
            
            // Store token
            this.setToken(response.data.token);
            
            // Update user state
            this.setCurrentUser(response.data.user);
            
            // Reconnect socket with new token (lazy injection to avoid circular dependency)
            const socketServiceInstance = this.getSocketService();
            if (socketServiceInstance) {
              socketServiceInstance.reconnect();
            }
            
            // Navigate based on role and profile completeness
            console.log('7. Frontend - Navigating to role-based dashboard:', response.data.user.role);
            console.log('8. Frontend - Profile complete:', response.data.user.profileComplete);
            this.navigateByRole(response.data.user.role, response.data.user.profileComplete);
          } else {
            console.log('4. Frontend - Login failed, response not successful');
            console.log('5. Frontend - Response message:', response.message);
          }
          console.log('===== FRONTEND LOGIN DEBUG END =====');
        }),
        catchError((error) => {
          console.log('3. Frontend - ERROR caught in catchError');
          console.log('4. Frontend - Error status:', error.status);
          console.log('5. Frontend - Error message:', error.error?.message);
          console.log('6. Frontend - Full error object:', error);
          console.log('===== FRONTEND LOGIN DEBUG END (ERROR) =====');
          
          // Return a properly formatted error response
          const errorResponse: LoginResponse = {
            success: false,
            message: error.error?.message || 'Login failed. Please check your credentials.',
            data: { token: '', user: null as any }
          };
          
          return of(errorResponse);
        })
      );
  }

  /**
   * Load current user from API
   */
  loadCurrentUser(): Observable<AuthResponse> {
    return this.http.get<AuthResponse>(`${this.API_URL}/auth/me`)
      .pipe(
        tap((response) => {
          if (response.success && response.data) {
            this.setCurrentUser(response.data.user);
          }
        }),
        catchError((error) => {
          console.error('Failed to load current user:', error);
          this.clearAuth();
          return of({ success: false, message: 'Failed to load user' });
        })
      );
  }

  /**
   * Register a new user
   */
  register(userData: { name: string; email: string; password: string; mobile?: string }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_URL}/auth/register`, userData)
      .pipe(
        tap((response) => {
          if (response.success && response.data) {
            // Store token
            this.setToken(response.data.token);
            
            // Update user state
            this.setCurrentUser(response.data.user);
            
            // Navigate to parent dashboard (default for new registrations)
            // Check profile completeness for new registrations too
            const profileComplete = response.data.user.profileComplete ?? true;
            if (!profileComplete) {
              this.router.navigate(['/parent/onboarding/profile']);
            } else {
              this.router.navigate(['/parent/dashboard']);
            }
          }
        })
      );
  }

  /**
   * Logout user
   */
  logout(): void {
    this.clearAuth();
    this.router.navigate(['/login']);
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticatedUser(): boolean {
    return !!this.getToken() && !!this.getCurrentUser();
  }

  /**
   * Check if user has specific role
   */
  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user ? user.role === role : false;
  }

  /**
   * Get stored token
   */
  getToken(): string | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }

  /**
   * Get stored user from localStorage (if any)
   */
  private getStoredUser(): User | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = localStorage.getItem(this.USER_KEY);
      if (!raw) {
        return null;
      }
      try {
        return JSON.parse(raw) as User;
      } catch {
        return null;
      }
    }
    return null;
  }

  /**
   * Set authentication token
   */
  private setToken(token: string): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(this.TOKEN_KEY, token);
    }
  }

  /**
   * Persist user in localStorage
   */
  private setStoredUser(user: User): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }
  }

  /**
   * Remove authentication token
   */
  private removeToken(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(this.TOKEN_KEY);
    }
  }

  /**
   * Remove stored user from localStorage
   */
  private removeStoredUser(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(this.USER_KEY);
    }
  }

  /**
   * Set current user
   */
  private setCurrentUser(user: User): void {
    this.currentUserSubject.next(user);
    this.isAuthenticated.set(true);
    this.userRole.set(user.role);
    this.profileComplete.set(user.profileComplete ?? true);
    this.setStoredUser(user);
  }

  /**
   * Clear authentication state
   */
  private clearAuth(): void {
    this.removeToken();
    this.removeStoredUser();
    this.currentUserSubject.next(null);
    this.isAuthenticated.set(false);
    this.userRole.set(null);
    this.profileComplete.set(true);
  }

  /**
   * Navigate based on user role and profile completeness
   */
  private navigateByRole(role: string, profileComplete: boolean = true): void {
    // For parents, check profile completeness first
    if (role === 'parent' && !profileComplete) {
      this.router.navigate(['/parent/onboarding/profile']);
      return;
    }

    // Normal navigation based on role
    switch (role) {
      case 'admin':
        this.router.navigate(['/admin/dashboard']);
        break;
      case 'parent':
        this.router.navigate(['/parent/dashboard']);
        break;
      case 'clinical_manager':
        this.router.navigate(['/clinical-manager/dashboard']);
        break;
      case 'therapist':
        this.router.navigate(['/therapist/dashboard']);
        break;
      case 'staff':
        this.router.navigate(['/staff/dashboard']);
        break;
      default:
        this.router.navigate(['/']);
    }
  }

  /**
   * Request password reset
   */
  forgotPassword(email: string): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/auth/forgot-password`, { 
      email,
      language: 'en' 
    });
  }

  /**
   * Validate reset token
   */
  validateResetToken(token: string): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/auth/validate-token/${token}`);
  }

  /**
   * Reset password with token
   */
  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/auth/reset-password`, {
      token,
      newPassword
    });
  }

  /**
   * Complete an external login (e.g. Google OAuth)
   * by storing the token and user, then navigating by role.
   */
  completeExternalLogin(token: string, user: User): void {
    // Reuse the existing private helpers so the behavior is
    // identical to a normal email/password login.
    this.setToken(token);
    this.setCurrentUser(user);
    const profileComplete = user.profileComplete ?? true;
    this.navigateByRole(user.role, profileComplete);
  }

  /**
   * Change password (for logged-in users)
   */
  changePassword(oldPassword: string, newPassword: string): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/auth/reset-password`, {
      oldPassword,
      newPassword
    });
  }

  /**
   * Update current user profile
   */
  updateProfile(profileData: UpdateProfileRequest): Observable<AuthResponse> {
    return this.http.patch<AuthResponse>(`${this.API_URL}/auth/me`, profileData)
      .pipe(
        tap((response) => {
          if (response.success && response.data) {
            // Update the current user state
            this.setCurrentUser(response.data.user);
          }
        })
      );
  }

  /**
   * Check if current user's profile is complete
   */
  isProfileComplete(): boolean {
    const user = this.getCurrentUser();
    return user ? (user.profileComplete ?? true) : true;
  }

  /**
   * Get missing profile fields for current user
   */
  getMissingFields(): string[] {
    const user = this.getCurrentUser();
    return user ? (user.missingFields ?? []) : [];
  }
}
