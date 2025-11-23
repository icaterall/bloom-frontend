import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { LucideAngularModule, Mail, ArrowLeft, Send } from 'lucide-angular';
import { TranslationService } from '../../../shared/services/translation.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, LucideAngularModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent implements OnInit {
  forgotPasswordForm: FormGroup;
  loading = signal(false);
  success = signal(false);
  error = signal<string | null>(null);
  currentLanguage: 'en' | 'my' = 'en';
  
  // Icons
  MailIcon = Mail;
  ArrowLeftIcon = ArrowLeft;
  SendIcon = Send;
  
  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private translationService: TranslationService
  ) {
    this.forgotPasswordForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {
    this.translationService.currentLang$.subscribe(lang => {
      this.currentLanguage = lang as 'en' | 'my';
    });
  }

  toggleLanguage(): void {
    this.translationService.toggleLanguage();
  }
  
  onSubmit(): void {
    if (this.forgotPasswordForm.invalid) {
      Object.keys(this.forgotPasswordForm.controls).forEach(key => {
        const control = this.forgotPasswordForm.get(key);
        control?.markAsTouched();
      });
      return;
    }
    
    this.loading.set(true);
    this.error.set(null);
    this.success.set(false);
    
    const email = this.forgotPasswordForm.value.email;
    
    this.authService.forgotPassword(email).subscribe({
      next: (response) => {
        this.loading.set(false);
        if (response.success !== false) {
          this.success.set(true);
          this.forgotPasswordForm.reset();
        } else {
          this.error.set(response.message || 'Failed to send reset email');
        }
      },
      error: (err) => {
        this.loading.set(false);
        console.error('Forgot password error:', err);
        
        if (err.error && err.error.message) {
          this.error.set(err.error.message);
        } else if (err.status === 404) {
          this.error.set('Email not found in our system');
        } else if (err.status === 0) {
          this.error.set('Cannot connect to server. Please check your connection.');
        } else {
          this.error.set('An error occurred. Please try again.');
        }
      }
    });
  }
  
  // Getter for form control
  get email() {
    return this.forgotPasswordForm.get('email');
  }
}
