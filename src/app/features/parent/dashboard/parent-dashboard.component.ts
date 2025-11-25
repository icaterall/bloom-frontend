import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ChildService } from '../../../core/services/child.service';
import { BookingService } from '../../../core/services/booking.service';
import { User } from '../../../shared/models/user.model';
import { Child } from '../../../shared/models/child.model';
import { Booking } from '../../../shared/models/booking.model';
import { AddChildModalComponent } from '../components/add-child-modal/add-child-modal.component';
import { BookTourModalComponent } from '../components/book-tour-modal/book-tour-modal.component';
import { LucideAngularModule, Baby, Calendar, Target, MessageSquare, FileText, Plus } from 'lucide-angular';

@Component({
  selector: 'app-parent-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    LucideAngularModule, 
    AddChildModalComponent,
    BookTourModalComponent
  ],
  templateUrl: './parent-dashboard.component.html',
  styleUrls: ['./parent-dashboard.component.css']
})
export class ParentDashboardComponent implements OnInit {
  currentUser: User | null = null;
  children: Child[] = [];
  bookings: Booking[] = [];
  isLoading = true;
  showAddChildModal = false;
  showBookTourModal = false;

  // Icons
  BabyIcon = Baby;
  CalendarIcon = Calendar;
  TargetIcon = Target;
  MessageSquareIcon = MessageSquare;
  FileTextIcon = FileText;
  PlusIcon = Plus;

  // Sample data (will be replaced with real data later)
  upcomingSessions = [
    { date: 'Tomorrow', time: '10:00 AM', type: 'Individual Therapy', therapist: 'Ms. Sarah' },
    { date: 'Friday', time: '2:00 PM', type: 'Group Activity', therapist: 'Mr. John' },
    { date: 'Next Monday', time: '10:00 AM', type: 'Assessment', therapist: 'Ms. Sarah' }
  ];

  recentProgress = [
    { area: 'Communication', progress: 'Improved eye contact during conversations', date: '2 days ago' },
    { area: 'Social Skills', progress: 'Participated in group play for 15 minutes', date: '3 days ago' },
    { area: 'Daily Living', progress: 'Successfully used utensils during lunch', date: '1 week ago' }
  ];

  constructor(
    private authService: AuthService,
    private childService: ChildService,
    private bookingService: BookingService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadChildren();
    this.loadBookings();
  }

  loadChildren(): void {
    this.isLoading = true;
    this.childService.getChildren().subscribe({
      next: (response) => {
        if (response.success && Array.isArray(response.data)) {
          this.children = response.data;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading children:', error);
        this.isLoading = false;
      }
    });
  }

  loadBookings(): void {
    this.bookingService.getBookings().subscribe({
      next: (response) => {
        if (response.success && Array.isArray(response.data)) {
          this.bookings = response.data;
        }
      },
      error: (error) => {
        console.error('Error loading bookings:', error);
      }
    });
  }

  openAddChildModal(): void {
    this.showAddChildModal = true;
  }

  closeAddChildModal(): void {
    this.showAddChildModal = false;
  }

  onChildAdded(): void {
    this.loadChildren();
  }

  openBookTourModal(): void {
    this.showBookTourModal = true;
  }

  closeBookTourModal(): void {
    this.showBookTourModal = false;
  }

  onBookingCreated(): void {
    this.loadBookings();
    this.closeBookTourModal();
  }

  getBookingForChild(childId: number | undefined): Booking | undefined {
    if (!childId) return undefined;
    return this.bookings.find(b => b.child_id === childId && b.status && ['pending', 'confirmed'].includes(b.status));
  }

  // Helper to calculate age
  calculateAge(dateOfBirth: string | undefined): number {
    if (!dateOfBirth) return 0;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }
}

