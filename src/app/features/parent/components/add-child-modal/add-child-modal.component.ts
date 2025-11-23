import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { ChildService } from '../../../../core/services/child.service';
import { LucideAngularModule, X, AlertCircle, Calendar } from 'lucide-angular';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, provideNativeDateAdapter } from '@angular/material/core';

// Custom validator for minimum age (in months)
export function minimumAgeValidator(minMonths: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null; // Required validator handles empty values
    }
    const birthDate = new Date(control.value);
    const today = new Date();
    const minAgeDate = new Date(today.getFullYear(), today.getMonth() - minMonths, today.getDate());

    // If birthDate is after the minAgeDate, the child is too young (born after the cutoff)
    return birthDate > minAgeDate ? { minimumAge: { requiredAge: minMonths } } : null;
  };
}

@Component({
  selector: 'app-add-child-modal',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    LucideAngularModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './add-child-modal.component.html',
  styleUrls: ['./add-child-modal.component.scss']
})
export class AddChildModalComponent {
  @Output() close = new EventEmitter<void>();
  @Output() childAdded = new EventEmitter<void>();

  childForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  
  // Icons
  XIcon = X;
  AlertCircleIcon = AlertCircle;
  CalendarIcon = Calendar;

  languages = [
    'English',
    'Malay',
    'Mandarin',
    'Tamil',
    'Arabic',
    'Cantonese',
    'Hokkien',
    'Other'
  ];

  constructor(
    private fb: FormBuilder,
    private childService: ChildService
  ) {
    this.childForm = this.fb.group({
      full_name: ['', [Validators.required, Validators.minLength(2)]],
      date_of_birth: ['', [Validators.required, minimumAgeValidator(6)]],
      gender: ['', Validators.required],
      primary_language: ['', Validators.required],
      diagnosis_status: ['unknown', Validators.required],
      diagnosis_details: [''],
      main_concerns: ['']
    });
  }

  onSubmit(): void {
    if (this.childForm.invalid) {
      this.childForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    // Convert date object to string if necessary (MatDatepicker returns Date object)
    const formValue = { ...this.childForm.value };
    if (formValue.date_of_birth instanceof Date) {
      // Format to YYYY-MM-DD to match backend expectation
      const d = formValue.date_of_birth;
      const month = '' + (d.getMonth() + 1);
      const day = '' + d.getDate();
      const year = d.getFullYear();

      formValue.date_of_birth = [year, month.padStart(2, '0'), day.padStart(2, '0')].join('-');
    }

    this.childService.createChild(formValue).subscribe({
      next: (response) => {
        if (response.success) {
          this.childAdded.emit();
          this.close.emit();
        } else {
          this.errorMessage = response.message || 'Failed to add child';
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error adding child:', error);
        this.errorMessage = error.error?.message || 'An error occurred while adding child';
        this.isLoading = false;
      }
    });
  }

  onClose(): void {
    this.close.emit();
  }

  hasError(controlName: string, errorType: string): boolean {
    const control = this.childForm.get(controlName);
    return !!(control && control.hasError(errorType) && (control.dirty || control.touched));
  }
}
