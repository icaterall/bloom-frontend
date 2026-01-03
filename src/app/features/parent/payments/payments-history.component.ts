import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingService } from '../../../core/services/booking.service';
import { Booking } from '../../../shared/models/booking.model';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { LucideAngularModule, CreditCard, Calendar } from 'lucide-angular';

@Component({
  selector: 'app-payments-history',
  standalone: true,
  imports: [CommonModule, TranslatePipe, LucideAngularModule],
  templateUrl: './payments-history.component.html'
})
export class PaymentsHistoryComponent implements OnInit {
  bookings: Booking[] = [];
  isLoading = false;

  readonly CreditCardIcon = CreditCard;
  readonly CalendarIcon = Calendar;

  constructor(private bookingService: BookingService) {}

  ngOnInit(): void {
    this.loadPayments();
  }

  loadPayments(): void {
    this.isLoading = true;
    this.bookingService.getBookings().subscribe({
      next: (response) => {
        // Filter bookings with payments
        this.bookings = (response.data || []).filter(b => b.payment_status === 'paid');
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading payments:', error);
        this.isLoading = false;
      }
    });
  }
}

