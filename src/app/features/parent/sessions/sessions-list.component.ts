import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BookingService } from '../../../core/services/booking.service';
import { Booking } from '../../../shared/models/booking.model';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { LucideAngularModule, Calendar, Clock, MapPin, Video, Users, Search, Filter, Eye } from 'lucide-angular';
import { ChildService } from '../../../core/services/child.service';
import { Child } from '../../../shared/models/child.model';

@Component({
  selector: 'app-sessions-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslatePipe, LucideAngularModule],
  templateUrl: './sessions-list.component.html',
  styleUrls: ['./sessions-list.component.css']
})
export class SessionsListComponent implements OnInit {
  bookings: Booking[] = [];
  filteredBookings: Booking[] = [];
  children: Child[] = [];
  isLoading = false;
  error: string | null = null;
  
  // Filters
  selectedChildId: number | 'all' = 'all';
  selectedStatus: string | 'all' = 'all';
  searchTerm: string = '';
  
  // Icons
  readonly CalendarIcon = Calendar;
  readonly ClockIcon = Clock;
  readonly MapPinIcon = MapPin;
  readonly VideoIcon = Video;
  readonly UsersIcon = Users;
  readonly SearchIcon = Search;
  readonly FilterIcon = Filter;
  readonly EyeIcon = Eye;

  // Status options
  statusOptions = [
    { value: 'all', labelKey: 'sessions.status.all' },
    { value: 'completed', labelKey: 'sessions.status.completed' },
    { value: 'confirmed', labelKey: 'sessions.status.confirmed' },
    { value: 'awaiting_payment', labelKey: 'sessions.status.awaitingPayment' },
    { value: 'awaiting_clinical_review', labelKey: 'sessions.status.awaitingReview' },
    { value: 'cancelled', labelKey: 'sessions.status.cancelled' },
    { value: 'no_show', labelKey: 'sessions.status.noShow' }
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
        this.loadSessions();
      },
      error: (err) => {
        console.error('Error loading children:', err);
        this.loadSessions();
      }
    });
  }

  loadSessions(): void {
    this.isLoading = true;
    this.error = null;

    const childId = this.selectedChildId === 'all' ? undefined : this.selectedChildId as number;
    
    this.bookingService.getBookings(childId).subscribe({
      next: (response) => {
        if (response.success) {
          this.bookings = response.data || [];
          this.applyFilters();
        } else {
          this.error = 'Failed to load sessions';
          this.bookings = [];
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading sessions:', error);
        this.error = error.error?.message || 'Error loading sessions. Please try again.';
        this.bookings = [];
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    this.filteredBookings = this.bookings.filter(booking => {
      // Child filter
      if (this.selectedChildId !== 'all' && booking.child_id !== this.selectedChildId) {
        return false;
      }

      // Status filter
      if (this.selectedStatus !== 'all' && booking.status !== this.selectedStatus) {
        return false;
      }

      // Search filter
      if (this.searchTerm.trim()) {
        const searchLower = this.searchTerm.toLowerCase();
        const matchesChild = booking.child_name?.toLowerCase().includes(searchLower);
        const matchesService = booking.booking_type_name?.toLowerCase().includes(searchLower) ||
                              booking.booking_type?.toLowerCase().includes(searchLower);
        const matchesTherapist = booking.therapist_name?.toLowerCase().includes(searchLower);
        const matchesDate = booking.confirmed_start_at?.toLowerCase().includes(searchLower) ||
                          booking.preferred_start_at?.toLowerCase().includes(searchLower);
        
        if (!matchesChild && !matchesService && !matchesTherapist && !matchesDate) {
          return false;
        }
      }

      return true;
    });

    // Sort by date (most recent first)
    this.filteredBookings.sort((a, b) => {
      const dateA = a.confirmed_start_at || a.preferred_start_at || a.created_at || '';
      const dateB = b.confirmed_start_at || b.preferred_start_at || b.created_at || '';
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  getStatusColor(status?: string): string {
    switch (status) {
      case 'completed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'awaiting_payment':
      case 'awaiting_cash_payment':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'awaiting_clinical_review':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'no_show':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }

  getStatusLabel(status?: string): string {
    switch (status) {
      case 'completed':
        return 'sessions.status.completed';
      case 'confirmed':
        return 'sessions.status.confirmed';
      case 'awaiting_payment':
        return 'sessions.status.awaitingPayment';
      case 'awaiting_cash_payment':
        return 'sessions.status.awaitingCashPayment';
      case 'awaiting_clinical_review':
        return 'sessions.status.awaitingReview';
      case 'cancelled':
        return 'sessions.status.cancelled';
      case 'no_show':
        return 'sessions.status.noShow';
      default:
        return 'sessions.status.pending';
    }
  }

  getModeIcon(mode?: string): any {
    return mode === 'online' ? this.VideoIcon : this.MapPinIcon;
  }

  getModeLabel(mode?: string): string {
    return mode === 'online' ? 'booking.mode.online' : 'booking.mode.inCentre';
  }
}

