import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-activate-account',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './activate-account.component.html',
  styleUrls: ['./activate-account.component.css']
})
export class ActivateAccountComponent implements OnInit {
  token: string = '';
  password: string = '';
  confirmPassword: string = '';
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';
  isValidatingToken = true;
  tokenValid = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    // Get token from query params
    this.route.queryParams.subscribe(params => {
      this.token = params['token'] || '';
      if (this.token) {
        this.validateToken();
      } else {
        this.isValidatingToken = false;
        this.errorMessage = 'Invalid activation link. No token provided.';
      }
    });
  }

  validateToken(): void {
    // For now, just assume token is valid if it exists
    // Backend will validate when we submit
    this.isValidatingToken = false;
    this.tokenValid = !!this.token;
    
    if (!this.tokenValid) {
      this.errorMessage = 'Invalid activation link.';
    }
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    // Validate passwords match
    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    // Validate password strength
    if (this.password.length < 8) {
      this.errorMessage = 'Password must be at least 8 characters long';
      return;
    }

    this.isSubmitting = true;

    // Call activation API
    this.http.post<any>(`${environment.apiUrl}/auth/activate`, {
      token: this.token,
      password: this.password
    }).subscribe({
      next: (response) => {
        if (response.success) {
          this.successMessage = 'Account activated successfully! Redirecting to dashboard...';
          
          // Store token and user data
          if (response.data?.token) {
            localStorage.setItem('bloom_auth_token', response.data.token);
            localStorage.setItem('bloom_auth_user', JSON.stringify(response.data.user));
          }

          // Redirect based on role after 2 seconds
          setTimeout(() => {
            const role = response.data?.user?.role;
            if (role === 'clinical_manager') {
              this.router.navigate(['/clinical-manager/dashboard']);
            } else if (role === 'therapist') {
              this.router.navigate(['/therapist/dashboard']);
            } else if (role === 'admin') {
              this.router.navigate(['/admin/dashboard']);
            } else if (role === 'parent') {
              this.router.navigate(['/parent/dashboard']);
            } else {
              this.router.navigate(['/']);
            }
          }, 2000);
        } else {
          this.errorMessage = response.message || 'Activation failed';
        }
        this.isSubmitting = false;
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'An error occurred during activation';
        this.isSubmitting = false;
      }
    });
  }

  isFormValid(): boolean {
    return !!(
      this.password &&
      this.confirmPassword &&
      this.password === this.confirmPassword &&
      this.password.length >= 8
    );
  }
}
