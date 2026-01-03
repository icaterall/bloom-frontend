import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ChildService } from '../../../core/services/child.service';
import { BookingService } from '../../../core/services/booking.service';
import { ChildCaseService, ChildCaseUpdate } from '../../../core/services/child-case.service';
import { ProgressUpdatesService, ProgressUpdate } from '../../../core/services/progress-updates.service';
import { SocketService } from '../../../core/services/socket.service';
import { Subscription } from 'rxjs';
import { User } from '../../../shared/models/user.model';
import { Child } from '../../../shared/models/child.model';
import { Booking } from '../../../shared/models/booking.model';
import { LucideAngularModule, Pencil, TrendingUp, Calendar, FileText, Image, Video, File, CheckCircle, Clock, MapPin, X, CalendarPlus, User as UserIcon, Eye, Trash2, Info, MessageSquare, Navigation, Folder } from 'lucide-angular';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
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
    TranslatePipe,
    AddChildModalComponent,
    BookTourModalComponent,
    BookingWizardComponent
  ],
  templateUrl: './parent-dashboard.component.html',
  styleUrls: ['./parent-dashboard.component.css']
})
export class ParentDashboardComponent implements OnInit {
  private notificationSubscription?: Subscription;
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
  readonly CheckCircleIcon = CheckCircle;
  readonly ClockIcon = Clock;
  readonly MapPinIcon = MapPin;
  readonly XIcon = X;
  readonly CalendarPlusIcon = CalendarPlus;
  readonly UserIcon = UserIcon;
  readonly EyeIcon = Eye;
  readonly TrashIcon = Trash2;
  readonly InfoIcon = Info;
  readonly MessageSquareIcon = MessageSquare;
  readonly NavigationIcon = Navigation;
  readonly FolderIcon = Folder;

  // Toast properties
  showSuccessToast = false;
  successToastMessage = '';

  // Child case updates
  childCaseUpdates: { [childId: number]: ChildCaseUpdate[] } = {};
  isLoadingCaseUpdates: { [childId: number]: boolean } = {};
  // Progress updates (new system)
  progressUpdates: { [childId: number]: ProgressUpdate[] } = {};
  isLoadingProgressUpdates: { [childId: number]: boolean } = {};
  selectedChildForTimeline: Child | null = null;
  showTimelineModal = false;

  // Profile menu
  isProfileMenuOpen = false;

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
    private childCaseService: ChildCaseService,
    private progressUpdatesService: ProgressUpdatesService,
    private socketService: SocketService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadChildren();
    this.loadBookings();
    
    // Listen for socket notifications (e.g., when admin marks cash as paid)
    this.notificationSubscription = this.socketService.getNotifications().subscribe(notification => {
      console.log('[ParentDashboard] Received notification:', notification);
      
      // If notification is about payment being marked as paid, refresh bookings
      if (notification.type === 'cash_payment_received' || 
          notification.type === 'payment_received' ||
          (notification.data && notification.data.bookingId)) {
        // Refresh bookings to get updated status
        this.loadBookings();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.notificationSubscription) {
      this.notificationSubscription.unsubscribe();
    }
  }

  toggleProfileMenu(): void {
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }

  closeProfileMenu(): void {
    this.isProfileMenuOpen = false;
  }

  logout(): void {
    this.authService.logout();
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
        // Silently handle errors - table might not exist yet or no updates available
        // Only log if it's not a 404 or 500 (table doesn't exist)
        if (error.status !== 404 && error.status !== 500) {
          console.error('Error loading case updates:', error);
        }
        this.isLoadingCaseUpdates[childId] = false;
        // Set empty array if endpoint doesn't exist or table is empty
        this.childCaseUpdates[childId] = [];
      }
    });
  }

  loadProgressUpdates(childId: number): void {
    if (this.isLoadingProgressUpdates[childId]) return;
    
    this.isLoadingProgressUpdates[childId] = true;
    this.progressUpdatesService.getChildProgressUpdatesForParent(childId, 1, 5).subscribe({
      next: (response) => {
        if (response.success && Array.isArray(response.data)) {
          this.progressUpdates[childId] = response.data;
        }
        this.isLoadingProgressUpdates[childId] = false;
      },
      error: (error) => {
        console.error('Error loading progress updates:', error);
        this.isLoadingProgressUpdates[childId] = false;
        this.progressUpdates[childId] = [];
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

  getLatestProgressUpdate(childId: number | undefined): ProgressUpdate | null {
    if (!childId) return null;
    const updates = this.progressUpdates[childId] || [];
    return updates.length > 0 ? updates[0] : null;
  }

  viewAllUpdates(child: Child): void {
    if (child.id) {
      this.router.navigate(['/parent/updates'], { queryParams: { childId: child.id } });
    }
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

  loadChildren(showSuccessToastIfFirst: boolean = false): void {
    this.isChildrenLoading = true;
    const previousChildrenCount = this.children.length;
    this.childService.getChildren().subscribe({
      next: (response) => {
        if (response.success && Array.isArray(response.data)) {
          this.children = response.data;
          // Show success toast if this was the first child added (transition from 0 to 1)
          if (showSuccessToastIfFirst && previousChildrenCount === 0 && this.children.length === 1) {
            this.triggerSuccessToast();
          }
          // Load case updates and progress updates for all children
          this.children.forEach(child => {
            if (child.id) {
              this.loadCaseUpdates(child.id);
              this.loadProgressUpdates(child.id);
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
    // Pass flag to show success toast if this is the first child
    this.loadChildren(true);
  }

  triggerSuccessToast(): void {
    this.showSuccessToast = true;
    this.successToastMessage = 'parentDashboard.successToast.childSaved';
    // Auto-hide after 5 seconds
    setTimeout(() => {
      this.showSuccessToast = false;
    }, 5000);
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
    // Treat these statuses as "active" bookings that should block new session creation
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

  isBookingPaid(booking: Booking | undefined): boolean {
    if (!booking) return false;
    // Check if payment status indicates payment was made
    // Also check if status is awaiting_clinical_review which typically means payment was received
    return booking.payment_status === 'paid' || 
           (booking.status === 'awaiting_clinical_review' && booking.payment_status !== 'unpaid' && 
            booking.payment_status !== 'failed' && booking.payment_status !== 'pending');
  }

  hasTherapistAssigned(booking: Booking | undefined): boolean {
    if (!booking) return false;
    // Check if therapist is assigned and session is confirmed
    return !!(booking.therapist_id || booking.therapist_name) && 
           !!(booking.confirmed_start_at || booking.therapist_response === 'accepted' || booking.status === 'confirmed');
  }

  isSessionCompleted(booking: Booking | undefined): boolean {
    if (!booking) return false;
    return booking.status === 'completed';
  }

  getBookingStatusLabel(booking: Booking | undefined): string {
    if (!booking) return '';
    if (this.isBookingPaid(booking) && booking.status === 'awaiting_clinical_review') {
      return 'parentDashboard.childCard.bookingStatus.awaitingConfirmation';
    }
    return `parentDashboard.childCard.bookingStatus.${booking.status || 'pending'}`;
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

  viewBooking(booking: Booking): void {
    // Navigate to booking details or dashboard with booking highlighted
    // For now, just scroll to the booking card or show a message
    // TODO: Implement booking detail view if needed
    console.log('View booking:', booking);
  }

  /**
   * Get the next upcoming session (within 24 hours)
   */
  getUpcomingSession(): Booking | null {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setHours(tomorrow.getHours() + 24);

    // Find the next confirmed session within 24 hours
    const upcoming = this.bookings.find(booking => {
      if (!booking.confirmed_start_at) return false;
      
      const sessionDate = new Date(booking.confirmed_start_at);
      return sessionDate >= now && sessionDate <= tomorrow && 
             (booking.status === 'confirmed' || booking.therapist_response === 'accepted');
    });

    return upcoming || null;
  }

  /**
   * Add session to calendar (iCal format)
   */
  addToCalendar(booking: Booking): void {
    if (!booking.confirmed_start_at) return;

    const startDate = new Date(booking.confirmed_start_at);
    const endDate = booking.confirmed_end_at ? new Date(booking.confirmed_end_at) : 
                    new Date(startDate.getTime() + 60 * 60 * 1000); // Default 1 hour

    // Format dates for iCal (YYYYMMDDTHHmmssZ)
    const formatDate = (date: Date): string => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const title = `${booking.booking_type_name || booking.booking_type} - ${booking.child_name || 'Session'}`;
    const description = `Session with ${booking.therapist_name || 'therapist'}`;
    const location = booking.mode === 'in_centre' 
      ? 'Bloom Spectrum Centre, Putrajaya'
      : booking.online_meeting_link || 'Online';

    // Create iCal content
    const icalContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Bloom Spectrum//Session Calendar//EN',
      'BEGIN:VEVENT',
      `DTSTART:${formatDate(startDate)}`,
      `DTEND:${formatDate(endDate)}`,
      `SUMMARY:${title}`,
      `DESCRIPTION:${description}`,
      `LOCATION:${location}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    // Create blob and download
    const blob = new Blob([icalContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = `session-${booking.id || 'upcoming'}.ics`;
    link.click();
  }

  /**
   * Open directions to centre (Google Maps)
   */
  openDirections(): void {
    // Bloom Spectrum Centre address
    const address = 'Bloom+Spectrum+Centre,+A-1-08,+Block+A,+Conezion+Commercial,+Persiaran+IRC+3,+IOI+Resort+City,+62502+Putrajaya';
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${address}`;
    window.open(mapsUrl, '_blank', 'noopener,noreferrer');
  }

  /**
   * View session notes
   */
  viewSessionNotes(booking: Booking): void {
    // TODO: Navigate to session notes page or open modal
    console.log('View session notes for booking:', booking.id);
    // This could open a modal or navigate to a notes page
  }

  /**
   * View session documents
   */
  viewSessionDocuments(booking: Booking): void {
    // TODO: Navigate to documents page or open modal
    console.log('View session documents for booking:', booking.id);
    // This could open a modal or navigate to a documents page
  }

  /**
   * View instructions for cash payment
   */
  viewInstructions(booking: Booking): void {
    // Show instructions for cash payment
    // TODO: Implement instructions modal or page
    alert('Instructions: Please pay at the centre within 24 hours. Bring this booking ID: #' + booking.id);
  }

  /**
   * Cancel booking
   */
  cancelBooking(booking: Booking): void {
    if (!booking.id) return;
    if (confirm('Are you sure you want to cancel this booking?')) {
      // TODO: Implement cancel booking API call
      console.log('Cancel booking:', booking.id);
    }
  }

  /**
   * Join online session
   */
  joinSession(booking: Booking): void {
    if (booking.mode === 'online' && booking.online_meeting_link) {
      window.open(booking.online_meeting_link, '_blank', 'noopener,noreferrer');
    } else {
      console.warn('No online meeting link available for this session.');
    }
  }

  /**
   * Message centre
   */
  messageCentre(booking: Booking): void {
    // TODO: Navigate to messages page or open message modal
    console.log('Message centre for booking:', booking.id);
    // This could navigate to /parent/messages or open a message modal
  }
}

