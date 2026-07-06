import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BookingService } from '../../../core/services/booking.service';
import { Booking } from '../../../shared/models/booking.model';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { StatusLabelPipe } from '../../../shared/pipes/status-label.pipe';
import { LucideAngularModule, ArrowLeft, Calendar, Clock, MapPin, Video, CreditCard } from 'lucide-angular';

@Component({
  selector: 'app-booking-details',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslatePipe, LucideAngularModule, StatusLabelPipe],
  templateUrl: './booking-details.component.html'
})
export class BookingDetailsComponent implements OnInit {
  booking: Booking | null = null;
  isLoading = false;
  bookingId: number | null = null;

  // Phase 4 — cancel / reschedule UI state
  actionMessage = '';
  actionError = '';
  isSubmitting = false;
  showReschedule = false;
  minDate = '';
  rsDate = '';
  rsTime = '';
  rsReason = '';
  availableTimes: string[] = [];
  slotsMessage = '';

  readonly ArrowLeftIcon = ArrowLeft;
  readonly CalendarIcon = Calendar;
  readonly ClockIcon = Clock;
  readonly MapPinIcon = MapPin;
  readonly VideoIcon = Video;
  readonly CreditCardIcon = CreditCard;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookingService: BookingService
  ) {}

  ngOnInit(): void {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    this.minDate = tomorrow.toISOString().split('T')[0];

    this.route.paramMap.subscribe(params => {
      const id = params.get('bookingId');
      if (id) {
        this.bookingId = parseInt(id, 10);
        this.loadBooking();
      }
    });
  }

  // ── Phase 4 helpers ──────────────────────────────────────────
  private terminal(): boolean {
    const s = this.booking?.status;
    return s === 'completed' || s === 'no_show' || s === 'cancelled';
  }

  get cancellationStatus(): string | null { return (this.booking as any)?.cancellation_status ?? null; }
  get rescheduleStatus(): string | null { return (this.booking as any)?.reschedule_status ?? null; }

  canCancel(): boolean {
    if (!this.booking) return false;
    if (this.terminal()) return false;
    if (this.booking.payment_status === 'refunded') return false;
    return this.cancellationStatus !== 'requested';
  }

  canReschedule(): boolean {
    if (!this.booking) return false;
    if (this.terminal()) return false;
    if (this.booking.payment_status === 'refunded') return false;
    return this.rescheduleStatus !== 'requested';
  }

  cancelBooking(): void {
    if (!this.bookingId || !confirm('Are you sure you want to cancel this booking?')) return;
    const reason = prompt('Reason for cancellation (optional):') || undefined;
    this.isSubmitting = true;
    this.actionError = '';
    this.bookingService.cancelBooking(this.bookingId, reason).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.actionMessage = res.message || 'Cancellation submitted.';
        this.loadBooking();
      },
      error: (err) => {
        this.isSubmitting = false;
        this.actionError = err?.error?.message || 'Failed to cancel booking.';
      }
    });
  }

  toggleReschedule(): void {
    this.showReschedule = !this.showReschedule;
    this.actionError = '';
    this.actionMessage = '';
    this.slotsMessage = '';
    this.availableTimes = [];
  }

  onRsDateChange(): void {
    this.rsTime = '';
    this.availableTimes = [];
    this.slotsMessage = '';
    if (!this.rsDate || !this.booking) return;
    this.bookingService.getAvailableSlots(this.rsDate, this.booking.booking_type, this.booking.child_id).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          if (!res.data.is_open) {
            this.slotsMessage = 'The centre is closed on this day. Choose another date.';
          } else {
            this.availableTimes = res.data.slots || [];
            if (!this.availableTimes.length) this.slotsMessage = 'No available times on this day.';
          }
        }
      },
      error: () => { this.slotsMessage = 'Could not load times; you may still submit a time.'; }
    });
  }

  submitReschedule(): void {
    if (!this.bookingId || !this.rsDate || !this.rsTime) {
      this.actionError = 'Please choose a new date and time.';
      return;
    }
    const startIso = new Date(`${this.rsDate}T${this.rsTime}`).toISOString();
    this.isSubmitting = true;
    this.actionError = '';
    this.bookingService.requestReschedule(this.bookingId, { preferred_start_at: startIso, reason: this.rsReason || undefined }).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.actionMessage = res.message || 'Reschedule requested.';
        this.showReschedule = false;
        this.loadBooking();
      },
      error: (err) => {
        this.isSubmitting = false;
        this.actionError = err?.error?.message || 'Failed to request reschedule.';
      }
    });
  }

  loadBooking(): void {
    if (!this.bookingId) return;
    
    this.isLoading = true;
    this.bookingService.getBookingById(this.bookingId).subscribe({
      next: (response) => {
        this.booking = response.data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading booking:', error);
        this.isLoading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/parent/home']);
  }
}

