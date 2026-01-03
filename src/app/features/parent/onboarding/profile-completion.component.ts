import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-profile-completion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile-completion.component.html',
  styleUrls: ['./profile-completion.component.scss']
})
export class ProfileCompletionComponent implements OnInit {
  profileForm!: FormGroup;
  missingFields: string[] = [];
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Get current user data
    const currentUser = this.authService.getCurrentUser();
    
    if (!currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    // Check if profile is already complete
    if (currentUser.profileComplete) {
      this.router.navigate(['/parent/home']);
      return;
    }

    // Get missing fields
    this.missingFields = currentUser.missingFields || [];

    // Initialize form with current values
    this.profileForm = this.fb.group({
      name: [currentUser.name || '', [Validators.required, Validators.minLength(2)]],
      mobile: [currentUser.mobile || '', [Validators.required, Validators.pattern(/^\+?[1-9]\d{1,14}$/)]]
    });
  }

  get nameControl() {
    return this.profileForm.get('name');
  }

  get mobileControl() {
    return this.profileForm.get('mobile');
  }

  onSubmit(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const profileData = {
      name: this.profileForm.value.name,
      mobile: this.profileForm.value.mobile
    };

    this.authService.updateProfile(profileData).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          // Profile updated successfully
          // Check if profile is now complete
          if (response.data.user.profileComplete) {
            // Navigate to parent dashboard
            this.router.navigate(['/parent/home']);
          } else {
            // Still incomplete, show message
            this.errorMessage = 'Please fill in all required fields';
            this.missingFields = response.data.user.missingFields || [];
          }
        } else {
          this.errorMessage = response.message || 'Failed to update profile';
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Profile update error:', error);
        this.errorMessage = error.error?.message || 'An error occurred while updating your profile';
        this.isLoading = false;
      }
    });
  }

  hasError(controlName: string, errorType: string): boolean {
    const control = this.profileForm.get(controlName);
    return !!(control && control.hasError(errorType) && (control.dirty || control.touched));
  }
}
