import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { LucideAngularModule, Lock, Eye, EyeOff, KeyRound, CheckCircle } from 'lucide-angular';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, LucideAngularModule],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm: FormGroup;
  loading = signal(false);
  validating = signal(true);
  tokenValid = signal(false);
  success = signal(false);
  error = signal<string | null>(null);
  showPassword = signal(false);
  showConfirmPassword = signal(false);
  token: string = '';
  
  // Icons
  LockIcon = Lock;
  EyeIcon = Eye;
  EyeOffIcon = EyeOff;
  KeyRoundIcon = KeyRound;
  CheckCircleIcon = CheckCircle;
  
  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.resetPasswordForm = this.formBuilder.group({
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }
  
  ngOnInit(): void {
    // Get token from URL
    this.token = this.route.snapshot.paramMap.get('token') || '';
    
    if (!this.token) {
      this.error.set('Invalid or missing reset token');
      this.validating.set(false);
      return;
    }
    
    // Validate token
    this.validateToken();
  }
  
  validateToken(): void {
    this.authService.validateResetToken(this.token).subscribe({
      next: (response: any) => {
        this.validating.set(false);
        this.tokenValid.set(true);
      },
      error: (err: any) => {
        this.validating.set(false);
        this.tokenValid.set(false);
        if (err.error && err.error.message) {
          this.error.set(err.error.message);
        } else {
          this.error.set('Invalid or expired reset token');
        }
      }
    });
  }
  
  passwordMatchValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    
    if (!password || !confirmPassword) {
      return null;
    }
    
    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  }
  
  togglePasswordVisibility(): void {
    this.showPassword.update(v => !v);
  }
  
  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword.update(v => !v);
  }
  
  onSubmit(): void {
    if (this.resetPasswordForm.invalid) {
      Object.keys(this.resetPasswordForm.controls).forEach(key => {
        const control = this.resetPasswordForm.get(key);
        control?.markAsTouched();
      });
      return;
    }
    
    this.loading.set(true);
    this.error.set(null);
    
    const newPassword = this.resetPasswordForm.value.password;
    
    this.authService.resetPassword(this.token, newPassword).subscribe({
      next: (response: any) => {
        this.loading.set(false);
        this.success.set(true);
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      },
      error: (err: any) => {
        this.loading.set(false);
        console.error('Reset password error:', err);
        
        if (err.error && err.error.message) {
          this.error.set(err.error.message);
        } else {
          this.error.set('Failed to reset password. Please try again.');
        }
      }
    });
  }
  
  // Getters for form controls
  get password() {
    return this.resetPasswordForm.get('password');
  }
  
  get confirmPassword() {
    return this.resetPasswordForm.get('confirmPassword');
  }
}
