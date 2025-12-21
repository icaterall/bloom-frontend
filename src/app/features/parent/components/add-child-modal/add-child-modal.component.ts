import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { ChildService } from '../../../../core/services/child.service';
import { LucideAngularModule, X, AlertCircle, Calendar } from 'lucide-angular';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, provideNativeDateAdapter } from '@angular/material/core';
import { Child } from '../../../../shared/models/child.model';

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
export class AddChildModalComponent implements OnChanges {
  @Input() child: Child | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() childAdded = new EventEmitter<void>();
  @Output() childUpdated = new EventEmitter<void>();

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

    this.resetForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['child']) {
      this.setFormValues(this.child);
    }
  }

  get isEditMode(): boolean {
    return !!this.child?.id;
  }

  onSubmit(): void {
    if (this.childForm.invalid) {
      this.childForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const payload = this.preparePayload();
    const request$ = this.isEditMode && this.child?.id
      ? this.childService.updateChild(this.child.id, payload)
      : this.childService.createChild(payload);

    request$.subscribe({
      next: (response) => {
        if (response.success) {
          if (this.isEditMode) {
            this.childUpdated.emit();
          } else {
            this.childAdded.emit();
          }
          this.close.emit();
        } else {
          this.errorMessage = response.message || (this.isEditMode ? 'Failed to update child' : 'Failed to add child');
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error saving child:', error);
        this.errorMessage = error.error?.message || 'An error occurred while saving child information';
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

  private preparePayload(): any {
    const formValue = { ...this.childForm.value };

    if (formValue.date_of_birth instanceof Date) {
      const d = formValue.date_of_birth;
      const month = '' + (d.getMonth() + 1);
      const day = '' + d.getDate();
      const year = d.getFullYear();

      formValue.date_of_birth = [year, month.padStart(2, '0'), day.padStart(2, '0')].join('-');
    }

    return formValue;
  }

  private resetForm(): void {
    this.childForm.reset({
      full_name: '',
      date_of_birth: '',
      gender: '',
      primary_language: '',
      diagnosis_status: 'unknown',
      diagnosis_details: '',
      main_concerns: ''
    });
  }

  private setFormValues(child: Child | null): void {
    if (!child) {
      this.resetForm();
      return;
    }

    this.childForm.reset({
      full_name: child.full_name || '',
      date_of_birth: child.date_of_birth ? new Date(child.date_of_birth) : '',
      gender: child.gender || '',
      primary_language: child.primary_language || '',
      diagnosis_status: child.diagnosis_status || 'unknown',
      diagnosis_details: child.diagnosis_details || '',
      main_concerns: child.main_concerns || ''
    });
  }
}
