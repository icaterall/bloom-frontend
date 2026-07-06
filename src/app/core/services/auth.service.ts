import { Injectable, inject, Injector } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import {
  User,
  LoginRequest,
  LoginResponse,
  AuthResponse,
  UpdateProfileRequest,
} from '../../shared/models/user.model';
import { environment } from '../../../environments/environment';
import { SocketService } from './socket.service';
import { AppStore } from '../state/app.store';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'bloom_auth_token';
  private readonly REFRESH_TOKEN_KEY = 'bloom_refresh_token';
  private readonly USER_KEY  = 'bloom_auth_user';
  private readonly API_URL   = environment.apiUrl;

  private readonly store    = inject(AppStore);
  private readonly injector = inject(Injector);

  // Keep the BehaviorSubject for components that still subscribe via RxJS
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public  currentUser$       = this.currentUserSubject.asObservable();

  // ── Facade signals (delegate to AppStore) ────────
  /** @deprecated — prefer injecting AppStore directly */
  get isAuthenticated()  { return this.store.isAuthenticated; }
  /** @deprecated — prefer injecting AppStore directly */
  get userRole()         { return this.store.role; }
  /** @deprecated — prefer injecting AppStore directly */
  get profileComplete()  { return this.store.profileComplete; }

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {
    this.initializeAuth();
  }

  // ── Lazy SocketService to break circular DI ──────
  private getSocketService(): SocketService | null {
    try {
      return this.injector.get(SocketService, null);
    } catch {
      return null;
    }
  }

  // ── Initialisation ────────────────────────────────

  private async initializeAuth(): Promise<void> {
    const token = this.getToken();
    if (!token) {
      this.store.setAuthInitialised();
      return;
    }

    // Fast path: restore from localStorage
    const storedUser = this.getStoredUser();
    if (storedUser) {
      this.setCurrentUser(storedUser);
      this.store.setAuthInitialised();
      return;
    }

    // Slow path: verify against backend
    await this.loadCurrentUser()
      .toPromise()
      .catch(() => this.clearAuth());

    this.store.setAuthInitialised();
  }

  // ── Auth operations ───────────────────────────────

  login(credentials: LoginRequest, returnUrl?: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.API_URL}/auth/login`, credentials)
      .pipe(
        tap(response => {
          if (response.success && response.data) {
            this.setToken(response.data.token);
            if ((response.data as any).refreshToken) {
              this.setRefreshToken((response.data as any).refreshToken);
            }
            this.setCurrentUser(response.data.user);

            const socketService = this.getSocketService();
            if (socketService) socketService.reconnect();

            // A safe internal returnUrl (e.g. the payment confirmation page
            // the user was bounced off) wins over the role dashboard —
            // except for parents who still need to complete onboarding.
            const profileOk = response.data.user.profileComplete ?? true;
            if (
              returnUrl &&
              returnUrl.startsWith('/') &&
              !returnUrl.startsWith('//') &&
              !returnUrl.startsWith('/login') &&
              returnUrl !== '/' &&
              (response.data.user.role !== 'parent' || profileOk)
            ) {
              this.router.navigateByUrl(returnUrl);
            } else {
              this.navigateByRole(
                response.data.user.role,
                response.data.user.profileComplete,
              );
            }
          }
        }),
        catchError(error => {
          const errorResponse: LoginResponse = {
            success: false,
            message:
              error.error?.message ||
              'Login failed. Please check your credentials.',
            data: { token: '', user: null as any },
          };
          return of(errorResponse);
        }),
      );
  }

  loadCurrentUser(): Observable<AuthResponse> {
    return this.http.get<AuthResponse>(`${this.API_URL}/auth/me`).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.setCurrentUser(response.data.user);
        }
      }),
      catchError(error => {
        console.error('Failed to load current user:', error);
        this.clearAuth();
        return of({ success: false, message: 'Failed to load user' });
      }),
    );
  }

  register(
    userData: { name: string; email: string; password: string; mobile?: string },
  ): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.API_URL}/auth/register`, userData)
      .pipe(
        tap(response => {
          if (response.success && response.data) {
            this.setToken(response.data.token);
            this.setCurrentUser(response.data.user);
            const profileOk = response.data.user.profileComplete ?? true;
            if (!profileOk) {
              this.router.navigate(['/parent/onboarding/profile']);
            } else {
              this.router.navigate(['/parent/home']);
            }
          }
        }),
      );
  }

  /**
   * Token refresh is intentionally a no-op.
   *
   * The backend issues a single short-lived access token and does NOT expose a
   * /auth/refresh-token endpoint. Calling a non-existent endpoint produced a
   * confusing failure path, so on token expiry the interceptor logs the user
   * out instead. This method always resolves to `false`.
   */
  refreshToken(): Observable<boolean> {
    return of(false);
  }

  logout(returnUrl?: string): void {
    const socketService = this.getSocketService();
    if (socketService) socketService.disconnect();
    this.clearAuth();
    // Only carry a meaningful returnUrl (not /login itself or the root).
    if (returnUrl && returnUrl !== '/' && !returnUrl.startsWith('/login')) {
      this.router.navigate(['/login'], { queryParams: { returnUrl } });
    } else {
      this.router.navigate(['/login']);
    }
  }

  completeExternalLogin(token: string, user: User): void {
    this.setToken(token);
    this.setCurrentUser(user);
    this.navigateByRole(user.role, user.profileComplete ?? true);
  }

  // ── Profile operations ────────────────────────────

  updateProfile(profileData: UpdateProfileRequest): Observable<AuthResponse> {
    return this.http
      .patch<AuthResponse>(`${this.API_URL}/auth/me`, profileData)
      .pipe(
        tap(response => {
          if (response.success && response.data) {
            this.setCurrentUser(response.data.user);
          }
        }),
      );
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.API_URL}/auth/forgot-password`, {
      email,
      language: 'en',
    });
  }

  validateResetToken(token: string): Observable<any> {
    return this.http.get(`${this.API_URL}/auth/validate-token/${token}`);
  }

  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.API_URL}/auth/reset-password`, {
      token,
      newPassword,
    });
  }

  changePassword(oldPassword: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.API_URL}/auth/reset-password`, {
      oldPassword,
      newPassword,
    });
  }

  // ── Accessors ─────────────────────────────────────

  getCurrentUser(): User | null {
    return this.store.user();
  }

  isAuthenticatedUser(): boolean {
    return !!this.getToken() && !!this.getCurrentUser();
  }

  hasRole(role: string): boolean {
    return this.store.role() === role;
  }

  isProfileComplete(): boolean {
    return this.store.profileComplete();
  }

  getMissingFields(): string[] {
    const user = this.store.user();
    return user?.missingFields ?? [];
  }

  // ── Token management ──────────────────────────────

  getToken(): string | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }

  getRefreshToken(): string | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem(this.REFRESH_TOKEN_KEY);
    }
    return null;
  }

  // ── Private helpers ───────────────────────────────

  private getStoredUser(): User | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = localStorage.getItem(this.USER_KEY);
      if (!raw) return null;
      try { return JSON.parse(raw) as User; } catch { return null; }
    }
    return null;
  }

  private setToken(token: string): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(this.TOKEN_KEY, token);
    }
  }

  private setRefreshToken(token: string): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
    }
  }

  private setStoredUser(user: User): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }
  }

  private removeToken(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    }
  }

  private removeStoredUser(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(this.USER_KEY);
    }
  }

  private setCurrentUser(user: User): void {
    // Update AppStore (single source of truth)
    this.store.setUser(user);
    // Keep BehaviorSubject in sync for legacy subscribers
    this.currentUserSubject.next(user);
    // Persist to localStorage
    this.setStoredUser(user);
  }

  private clearAuth(): void {
    this.removeToken();
    this.removeStoredUser();
    this.store.clearUser();
    this.currentUserSubject.next(null);
  }

  private navigateByRole(role: string, profileComplete = true): void {
    if (role === 'parent' && !profileComplete) {
      this.router.navigate(['/parent/onboarding/profile']);
      return;
    }
    const dashboards: Record<string, string> = {
      admin: '/admin/dashboard',
      parent: '/parent/home',
      clinical_manager: '/clinical-manager/dashboard',
      therapist: '/therapist/dashboard',
      finance: '/finance/dashboard',
      // NOTE: there is no staff portal yet — staff falls through to '/' below.
    };
    this.router.navigate([dashboards[role] ?? '/']);
  }
}
