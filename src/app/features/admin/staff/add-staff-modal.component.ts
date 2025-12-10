import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StaffService, CreateStaffRequest } from '../../../core/services/staff.service';

@Component({
  selector: 'app-add-staff-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-staff-modal.component.html',
  styleUrls: ['./add-staff-modal.component.css']
})
export class AddStaffModalComponent {
  @Output() close = new EventEmitter<void>();
  @Output() staffAdded = new EventEmitter<void>();

  staffData: CreateStaffRequest = {
    name: '',
    email: '',
    mobile: '',
    role: 'therapist',
    preferred_language: 'en'
  };

  isSubmitting = false;
  errorMessage = '';

  constructor(private staffService: StaffService) {}

  onSubmit(): void {
    this.errorMessage = '';
    this.isSubmitting = true;

    this.staffService.createStaff(this.staffData).subscribe({
      next: (response) => {
        if (response.success) {
          this.staffAdded.emit();
        } else {
          this.errorMessage = response.message || 'Failed to create staff member';
        }
        this.isSubmitting = false;
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'An error occurred while creating staff member';
        this.isSubmitting = false;
      }
    });
  }

  onClose(): void {
    this.close.emit();
  }

  isFormValid(): boolean {
    return !!(
      this.staffData.name &&
      this.staffData.email &&
      this.staffData.role
    );
  }
}
