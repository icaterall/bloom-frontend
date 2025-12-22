import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ChildService } from '../../../core/services/child.service';
import { BookingService } from '../../../core/services/booking.service';
import { ChildCaseService, ChildCaseUpdate } from '../../../core/services/child-case.service';
import { User } from '../../../shared/models/user.model';
import { Child } from '../../../shared/models/child.model';
import { Booking } from '../../../shared/models/booking.model';
import { LucideAngularModule, Pencil, TrendingUp, Calendar, FileText, Image, Video, File } from 'lucide-angular';
import { AddChildModalComponent } from '../components/add-child-modal/add-child-modal.component';
import { BookTourModalComponent } from '../components/book-tour-modal/book-tour-modal.component';
import { BookingWizardComponent } from '../components/booking-wizard/booking-wizard.component';

@Component({
  selector: 'app-parent-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
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
  readonly TrendingUpIcon = TrendingUp;
  readonly CalendarIcon = Calendar;
  readonly FileTextIcon = FileText;
  readonly ImageIcon = Image;
  readonly VideoIcon = Video;
  readonly FileIcon = File;

  // Child case updates
  childCaseUpdates: { [childId: number]: ChildCaseUpdate[] } = {};
  isLoadingCaseUpdates: { [childId: number]: boolean } = {};
  selectedChildForTimeline: Child | null = null;
  showTimelineModal = false;

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
    private bookingService: BookingService,
    private childCaseService: ChildCaseService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadChildren();
    this.loadBookings();
  }

  loadCaseUpdates(childId: number): void {
    if (this.isLoadingCaseUpdates[childId]) return;
    
    this.isLoadingCaseUpdates[childId] = true;
    this.childCaseService.getCaseUpdatesForParent(childId).subscribe({
      next: (response) => {
        if (response.success && Array.isArray(response.data)) {
          this.childCaseUpdates[childId] = response.data;
        }
        this.isLoadingCaseUpdates[childId] = false;
      },
      error: (error) => {
        console.error('Error loading case updates:', error);
        this.isLoadingCaseUpdates[childId] = false;
        // If endpoint doesn't exist yet, just set empty array
        this.childCaseUpdates[childId] = [];
      }
    });
  }

  getCaseUpdatesForChild(childId: number | undefined): ChildCaseUpdate[] {
    if (!childId) return [];
    return this.childCaseUpdates[childId] || [];
  }

  getLatestCaseUpdate(childId: number | undefined): ChildCaseUpdate | null {
    const updates = this.getCaseUpdatesForChild(childId);
    return updates.length > 0 ? updates[0] : null;
  }

  openTimelineModal(child: Child): void {
    this.selectedChildForTimeline = child;
    this.showTimelineModal = true;
    if (child.id) {
      this.loadCaseUpdates(child.id);
    }
  }

  closeTimelineModal(): void {
    this.showTimelineModal = false;
    this.selectedChildForTimeline = null;
  }

  getStatusColor(status: string | undefined): string {
    if (!status) return 'bg-gray-100 text-gray-800';
    const statusMap: { [key: string]: string } = {
      'progressing': 'bg-blue-100 text-blue-800',
      'stable': 'bg-green-100 text-green-800',
      'improving': 'bg-emerald-100 text-emerald-800',
      'needs_attention': 'bg-amber-100 text-amber-800',
      'excellent': 'bg-purple-100 text-purple-800'
    };
    return statusMap[status.toLowerCase()] || 'bg-gray-100 text-gray-800';
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getRelativeTime(dateString: string | undefined): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return this.formatDate(dateString);
  }

  loadChildren(): void {
    this.isChildrenLoading = true;
    this.childService.getChildren().subscribe({
      next: (response) => {
        if (response.success && Array.isArray(response.data)) {
          this.children = response.data;
          // Load case updates for all children
          this.children.forEach(child => {
            if (child.id) {
              this.loadCaseUpdates(child.id);
            }
          });
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
    // Treat these statuses as “active” bookings that should block new session creation
    const activeStatuses = [
      'pending',
      'awaiting_payment',
      'awaiting_cash_payment',
      'awaiting_clinical_review',
      'confirmed'
    ];
    return this.bookings.find(
      b => b.child_id === childId && b.status && activeStatuses.includes(b.status)
    );
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

  isAwaitingCash(booking?: Booking | undefined): boolean {
    return !!booking && booking.payment_method === 'cash' && booking.status === 'awaiting_cash_payment';
  }

  canRetryPayment(booking?: Booking | undefined): boolean {
    if (!booking) return false;
    // Allow retry if payment failed or is pending
    return booking.payment_status === 'failed' || booking.payment_status === 'pending';
  }

  isRetryingPayment: { [key: number]: boolean } = {};

  retryPayment(booking: Booking, paymentMethod: 'card' | 'online_banking'): void {
    if (!booking.id) return;
    
    const bookingId = booking.id;
    this.isRetryingPayment[bookingId] = true;
    
    this.bookingService.payBooking(bookingId, paymentMethod).subscribe({
      next: (response) => {
        if (bookingId) {
          this.isRetryingPayment[bookingId] = false;
        }
        console.log('[ParentDashboard] Payment retry response:', response);
        
        if (response.checkout_url) {
          // Redirect to Stripe checkout
          window.location.href = response.checkout_url;
        } else if (response.message) {
          // Show success message for cash payment
          alert(response.message);
          this.loadBookings();
        }
      },
      error: (error) => {
        if (bookingId) {
          this.isRetryingPayment[bookingId] = false;
        }
        console.error('[ParentDashboard] Payment retry error:', error);
        alert(error.error?.message || 'Failed to retry payment. Please try again.');
      }
    });
  }

  getCashPayBy(booking?: Booking | undefined): Date | null {
    if (!booking || !booking.created_at) return null;
    const created = new Date(booking.created_at);
    return new Date(created.getTime() + 24 * 60 * 60 * 1000); // 24h window
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

  isArray(value: any): boolean {
    return Array.isArray(value);
  }
}

