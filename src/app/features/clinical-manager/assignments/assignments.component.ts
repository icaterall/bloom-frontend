import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, User, Calendar, Clock, MapPin, DollarSign, CheckCircle, XCircle, UserPlus, AlertCircle } from 'lucide-angular';
import { AssignmentService, Booking, Therapist, AssignBookingRequest } from '../../../core/services/assignment.service';
import { TranslationService } from '../../../shared/services/translation.service';

@Component({
  selector: 'app-assignments',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule
  ],
  templateUrl: './assignments.component.html',
  styleUrls: ['./assignments.component.css']
})
export class AssignmentsComponent implements OnInit {
  bookings: Booking[] = [];
  isLoading = false;
  selectedBooking: Booking | null = null;
  availableTherapists: Therapist[] = [];
  isLoadingTherapists = false;
  showAssignModal = false;
  assignError: string | null = null;
  assignSuccess = false;
  isAssigning = false;

  // Assignment form
  selectedTherapistId: number | null = null;
  confirmedStartAt: string = '';
  confirmedEndAt: string = '';
  assignmentNotes: string = '';

  // Icons
  readonly UserIcon = User;
  readonly CalendarIcon = Calendar;
  readonly ClockIcon = Clock;
  readonly MapPinIcon = MapPin;
  readonly DollarSignIcon = DollarSign;
  readonly CheckCircleIcon = CheckCircle;
  readonly XCircleIcon = XCircle;
  readonly UserPlusIcon = UserPlus;
  readonly AlertCircleIcon = AlertCircle;

  constructor(
    private assignmentService: AssignmentService,
    private translationService: TranslationService
  ) {}

  ngOnInit(): void {
    this.loadPendingAssignments();
  }

  loadPendingAssignments(): void {
    this.isLoading = true;
    this.assignmentService.getPendingAssignments().subscribe({
      next: (response) => {
        if (response.success) {
          this.bookings = response.data;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading pending assignments:', error);
        this.isLoading = false;
      }
    });
  }

  openAssignModal(booking: Booking): void {
    this.selectedBooking = booking;
    this.selectedTherapistId = booking.therapist_id || null;
    
    // Convert ISO datetime to datetime-local format (YYYY-MM-DDTHH:mm)
    const startTime = booking.confirmed_start_at || booking.preferred_start_at;
    this.confirmedStartAt = startTime ? this.toDateTimeLocal(startTime) : '';
    
    const endTime = booking.confirmed_end_at || booking.preferred_end_at;
    this.confirmedEndAt = endTime ? this.toDateTimeLocal(endTime) : '';
    
    this.assignmentNotes = booking.notes || '';
    this.assignError = null;
    this.assignSuccess = false;
    this.showAssignModal = true;
    
    // Load available therapists
    this.loadAvailableTherapists();
  }

  toDateTimeLocal(isoString: string): string {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  fromDateTimeLocal(localString: string): string {
    if (!localString) return '';
    // Convert datetime-local to ISO string
    const date = new Date(localString);
    return date.toISOString();
  }

  closeAssignModal(): void {
    this.showAssignModal = false;
    this.selectedBooking = null;
    this.selectedTherapistId = null;
    this.availableTherapists = [];
    this.assignError = null;
    this.assignSuccess = false;
  }

  loadAvailableTherapists(): void {
    if (!this.selectedBooking) return;

    this.isLoadingTherapists = true;
    const startAt = this.confirmedStartAt ? this.fromDateTimeLocal(this.confirmedStartAt) : this.selectedBooking.preferred_start_at;
    const endAt = this.confirmedEndAt ? this.fromDateTimeLocal(this.confirmedEndAt) : this.selectedBooking.preferred_end_at;

    this.assignmentService.getAvailableTherapists(startAt, endAt, this.selectedBooking.id).subscribe({
      next: (response) => {
        if (response.success) {
          this.availableTherapists = response.data.therapists;
        }
        this.isLoadingTherapists = false;
      },
      error: (error) => {
        console.error('Error loading available therapists:', error);
        this.assignError = 'Failed to load available therapists';
        this.isLoadingTherapists = false;
      }
    });
  }

  onTimeChange(): void {
    // Reload available therapists when time changes
    if (this.selectedBooking && this.confirmedStartAt) {
      this.loadAvailableTherapists();
    }
  }

  assignBooking(): void {
    if (!this.selectedBooking || !this.selectedTherapistId) {
      this.assignError = 'Please select a therapist';
      return;
    }

    this.isAssigning = true;
    this.assignError = null;

    const request: AssignBookingRequest = {
      booking_id: this.selectedBooking.id,
      therapist_id: this.selectedTherapistId,
      confirmed_start_at: this.confirmedStartAt ? this.fromDateTimeLocal(this.confirmedStartAt) : undefined,
      confirmed_end_at: this.confirmedEndAt ? this.fromDateTimeLocal(this.confirmedEndAt) : undefined,
      notes: this.assignmentNotes.trim() || undefined
    };

    this.assignmentService.assignBooking(request).subscribe({
      next: (response) => {
        if (response.success) {
          this.assignSuccess = true;
          // Reload bookings after a delay
          setTimeout(() => {
            this.closeAssignModal();
            this.loadPendingAssignments();
          }, 2000);
        }
        this.isAssigning = false;
      },
      error: (error) => {
        console.error('Error assigning booking:', error);
        this.assignError = error.error?.message || 'Failed to assign booking. Please try again.';
        this.isAssigning = false;
      }
    });
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatCurrency(amount: number | undefined, currency: string = 'MYR'): string {
    if (amount === undefined || amount === null) return 'N/A';
    return new Intl.NumberFormat('en-MY', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'awaiting_clinical_review':
        return 'badge-warning';
      case 'confirmed':
        return 'badge-success';
      default:
        return 'badge-secondary';
    }
  }

  getStatusLabel(status: string): string {
    // Try to get translation from i18n
    const translationKey = `parentDashboard.childCard.bookingStatus.${status}`;
    const translated = this.translationService.translate(translationKey);
    
    // If translation found and different from key, return it
    if (translated && translated !== translationKey) {
      return translated;
    }
    
    // Fallback to formatted status
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
}

