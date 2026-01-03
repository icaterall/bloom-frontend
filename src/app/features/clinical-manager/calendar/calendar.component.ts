import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Calendar, Clock, User, MapPin, Video, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-angular';
import { ClinicalManagerCalendarService, CalendarSession } from '../../../core/services/clinical-manager-calendar.service';

interface DaySessions {
  date: Date;
  sessions: CalendarSession[];
}

@Component({
  selector: 'app-clinical-manager-calendar',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css']
})
export class ClinicalManagerCalendarComponent implements OnInit {
  currentDate = new Date();
  currentMonth = this.currentDate.getMonth();
  currentYear = this.currentDate.getFullYear();
  
  sessions: CalendarSession[] = [];
  isLoading = false;
  error: string | null = null;
  
  selectedSession: CalendarSession | null = null;
  showSessionModal = false;
  
  // Icons
  readonly CalendarIcon = Calendar;
  readonly ClockIcon = Clock;
  readonly UserIcon = User;
  readonly MapPinIcon = MapPin;
  readonly VideoIcon = Video;
  readonly ChevronLeftIcon = ChevronLeft;
  readonly ChevronRightIcon = ChevronRight;
  readonly AlertCircleIcon = AlertCircle;

  // Days of week
  readonly daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  readonly monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  constructor(private calendarService: ClinicalManagerCalendarService) {}

  ngOnInit(): void {
    this.loadSessions();
  }

  loadSessions(): void {
    this.isLoading = true;
    this.error = null;

    // Get start and end of current month
    const startDate = new Date(this.currentYear, this.currentMonth, 1);
    const endDate = new Date(this.currentYear, this.currentMonth + 1, 0, 23, 59, 59);

    this.calendarService.getSessions(
      startDate.toISOString().split('T')[0],
      endDate.toISOString().split('T')[0]
    ).subscribe({
      next: (response) => {
        if (response.success) {
          this.sessions = response.data || [];
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

  getSessionsForDate(date: Date): CalendarSession[] {
    return this.sessions.filter(session => {
      const sessionDate = session.confirmed_start_at 
        ? new Date(session.confirmed_start_at)
        : session.preferred_start_at 
          ? new Date(session.preferred_start_at)
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
    this.loadSessions();
  }

  nextMonth(): void {
    if (this.currentMonth === 11) {
      this.currentMonth = 0;
      this.currentYear++;
    } else {
      this.currentMonth++;
    }
    this.loadSessions();
  }

  goToToday(): void {
    this.currentDate = new Date();
    this.currentMonth = this.currentDate.getMonth();
    this.currentYear = this.currentDate.getFullYear();
    this.loadSessions();
  }

  openSessionModal(session: CalendarSession): void {
    this.selectedSession = session;
    this.showSessionModal = true;
  }

  closeSessionModal(): void {
    this.showSessionModal = false;
    this.selectedSession = null;
  }

  formatTime(dateString: string | undefined): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getSessionDuration(session: CalendarSession): string {
    const start = session.confirmed_start_at || session.preferred_start_at;
    const end = session.confirmed_end_at || session.preferred_end_at;
    
    if (!start) return 'N/A';
    if (!end) return 'Ongoing';

    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffMs = endDate.getTime() - startDate.getTime();
    const diffMins = Math.round(diffMs / 60000);
    
    if (diffMins < 60) {
      return `${diffMins} min`;
    }
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }
}

