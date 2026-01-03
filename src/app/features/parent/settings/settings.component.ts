import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { LucideAngularModule, Save, User, Mail, Phone, Globe } from 'lucide-angular';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule, TranslatePipe],
  templateUrl: './settings.component.html'
})
export class SettingsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  settingsForm: FormGroup;
  isLoading = false;
  successMessage = '';
  errorMessage = '';

  // Icons
  readonly SaveIcon = Save;
  readonly UserIcon = User;
  readonly MailIcon = Mail;
  readonly PhoneIcon = Phone;
  readonly GlobeIcon = Globe;

  constructor() {
    this.settingsForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: [{ value: '', disabled: true }],
      mobile: ['', [Validators.pattern('^[0-9+\\-\\s]*$')]],
      preferred_language: ['en']
    });
  }

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.settingsForm.patchValue({
        name: user.name,
        email: user.email,
        mobile: user.mobile || '',
        preferred_language: user.preferred_language || 'en'
      });
    }
  }

  onSubmit(): void {
    if (this.settingsForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';

    const formValue = this.settingsForm.getRawValue();
    const updateData = {
      name: formValue.name,
      mobile: formValue.mobile,
      preferred_language: formValue.preferred_language
    };

    this.authService.updateProfile(updateData).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.successMessage = 'settings.profileUpdated';
          setTimeout(() => this.successMessage = '', 3000);
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'settings.updateFailed';
      }
    });
  }
}
