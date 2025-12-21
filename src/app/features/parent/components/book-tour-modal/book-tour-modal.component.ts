import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideAngularModule, X, Calendar, Clock, MapPin, User, FileText } from 'lucide-angular';
import { Child } from '../../../../shared/models/child.model';
import { BookingService } from '../../../../core/services/booking.service';

@Component({
  selector: 'app-book-tour-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  templateUrl: './book-tour-modal.component.html'
})
export class BookTourModalComponent implements OnInit {
  @Input() children: Child[] = [];
  @Input() preSelectedChildId: number | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() bookingCreated = new EventEmitter<void>();

  bookingForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  minDate: string = '';

  // Icons
  XIcon = X;
  CalendarIcon = Calendar;
  ClockIcon = Clock;
  MapPinIcon = MapPin;
  UserIcon = User;
  FileTextIcon = FileText;

  constructor(
    private fb: FormBuilder,
    private bookingService: BookingService
  ) {
    this.bookingForm = this.fb.group({
      child_id: ['', Validators.required],
      booking_type: ['tour', Validators.required],
      date: ['', Validators.required],
      time: ['', Validators.required],
      notes: ['']
    });

    // Set min date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    this.minDate = tomorrow.toISOString().split('T')[0];
  }

  ngOnInit(): void {
    if (this.preSelectedChildId) {
      this.bookingForm.patchValue({ child_id: this.preSelectedChildId });
    } else if (this.children.length === 1) {
      this.bookingForm.patchValue({ child_id: this.children[0].id });
    }
  }

  onSubmit(): void {
    if (this.bookingForm.invalid) {
      this.bookingForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const formValue = this.bookingForm.value;
    
    // Combine date and time into ISO string
    const startAt = new Date(`${formValue.date}T${formValue.time}`).toISOString();

    const bookingData = {
      child_id: formValue.child_id,
      booking_type: formValue.booking_type,
      mode: 'in_centre', // Default for now
      preferred_start_at: startAt,
      notes: formValue.notes
    };

    this.bookingService.createBooking(bookingData).subscribe({
      next: () => {
        this.isLoading = false;
        this.bookingCreated.emit();
        this.close.emit();
      },
      error: (err) => {
        console.error('Booking error:', err);
        this.isLoading = false;
        this.errorMessage = 'Failed to create booking. Please try again.';
      }
    });
  }

  onClose(): void {
    this.close.emit();
  }
}
