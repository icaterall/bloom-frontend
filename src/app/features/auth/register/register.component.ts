import { Component, OnInit, OnDestroy, signal, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { LucideAngularModule, User, Mail, Lock, Phone, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-angular';
import { AuthService } from '../../../core/services/auth.service';
import { GoogleOAuthService } from '../../../core/services/google-oauth.service';
import { TranslationService } from '../../../shared/services/translation.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, LucideAngularModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly googleOAuth = inject(GoogleOAuthService);

  registerForm: FormGroup;
  loading = signal<boolean>(false);
  googleLoading = signal<boolean>(false);
  error = signal<string | null>(null);
  showPassword = signal<boolean>(false);
  googleOAuthAvailable = false;

  // Icons
  readonly UserIcon = User;
  readonly MailIcon = Mail;
  readonly LockIcon = Lock;
  readonly PhoneIcon = Phone;
  readonly ArrowRightIcon = ArrowRight;
  readonly LoaderIcon = Loader2;
  readonly EyeIcon = Eye;
  readonly EyeOffIcon = EyeOff;

  currentLanguage = 'my';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    public translationService: TranslationService
  ) {
    this.translationService.currentLang$.subscribe(lang => {
      this.currentLanguage = lang;
    });

    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      mobile: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.googleOAuth.initializeGoogle()
        .then(() => { this.googleOAuthAvailable = true; })
        .catch(() => { this.googleOAuthAvailable = false; });
      this.setupGoogleEventListeners();
    }
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.cleanupGoogleEventListeners();
    }
  }

  private setupGoogleEventListeners(): void {
    window.addEventListener('google-login-started', this.onGoogleStarted);
    window.addEventListener('google-login-success', this.onGoogleSuccess);
    window.addEventListener('google-login-error', this.onGoogleError);
  }

  private cleanupGoogleEventListeners(): void {
    window.removeEventListener('google-login-started', this.onGoogleStarted);
    window.removeEventListener('google-login-success', this.onGoogleSuccess);
    window.removeEventListener('google-login-error', this.onGoogleError);
  }

  private onGoogleStarted = (): void => { this.googleLoading.set(true); };
  private onGoogleSuccess = (): void => {};
  private onGoogleError = (): void => {
    this.googleLoading.set(false);
    this.error.set('Google sign-up failed. Please try again.');
  };

  async onGoogleSignup(): Promise<void> {
    if (!this.googleOAuthAvailable || this.googleLoading()) return;
    try {
      await this.googleOAuth.loginWithGoogle();
    } catch {
      this.googleLoading.set(false);
      this.error.set('Google sign-up failed. Please try again.');
    }
  }

  togglePasswordVisibility() {
    this.showPassword.update(v => !v);
  }

  toggleLanguage() {
    this.translationService.toggleLanguage();
  }

  onSubmit() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const { name, email, password, mobile } = this.registerForm.value;

    this.authService.register({ name, email, password, mobile }).subscribe({
      next: () => {
        this.loading.set(false);
        // Navigation handled in auth service
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.message || 'Registration failed. Please try again.');
      }
    });
  }

  // Getters for template
  get name() { return this.registerForm.get('name'); }
  get email() { return this.registerForm.get('email'); }
  get password() { return this.registerForm.get('password'); }
  get mobile() { return this.registerForm.get('mobile'); }
}
