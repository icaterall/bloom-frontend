import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/services/auth.service';
import { LoginResponse } from '../../../shared/models/user.model';

@Component({
  selector: 'app-google-callback',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-[#fdf7ef]">
      <div class="bg-white rounded-xl shadow-md px-8 py-10 w-full max-w-md text-center">
        <div class="mb-4">
          <div class="h-10 w-10 mx-auto rounded-xl bg-primary flex items-center justify-center text-white font-semibold">
            B
          </div>
        </div>
        <h1 class="text-lg font-semibold text-gray-900 mb-2">
          Signing you in with Google...
        </h1>
        <p class="text-sm text-gray-600 mb-6">
          Please wait while we complete your login.
        </p>
        <div class="flex items-center justify-center">
          <svg
            class="animate-spin h-6 w-6 text-primary"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
      </div>
    </div>
  `
})
export class GoogleCallbackComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const code = this.route.snapshot.queryParamMap.get('code');
    const error = this.route.snapshot.queryParamMap.get('error');

    if (error || !code) {
      this.router.navigate(['/login'], {
        queryParams: { error: error || 'google_auth_failed' }
      });
      return;
    }

    const redirectUri = `${environment.frontendUrl}/auth/google/callback`;

    this.http
      .post<LoginResponse>(`${environment.apiUrl}/auth/google/callback`, {
        code,
        redirectUri
      })
      .subscribe({
        next: (response) => {
          if (response && response.success && response.data) {
            const { token, user } = response.data;
            if (token && user) {
              this.authService.completeExternalLogin(token, user);
              return;
            }
          }

          // Fallback: navigate back to login with an error
          this.router.navigate(['/login'], {
            queryParams: { error: 'google_auth_failed' }
          });
        },
        error: (err) => {
          console.error('Google callback error:', err);
          this.router.navigate(['/login'], {
            queryParams: { error: 'google_auth_failed' }
          });
        }
      });
  }
}
