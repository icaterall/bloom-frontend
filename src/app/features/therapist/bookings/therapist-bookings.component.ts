import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TherapistBookingService } from '../../../core/services/therapist-booking.service';
import { Booking } from '../../../shared/models/booking.model';
import { LucideAngularModule, Calendar, Clock, User as UserIcon, Video, MapPin, CheckCircle, XCircle } from 'lucide-angular';

@Component({
  selector: 'app-therapist-bookings',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LucideAngularModule],
  templateUrl: './therapist-bookings.component.html',
  styleUrls: ['./therapist-bookings.component.css']
})
export class TherapistBookingsComponent implements OnInit {
  bookings: Booking[] = [];
  isLoading = false;
  errorMessage = '';

  // Warning modal state
  showWarningModal = false;
  warningAction: 'approve' | 'reject' | null = null;
  pendingBooking: Booking | null = null;

  // Approve modal state
  showApproveModal = false;
  selectedBooking: Booking | null = null;
  approveNotes = '';
  approveConfirmedStart = '';
  approveConfirmedEnd = '';
  approveGoogleMeetLink = '';
  approveError = '';
  isSubmittingApprove = false;

  // Reject modal state
  showRejectModal = false;
  rejectReason = '';
  isSubmittingReject = false;

  // Icons
  readonly CalendarIcon = Calendar;
  readonly ClockIcon = Clock;
  readonly UserIcon = UserIcon;
  readonly VideoIcon = Video;
  readonly MapPinIcon = MapPin;
  readonly CheckCircleIcon = CheckCircle;
  readonly XCircleIcon = XCircle;

  constructor(private bookingService: TherapistBookingService) {}

  ngOnInit(): void {
    this.loadBookings();
  }

  loadBookings(status?: string): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.bookingService.getMyBookings(status).subscribe({
      next: (response) => {
        if (response.success) {
          this.bookings = response.data;
        } else {
          this.errorMessage = 'Failed to load bookings.';
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading bookings:', error);
        this.errorMessage = 'Error loading bookings.';
        this.isLoading = false;
      }
    });
  }

  getStatusBadgeClasses(status: string | undefined): string {
    switch (status) {
      case 'awaiting_clinical_review':
        return 'bg-amber-100 text-amber-800';
      case 'confirmed':
        return 'bg-emerald-100 text-emerald-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
      case 'no_show':
        return 'bg-rose-100 text-rose-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  }

  canApprove(booking: Booking): boolean {
    // Can approve if status is confirmed AND therapist hasn't already accepted it
    if (booking.status !== 'confirmed') {
      return false;
    }
    // Check if therapist has already accepted
    // Check both therapist_response field and notes as fallback (for backward compatibility)
    const isAccepted = booking.therapist_response === 'accepted' || 
                       (booking.notes && booking.notes.includes('[Therapist Acceptance Notes]'));
    if (isAccepted) {
      return false;
    }
    return true;
  }

  canReject(booking: Booking): boolean {
    // Can reject if status is confirmed AND therapist hasn't already accepted it
    if (booking.status !== 'confirmed') {
      return false;
    }
    // Check if therapist has already accepted
    // Check both therapist_response field and notes as fallback (for backward compatibility)
    const isAccepted = booking.therapist_response === 'accepted' || 
                       (booking.notes && booking.notes.includes('[Therapist Acceptance Notes]'));
    if (isAccepted) {
      return false;
    }
    return true;
  }

  openApproveModal(booking: Booking): void {
    // Show warning modal first
    this.pendingBooking = booking;
    this.warningAction = 'approve';
    this.showWarningModal = true;
  }

  openApproveModalAfterWarning(): void {
    if (!this.pendingBooking) return;
    
    this.selectedBooking = this.pendingBooking;
    this.approveError = '';
    this.approveNotes = '';

    const startSource = this.pendingBooking.confirmed_start_at || this.pendingBooking.preferred_start_at;
    const endSource = this.pendingBooking.confirmed_end_at || this.pendingBooking.preferred_end_at;

    this.approveConfirmedStart = startSource ? this.toDateTimeLocal(startSource) : '';
    this.approveConfirmedEnd = endSource ? this.toDateTimeLocal(endSource) : '';
    this.approveGoogleMeetLink = this.pendingBooking.online_meeting_link || '';

    this.closeWarningModal();
    this.showApproveModal = true;
  }

  closeApproveModal(): void {
    this.showApproveModal = false;
    this.selectedBooking = null;
    this.approveNotes = '';
    this.approveConfirmedStart = '';
    this.approveConfirmedEnd = '';
    this.approveGoogleMeetLink = '';
    this.approveError = '';
    this.isSubmittingApprove = false;
  }

  submitApprove(): void {
    if (!this.selectedBooking) {
      return;
    }

    this.approveError = '';

    // For online sessions, require Google Meet link
    if (
      this.selectedBooking.mode === 'online' &&
      !this.approveGoogleMeetLink &&
      !this.selectedBooking.online_meeting_link
    ) {
      this.approveError = 'Google Meet link is required for online sessions.';
      return;
    }

    const payload: {
      notes?: string;
      confirmed_start_at?: string;
      confirmed_end_at?: string;
      google_meet_link?: string;
    } = {};

    if (this.approveNotes.trim()) {
      payload.notes = this.approveNotes.trim();
    }

    if (this.approveConfirmedStart) {
      payload.confirmed_start_at = new Date(this.approveConfirmedStart).toISOString();
    }

    if (this.approveConfirmedEnd) {
      payload.confirmed_end_at = new Date(this.approveConfirmedEnd).toISOString();
    }

    if (this.approveGoogleMeetLink.trim()) {
      payload.google_meet_link = this.approveGoogleMeetLink.trim();
    }

    this.isSubmittingApprove = true;

    this.bookingService.acceptBooking(this.selectedBooking.id!, payload).subscribe({
      next: (response) => {
        this.isSubmittingApprove = false;
        if (response.success && response.data) {
          // Update the booking in the list with the full booking object
          const updatedBooking = response.data;
          // Ensure therapist_response is set to 'accepted' if not already set
          if (!updatedBooking.therapist_response) {
            updatedBooking.therapist_response = 'accepted';
          }
          this.bookings = this.bookings.map((b) =>
            b.id === updatedBooking.id ? updatedBooking : b
          );
          this.closeApproveModal();
        } else {
          this.approveError = response.message || 'Failed to approve booking.';
        }
      },
      error: (error) => {
        console.error('Error approving booking:', error);
        this.isSubmittingApprove = false;
        this.approveError =
          error?.error?.message || 'Error approving booking. Please try again.';
      }
    });
  }

  openRejectModal(booking: Booking): void {
    // Show warning modal first
    this.pendingBooking = booking;
    this.warningAction = 'reject';
    this.showWarningModal = true;
  }

  openRejectModalAfterWarning(): void {
    if (!this.pendingBooking) return;
    
    this.selectedBooking = this.pendingBooking;
    this.rejectReason = '';
    this.isSubmittingReject = false;
    
    this.closeWarningModal();
    this.showRejectModal = true;
  }

  closeWarningModal(): void {
    this.showWarningModal = false;
    this.warningAction = null;
    this.pendingBooking = null;
  }

  closeRejectModal(): void {
    this.showRejectModal = false;
    this.selectedBooking = null;
    this.rejectReason = '';
    this.isSubmittingReject = false;
  }

  submitReject(): void {
    if (!this.selectedBooking) {
      return;
    }

    this.isSubmittingReject = true;

    this.bookingService.rejectBooking(this.selectedBooking.id!, this.rejectReason).subscribe({
      next: (response) => {
        this.isSubmittingReject = false;
        if (response.success) {
          // Remove or update the booking (it will go back to clinical review)
          this.bookings = this.bookings.filter((b) => b.id !== this.selectedBooking!.id);
          this.closeRejectModal();
        } else {
          // Keep simple for now; you can surface a toast here
          console.error('Failed to reject booking:', response.message);
        }
      },
      error: (error) => {
        console.error('Error rejecting booking:', error);
        this.isSubmittingReject = false;
      }
    });
  }

  formatDate(dateString: string | undefined | null): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString(undefined, {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getModeLabel(mode: string | undefined | null): string {
    if (!mode) return 'N/A';
    if (mode === 'online') return 'Online';
    if (mode === 'in_center' || mode === 'in_centre') return 'In Centre';
    return mode;
  }

  private toDateTimeLocal(dateString: string): string {
    const date = new Date(dateString);
    const pad = (n: number) => String(n).padStart(2, '0');
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }
}

