import { Component, OnInit, OnDestroy, signal, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { GoogleOAuthService } from '../../../core/services/google-oauth.service';
import { LucideAngularModule, Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-angular';
import { environment } from '../../../../environments/environment';
import { TranslationService } from '../../../shared/services/translation.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, LucideAngularModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {
  private readonly apiUrl = environment.apiUrl;
  private readonly platformId = inject(PLATFORM_ID);
  private readonly googleOAuth = inject(GoogleOAuthService);
  
  loginForm!: FormGroup;
  loading = signal(false);
  googleLoading = signal(false);
  error = signal<string | null>(null);
  showPassword = signal(false);
  returnUrl: string = '/';
  googleOAuthAvailable = false;
  currentLanguage: 'en' | 'my' = 'en';

  // Icons
  MailIcon = Mail;
  LockIcon = Lock;
  EyeIcon = Eye;
  EyeOffIcon = EyeOff;
  LogInIcon = LogIn;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private translationService: TranslationService
  ) {}

  ngOnInit(): void {
    this.translationService.currentLang$.subscribe(lang => {
      this.currentLanguage = lang as 'en' | 'my';
    });

    // Check if already logged in
    if (this.authService.isAuthenticatedUser()) {
      const user = this.authService.getCurrentUser();
      if (user) {
        this.navigateByRole(user.role);
      }
    }

    // Get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';

    // Initialize form
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    // Initialize Google OAuth in browser only
    if (isPlatformBrowser(this.platformId)) {
      this.initializeGoogleOAuth();
      this.setupGoogleEventListeners();
    }
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.cleanupGoogleEventListeners();
    }
  }

  private initializeGoogleOAuth(): void {
    this.googleOAuth.initializeGoogle()
      .then(() => {
        this.googleOAuthAvailable = true;
        console.log('Google OAuth initialized');
      })
      .catch(error => {
        console.error('Failed to initialize Google OAuth:', error);
        this.googleOAuthAvailable = false;
      });
  }

  private setupGoogleEventListeners(): void {
    window.addEventListener('google-login-started', this.onGoogleLoginStarted);
    window.addEventListener('google-login-success', this.onGoogleLoginSuccess);
    window.addEventListener('google-login-error', this.onGoogleLoginError);
  }

  private cleanupGoogleEventListeners(): void {
    window.removeEventListener('google-login-started', this.onGoogleLoginStarted);
    window.removeEventListener('google-login-success', this.onGoogleLoginSuccess);
    window.removeEventListener('google-login-error', this.onGoogleLoginError);
  }

  private onGoogleLoginStarted = (): void => {
    this.googleLoading.set(true);
  };

  private onGoogleLoginSuccess = (): void => {
    // Loading state will clear when we navigate away
    console.log('Google login successful');
  };

  private onGoogleLoginError = (): void => {
    this.googleLoading.set(false);
    this.error.set('Google login failed. Please try again.');
  };

  togglePasswordVisibility(): void {
    this.showPassword.update(v => !v);
  }

  toggleLanguage(): void {
    this.translationService.toggleLanguage();
  }

  onSubmit(): void {
    console.log('===== LOGIN FORM SUBMISSION DEBUG =====');
    console.log('1. Form valid:', this.loginForm.valid);
    console.log('2. Form errors:', this.loginForm.errors);
    
    if (this.loginForm.invalid) {
      console.log('3. Form is INVALID - showing validation errors');
      // Mark all fields as touched to show validation errors
      Object.keys(this.loginForm.controls).forEach(key => {
        const control = this.loginForm.get(key);
        console.log(`   Field '${key}':`, {
          value: control?.value,
          errors: control?.errors,
          touched: control?.touched
        });
        control?.markAsTouched();
      });
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const credentials = this.loginForm.value;
    console.log('3. Form is VALID - Submitting credentials:', {
      email: credentials.email,
      password: credentials.password ? `[PROVIDED - ${credentials.password.length} chars]` : '[NOT PROVIDED]'
    });

    this.authService.login(credentials).subscribe({
      next: (response) => {
        console.log('4. Login response received in component:', response);
        this.loading.set(false);
        if (response.success) {
          console.log('5. Login successful - navigation will be handled by AuthService');
          // Navigation is handled in AuthService
        } else {
          console.log('5. Login failed - showing error message:', response.message);
          this.error.set(response.message || 'Login failed');
        }
      },
      error: (err) => {
        this.loading.set(false);
        console.log('4. Login ERROR in component:', err);
        console.log('5. Error status:', err.status);
        console.log('6. Error message:', err.error?.message);
        
        if (err.error && err.error.message) {
          this.error.set(err.error.message);
        } else if (err.status === 401) {
          this.error.set('Invalid email or password');
        } else if (err.status === 0) {
          this.error.set('Cannot connect to server. Please check your connection.');
        } else {
          this.error.set('An error occurred during login. Please try again.');
        }
      }
    });
    console.log('===== END LOGIN FORM SUBMISSION DEBUG =====');
  }

  async onGoogleLogin(): Promise<void> {
    if (!this.googleOAuthAvailable || this.googleLoading()) {
      return;
    }

    try {
      await this.googleOAuth.loginWithGoogle();
      // Success/error handled by event listeners
    } catch (error) {
      console.error('Google login failed:', error);
      this.googleLoading.set(false);
      this.error.set('Google login failed. Please try again.');
    }
  }

  private navigateByRole(role: string): void {
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
        this.router.navigate([this.returnUrl]);
    }
  }

  // Getters for form controls
  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }
}
