import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, AlertCircle, Search, User, Mail, Phone, Calendar, DollarSign, XCircle, Eye, RefreshCw } from 'lucide-angular';
import { BookingService } from '../../../core/services/booking.service';
import { Booking } from '../../../shared/models/booking.model';

interface FailedBooking extends Booking {
  parent_name?: string;
  parent_email?: string;
  parent_mobile?: string;
  booking_type_name?: string;
  provider_payment_id?: string;
  provider_order_id?: string;
  payment_created_at?: string;
  payment_updated_at?: string;
}

interface FailedBookingsResponse {
  success: boolean;
  data: FailedBooking[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

@Component({
  selector: 'app-failed-bookings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    LucideAngularModule
  ],
  templateUrl: './failed-bookings.component.html',
  styleUrls: ['./failed-bookings.component.css']
})
export class FailedBookingsComponent implements OnInit {
  bookings: FailedBooking[] = [];
  isLoading = false;
  searchTerm = '';
  currentPage = 1;
  limit = 20;
  total = 0;
  totalPages = 0;
  
  // Icons
  readonly AlertCircleIcon = AlertCircle;
  readonly SearchIcon = Search;
  readonly UserIcon = User;
  readonly MailIcon = Mail;
  readonly PhoneIcon = Phone;
  readonly CalendarIcon = Calendar;
  readonly DollarSignIcon = DollarSign;
  readonly XCircleIcon = XCircle;
  readonly EyeIcon = Eye;
  readonly RefreshCwIcon = RefreshCw;

  constructor(private bookingService: BookingService) {}

  ngOnInit(): void {
    this.loadFailedBookings();
  }

  loadFailedBookings(): void {
    this.isLoading = true;
    this.bookingService.getFailedBookings(this.searchTerm, this.currentPage, this.limit).subscribe({
      next: (response) => {
        if (response.success) {
          this.bookings = response.data;
          this.total = response.pagination.total;
          this.totalPages = response.pagination.totalPages;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading failed bookings:', error);
        this.isLoading = false;
        // Show user-friendly error message
        if (error.error?.message) {
          console.error('Error details:', error.error.message);
        }
      }
    });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadFailedBookings();
  }

  onSearchClear(): void {
    this.searchTerm = '';
    this.currentPage = 1;
    this.loadFailedBookings();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadFailedBookings();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
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

  getStatusBadgeClass(status: string | undefined): string {
    switch (status) {
      case 'awaiting_payment':
        return 'badge-warning';
      case 'cancelled':
        return 'badge-danger';
      default:
        return 'badge-secondary';
    }
  }

  getPaymentMethodLabel(method: string | undefined): string {
    switch (method) {
      case 'card':
        return 'Card';
      case 'online_banking':
        return 'Online Banking';
      case 'cash':
        return 'Cash';
      default:
        return 'N/A';
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPages = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxPages / 2));
    let endPage = Math.min(this.totalPages, startPage + maxPages - 1);
    
    if (endPage - startPage < maxPages - 1) {
      startPage = Math.max(1, endPage - maxPages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  viewBookingDetails(bookingId: number | undefined): void {
    if (!bookingId) return;
    // TODO: Navigate to booking detail page or open modal
    console.log('View booking details:', bookingId);
  }
}

