import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { User, LoginRequest, LoginResponse, AuthResponse } from '../../shared/models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'bloom_auth_token';
  private readonly API_URL = environment.apiUrl;
  
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  // Using signals for reactive state
  public isAuthenticated = signal<boolean>(false);
  public userRole = signal<string | null>(null);

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Try to recover session on app init
    this.initializeAuth();
  }

  /**
   * Initialize authentication state
   */
  private async initializeAuth(): Promise<void> {
    const token = this.getToken();
    if (token) {
      // Try to load user from token
      await this.loadCurrentUser().toPromise().catch(() => {
        // If loading fails, clear auth state
        this.clearAuth();
      });
    }
  }

  /**
   * Login with email and password
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    console.log('Attempting login to:', `${this.API_URL}/auth/login`);
    
    return this.http.post<LoginResponse>(`${this.API_URL}/auth/login`, credentials)
      .pipe(
        tap((response) => {
          console.log('Login response:', response);
          
          if (response.success && response.data) {
            // Store token
            this.setToken(response.data.token);
            
            // Update user state
            this.setCurrentUser(response.data.user);
            
            // Navigate based on role
            this.navigateByRole(response.data.user.role);
          }
        }),
        catchError((error) => {
          console.error('Login error:', error);
          
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
            this.router.navigate(['/parent/dashboard']);
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
   * Set authentication token
   */
  private setToken(token: string): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(this.TOKEN_KEY, token);
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
   * Set current user
   */
  private setCurrentUser(user: User): void {
    this.currentUserSubject.next(user);
    this.isAuthenticated.set(true);
    this.userRole.set(user.role);
  }

  /**
   * Clear authentication state
   */
  private clearAuth(): void {
    this.removeToken();
    this.currentUserSubject.next(null);
    this.isAuthenticated.set(false);
    this.userRole.set(null);
  }

  /**
   * Navigate based on user role
   */
  private navigateByRole(role: string): void {
    switch (role) {
      case 'admin':
        this.router.navigate(['/admin/dashboard']);
        break;
      case 'parent':
        this.router.navigate(['/parent/dashboard']);
        break;
      case 'staff':
        this.router.navigate(['/staff/dashboard']);
        break;
      default:
        this.router.navigate(['/']);
    }
  }
}
