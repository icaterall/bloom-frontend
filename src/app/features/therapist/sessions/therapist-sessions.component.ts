import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TherapistSessionsService, SessionsFilters } from '../../../core/services/therapist-sessions.service';
import { Booking } from '../../../shared/models/booking.model';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { LucideAngularModule, Calendar, Clock, User, MapPin, Video, List, Eye, AlertCircle, Filter, X } from 'lucide-angular';

@Component({
  selector: 'app-therapist-sessions',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TranslatePipe, LucideAngularModule],
  templateUrl: './therapist-sessions.component.html',
  styleUrls: ['./therapist-sessions.component.css']
})
export class TherapistSessionsComponent implements OnInit {
  sessions: Booking[] = [];
  filteredSessions: Booking[] = [];
  isLoading = false;
  error: string | null = null;
  
  // View mode
  activeTab: 'list' | 'calendar' = 'list';
  
  // Filters
  dateRange: 'today' | 'week' | 'month' | 'custom' = 'today';
  selectedStatus: string = 'all';
  selectedMode: string = 'all';
  customFromDate: string = '';
  customToDate: string = '';
  showFilters = false;
  
  // Icons
  readonly CalendarIcon = Calendar;
  readonly ClockIcon = Clock;
  readonly UserIcon = User;
  readonly MapPinIcon = MapPin;
  readonly VideoIcon = Video;
  readonly ListIcon = List;
  readonly EyeIcon = Eye;
  readonly AlertCircleIcon = AlertCircle;
  readonly FilterIcon = Filter;
  readonly XIcon = X;

  // Status options
  statusOptions = [
    { value: 'all', labelKey: 'therapistSessions.status.all' },
    { value: 'confirmed', labelKey: 'therapistSessions.status.confirmed' },
    { value: 'completed', labelKey: 'therapistSessions.status.completed' },
    { value: 'cancelled', labelKey: 'therapistSessions.status.cancelled' },
    { value: 'no_show', labelKey: 'therapistSessions.status.noShow' }
  ];

  // Mode options
  modeOptions = [
    { value: 'all', labelKey: 'therapistSessions.mode.all' },
    { value: 'in_centre', labelKey: 'therapistSessions.mode.inCentre' },
    { value: 'online', labelKey: 'therapistSessions.mode.online' }
  ];

  constructor(private sessionsService: TherapistSessionsService) {}

  ngOnInit(): void {
    this.loadSessions();
  }

  loadSessions(): void {
    this.isLoading = true;
    this.error = null;

    const filters: SessionsFilters = {};
    
    // Set date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    switch (this.dateRange) {
      case 'today':
        filters.from = today.toISOString().split('T')[0];
        filters.to = today.toISOString().split('T')[0];
        break;
      case 'week':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        filters.from = weekStart.toISOString().split('T')[0];
        filters.to = weekEnd.toISOString().split('T')[0];
        break;
      case 'month':
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        filters.from = monthStart.toISOString().split('T')[0];
        filters.to = monthEnd.toISOString().split('T')[0];
        break;
      case 'custom':
        if (this.customFromDate) filters.from = this.customFromDate;
        if (this.customToDate) filters.to = this.customToDate;
        break;
    }

    // Set status filter
    if (this.selectedStatus !== 'all') {
      filters.status = this.selectedStatus as any;
    }

    // Set mode filter
    if (this.selectedMode !== 'all') {
      filters.mode = this.selectedMode as any;
    }

    this.sessionsService.getSessions(filters).subscribe({
      next: (response) => {
        if (response.success) {
          this.sessions = response.data || [];
          this.filteredSessions = this.sessions;
        } else {
          this.error = 'Failed to load sessions';
          this.sessions = [];
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading sessions:', error);
        this.error = error.error?.message || 'Error loading sessions. Please try again.';
        this.sessions = [];
        this.isLoading = false;
      }
    });
  }

  onFilterChange(): void {
    this.loadSessions();
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  clearFilters(): void {
    this.dateRange = 'today';
    this.selectedStatus = 'all';
    this.selectedMode = 'all';
    this.customFromDate = '';
    this.customToDate = '';
    this.loadSessions();
  }

  getAge(dob: string | undefined): string {
    if (!dob) return '';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age.toString();
  }

  getDuration(start: string | undefined, end: string | undefined): string {
    if (!start) return '';
    const startTime = new Date(start);
    const endTime = end ? new Date(end) : new Date(startTime.getTime() + 60 * 60 * 1000); // Default 1 hour
    const diffMs = endTime.getTime() - startTime.getTime();
    const diffMins = Math.round(diffMs / (1000 * 60));
    if (diffMins < 60) {
      return `${diffMins} min`;
    }
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }

  canJoinSession(session: Booking): boolean {
    if (session.mode !== 'online' || !session.online_meeting_link) {
      return false;
    }
    if (!session.confirmed_start_at) {
      return false;
    }
    const startTime = new Date(session.confirmed_start_at);
    const now = new Date();
    // Can join if session has started or starts within 15 minutes
    return startTime <= new Date(now.getTime() + 15 * 60 * 1000);
  }

  getStatusColor(status?: string): string {
    switch (status) {
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
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
      case 'confirmed':
        return 'therapistSessions.status.confirmed';
      case 'completed':
        return 'therapistSessions.status.completed';
      case 'cancelled':
        return 'therapistSessions.status.cancelled';
      case 'no_show':
        return 'therapistSessions.status.noShow';
      default:
        return 'therapistSessions.status.pending';
    }
  }
}

