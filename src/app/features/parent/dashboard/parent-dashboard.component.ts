import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ChildService } from '../../../core/services/child.service';
import { BookingService } from '../../../core/services/booking.service';
import { User } from '../../../shared/models/user.model';
import { Child } from '../../../shared/models/child.model';
import { Booking } from '../../../shared/models/booking.model';
import { LucideAngularModule, Pencil } from 'lucide-angular';
import { AddChildModalComponent } from '../components/add-child-modal/add-child-modal.component';
import { BookTourModalComponent } from '../components/book-tour-modal/book-tour-modal.component';
import { BookingWizardComponent } from '../components/booking-wizard/booking-wizard.component';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-parent-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    TranslatePipe,
    LucideAngularModule,
    AddChildModalComponent,
    BookTourModalComponent,
    BookingWizardComponent
  ],
  templateUrl: './parent-dashboard.component.html',
  styleUrls: ['./parent-dashboard.component.css']
})
export class ParentDashboardComponent implements OnInit {
  currentUser: User | null = null;
  children: Child[] = [];
  bookings: Booking[] = [];
  isChildrenLoading = false;
  isBookingsLoading = false;
  showAddChildModal = false;
  showBookTourModal = false;
  showBookingWizard = false;
  selectedChild: Child | null = null;
  selectedChildForBooking: Child | null = null;
  selectedChildForWizard: Child | null = null;
  hasAnimatedBookButton: { [key: number]: boolean } = {};
  readonly PencilIcon = Pencil;

  get isLoading(): boolean {
    return this.isChildrenLoading || this.isBookingsLoading;
  }

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
    this.isChildrenLoading = true;
    this.childService.getChildren().subscribe({
      next: (response) => {
        if (response.success && Array.isArray(response.data)) {
          this.children = response.data;
        }
        this.isChildrenLoading = false;
      },
      error: (error) => {
        console.error('Error loading children:', error);
        this.isChildrenLoading = false;
      }
    });
  }

  loadBookings(): void {
    this.isBookingsLoading = true;
    this.bookingService.getBookings().subscribe({
      next: (response) => {
        if (response.success && Array.isArray(response.data)) {
          this.bookings = response.data;
        }
        this.isBookingsLoading = false;
      },
      error: (error) => {
        console.error('Error loading bookings:', error);
        this.isBookingsLoading = false;
      }
    });
  }

  openAddChildModal(): void {
    this.selectedChild = null;
    this.showAddChildModal = true;
  }

  openEditChildModal(child: Child): void {
    this.selectedChild = child;
    this.showAddChildModal = true;
  }

  closeAddChildModal(): void {
    this.showAddChildModal = false;
    this.selectedChild = null;
  }

  onChildAdded(): void {
    this.loadChildren();
  }

  onChildUpdated(): void {
    this.loadChildren();
  }

  openBookTourModal(): void {
    this.showBookTourModal = true;
  }

  openBookSessionModal(child: Child): void {
    // Open booking wizard with pre-selected child
    this.selectedChildForWizard = child;
    this.showBookingWizard = true;
  }

  closeBookTourModal(): void {
    this.showBookTourModal = false;
    this.selectedChildForBooking = null;
  }

  onBookingCreated(): void {
    this.loadBookings();
    this.closeBookTourModal();
  }

  getBookingForChild(childId: number | undefined): Booking | undefined {
    if (!childId) return undefined;
    return this.bookings.find(b => b.child_id === childId && b.status && ['pending', 'confirmed'].includes(b.status));
  }

  getUpcomingBookingForChild(childId: number | undefined): Booking | undefined {
    if (!childId) return undefined;
    const now = new Date();
    return this.bookings.find(b => {
      if (b.child_id !== childId) return false;
      // Check if booking has a future start time
      const startAt = b.preferred_start_at || b.confirmed_start_at || b.start_at;
      if (!startAt) return false;
      const bookingDate = new Date(startAt);
      // Only show bookings that are in the future and have valid statuses
      return bookingDate > now && 
             b.status && 
             ['pending', 'awaiting_payment', 'awaiting_cash_payment', 'awaiting_clinical_review', 'confirmed'].includes(b.status);
    });
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

  onBookButtonAnimationEnd(childId: number | undefined): void {
    if (childId) {
      this.hasAnimatedBookButton[childId] = true;
    }
  }

  closeBookingWizard(): void {
    this.showBookingWizard = false;
    this.selectedChildForWizard = null;
  }

  onWizardStepComplete(event: any): void {
    console.log('Wizard step complete:', event);
    // Handle step completion
    if (event.step === 2) {
      // Booking created, continue to payment step (handled in wizard)
    } else if (event.step === 3) {
      // Payment method selected
      if (event.data?.payment_method === 'cash') {
        // Cash payment - booking is reserved, refresh bookings
        this.loadBookings();
      }
      // For card/online_banking, user is redirected to Stripe, so no refresh needed
    }
  }
}

