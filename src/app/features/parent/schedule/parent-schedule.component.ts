import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Calendar, Clock, User, MapPin, Video, ChevronLeft, ChevronRight, AlertCircle, Users } from 'lucide-angular';
import { BookingService } from '../../../core/services/booking.service';
import { Booking } from '../../../shared/models/booking.model';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { ChildService } from '../../../core/services/child.service';
import { Child } from '../../../shared/models/child.model';

interface DaySessions {
  date: Date;
  sessions: Booking[];
}

@Component({
  selector: 'app-parent-schedule',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LucideAngularModule, TranslatePipe],
  templateUrl: './parent-schedule.component.html',
  styleUrls: ['./parent-schedule.component.css']
})
export class ParentScheduleComponent implements OnInit {
  currentDate = new Date();
  currentMonth = this.currentDate.getMonth();
  currentYear = this.currentDate.getFullYear();
  
  bookings: Booking[] = [];
  children: Child[] = [];
  selectedChildId: number | 'all' = 'all';
  isLoading = false;
  error: string | null = null;
  
  selectedBooking: Booking | null = null;
  showBookingModal = false;
  
  // Icons
  readonly CalendarIcon = Calendar;
  readonly ClockIcon = Clock;
  readonly UserIcon = User;
  readonly MapPinIcon = MapPin;
  readonly VideoIcon = Video;
  readonly ChevronLeftIcon = ChevronLeft;
  readonly ChevronRightIcon = ChevronRight;
  readonly AlertCircleIcon = AlertCircle;
  readonly UsersIcon = Users;

  // Days of week
  readonly daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  readonly monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  constructor(
    private bookingService: BookingService,
    private childService: ChildService
  ) {}

  ngOnInit(): void {
    this.loadChildren();
  }

  loadChildren(): void {
    this.childService.getChildren().subscribe({
      next: (response) => {
        this.children = Array.isArray(response.data) ? response.data : (response.data ? [response.data] : []);
        this.loadBookings();
      },
      error: (err) => {
        console.error('Error loading children:', err);
        this.loadBookings();
      }
    });
  }

  loadBookings(): void {
    this.isLoading = true;
    this.error = null;

    const childId = this.selectedChildId === 'all' ? undefined : this.selectedChildId as number;
    
    this.bookingService.getBookings(childId).subscribe({
      next: (response) => {
        if (response.success) {
          this.bookings = response.data || [];
        } else {
          this.error = 'Failed to load bookings';
          this.bookings = [];
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading bookings:', error);
        this.error = error.error?.message || 'Error loading bookings. Please try again.';
        this.bookings = [];
        this.isLoading = false;
      }
    });
  }

  onChildFilterChange(): void {
    this.loadBookings();
  }

  getCalendarDays(): DaySessions[] {
    const firstDay = new Date(this.currentYear, this.currentMonth, 1);
    const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: DaySessions[] = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      const date = new Date(this.currentYear, this.currentMonth, -startingDayOfWeek + i + 1);
      days.push({ date, sessions: [] });
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(this.currentYear, this.currentMonth, day);
      const daySessions = this.getSessionsForDate(date);
      days.push({ date, sessions: daySessions });
    }

    // Add empty cells to complete the last week (if needed)
    const remainingDays = 7 - (days.length % 7);
    if (remainingDays < 7) {
      for (let i = 1; i <= remainingDays; i++) {
        const date = new Date(this.currentYear, this.currentMonth + 1, i);
        days.push({ date, sessions: [] });
      }
    }

    return days;
  }

  getSessionsForDate(date: Date): Booking[] {
    return this.bookings.filter(booking => {
      const sessionDate = booking.confirmed_start_at 
        ? new Date(booking.confirmed_start_at)
        : booking.preferred_start_at 
          ? new Date(booking.preferred_start_at)
          : null;
      
      if (!sessionDate) return false;

      return sessionDate.getDate() === date.getDate() &&
             sessionDate.getMonth() === date.getMonth() &&
             sessionDate.getFullYear() === date.getFullYear();
    });
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  }

  isCurrentMonth(date: Date): boolean {
    return date.getMonth() === this.currentMonth &&
           date.getFullYear() === this.currentYear;
  }

  previousMonth(): void {
    if (this.currentMonth === 0) {
      this.currentMonth = 11;
      this.currentYear--;
    } else {
      this.currentMonth--;
    }
    this.loadBookings();
  }

  nextMonth(): void {
    if (this.currentMonth === 11) {
      this.currentMonth = 0;
      this.currentYear++;
    } else {
      this.currentMonth++;
    }
    this.loadBookings();
  }

  goToToday(): void {
    const today = new Date();
    this.currentMonth = today.getMonth();
    this.currentYear = today.getFullYear();
    this.loadBookings();
  }

  openBookingModal(booking: Booking): void {
    this.selectedBooking = booking;
    this.showBookingModal = true;
  }

  closeBookingModal(): void {
    this.showBookingModal = false;
    this.selectedBooking = null;
  }

  getStatusColor(status?: string): string {
    switch (status) {
      case 'confirmed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'awaiting_payment':
      case 'awaiting_cash_payment':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'awaiting_clinical_review':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }

  getStatusLabel(status?: string): string {
    switch (status) {
      case 'confirmed':
        return 'schedule.status.confirmed';
      case 'awaiting_payment':
        return 'schedule.status.awaitingPayment';
      case 'awaiting_cash_payment':
        return 'schedule.status.awaitingCashPayment';
      case 'awaiting_clinical_review':
        return 'schedule.status.awaitingReview';
      case 'completed':
        return 'schedule.status.completed';
      case 'cancelled':
        return 'schedule.status.cancelled';
      default:
        return 'schedule.status.pending';
    }
  }
}

