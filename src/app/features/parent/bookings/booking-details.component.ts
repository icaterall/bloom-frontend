import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BookingService } from '../../../core/services/booking.service';
import { Booking } from '../../../shared/models/booking.model';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { LucideAngularModule, ArrowLeft, Calendar, Clock, MapPin, Video, CreditCard } from 'lucide-angular';

@Component({
  selector: 'app-booking-details',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe, LucideAngularModule],
  templateUrl: './booking-details.component.html'
})
export class BookingDetailsComponent implements OnInit {
  booking: Booking | null = null;
  isLoading = false;
  bookingId: number | null = null;

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
    this.route.paramMap.subscribe(params => {
      const id = params.get('bookingId');
      if (id) {
        this.bookingId = parseInt(id, 10);
        this.loadBooking();
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

