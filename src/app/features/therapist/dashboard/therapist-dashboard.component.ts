import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { SocketService, Notification } from '../../../core/services/socket.service';
import { TherapistBookingService } from '../../../core/services/therapist-booking.service';
import { ChildCaseService } from '../../../core/services/child-case.service';
import { TherapistAnalyticsService, TherapistAnalytics } from '../../../core/services/therapist-analytics.service';
import { TherapistDashboardService, TherapistDashboardData } from '../../../core/services/therapist-dashboard.service';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { User } from '../../../shared/models/user.model';
import { Booking } from '../../../shared/models/booking.model';
import { LucideAngularModule, Calendar, Clock, User as UserIcon, CheckCircle, XCircle, AlertCircle, Bell, Edit, Save, TrendingUp, FileText, BarChart3, Plus, ArrowRight, Video, MapPin } from 'lucide-angular';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-therapist-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, LucideAngularModule, TranslatePipe],
  templateUrl: './therapist-dashboard.component.html',
  styleUrls: ['./therapist-dashboard.component.css']
})
export class TherapistDashboardComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  todayDate = new Date();
  isLoading = false;
  dashboardData: TherapistDashboardData | null = null;
  pendingAssignments: Booking[] = [];
  todayBookings: Booking[] = [];
  assignedChildren: any[] = [];
  activeCases = 0;
  unreadNotifications = 0;
  editingStatus: { [key: number]: boolean } = {};
  updatingStatus: { [key: number]: boolean } = {};
  analytics: TherapistAnalytics | null = null;
  statusValues = [
    { value: 'progressing', label: 'Progressing', color: 'blue' },
    { value: 'stable', label: 'Stable', color: 'green' },
    { value: 'improving', label: 'Improving', color: 'emerald' },
    { value: 'needs_attention', label: 'Needs Attention', color: 'orange' }
  ];
  private subscriptions = new Subscription();

  // Icons
  readonly CalendarIcon = Calendar;
  readonly ClockIcon = Clock;
  readonly UserIcon = UserIcon;
  readonly CheckCircleIcon = CheckCircle;
  readonly XCircleIcon = XCircle;
  readonly AlertCircleIcon = AlertCircle;
  readonly BellIcon = Bell;
  readonly EditIcon = Edit;
  readonly SaveIcon = Save;
  readonly TrendingUpIcon = TrendingUp;
  readonly FileTextIcon = FileText;
  readonly BarChart3Icon = BarChart3;
  readonly PlusIcon = Plus;
  readonly ArrowRightIcon = ArrowRight;
  readonly XIcon = XCircle;
  readonly VideoIcon = Video;
  readonly MapPinIcon = MapPin;

  constructor(
    private authService: AuthService,
    private socketService: SocketService,
    private bookingService: TherapistBookingService,
    private childCaseService: ChildCaseService,
    private analyticsService: TherapistAnalyticsService,
    private dashboardService: TherapistDashboardService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadDashboardData();
    this.setupNotifications();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    
    // Load dashboard data
    this.dashboardService.getDashboard().subscribe({
      next: (response) => {
        if (response.success) {
          this.dashboardData = response.data;
          this.todayBookings = response.data.todaySessions;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard:', error);
        this.isLoading = false;
      }
    });
  }

  loadLatestStatus(childId: number): void {
    this.childCaseService.getCaseUpdates(childId, undefined, 1, 1).subscribe({
      next: (response) => {
        if (response.success && response.data.length > 0) {
          const latestUpdate = response.data[0];
          const child = this.assignedChildren.find(c => c.id === childId);
          if (child) {
            child.current_status = latestUpdate.status || undefined;
          }
        }
      },
      error: (error) => {
        console.error('Error loading latest status:', error);
      }
    });
  }

  startEditingStatus(childId: number): void {
    this.editingStatus[childId] = true;
  }

  cancelEditingStatus(childId: number): void {
    this.editingStatus[childId] = false;
  }

  updateChildStatus(childId: number, status: string): void {
    if (!status) {
      return;
    }

    this.updatingStatus[childId] = true;

    this.childCaseService.updateChildStatus(childId, status).subscribe({
      next: (response) => {
        if (response.success) {
          const child = this.assignedChildren.find(c => c.id === childId);
          if (child) {
            child.current_status = status;
          }
          this.editingStatus[childId] = false;
          // Reload to get updated data
          this.loadLatestStatus(childId);
        }
        this.updatingStatus[childId] = false;
      },
      error: (error) => {
        console.error('Error updating child status:', error);
        alert(error.error?.message || 'Error updating child status');
        this.updatingStatus[childId] = false;
      }
    });
  }

  getStatusColor(status: string | undefined): string {
    if (!status) return 'gray';
    const statusObj = this.statusValues.find(s => s.value === status);
    return statusObj?.color || 'gray';
  }

  getStatusLabel(status: string | undefined): string {
    if (!status) return 'No Status';
    const statusObj = this.statusValues.find(s => s.value === status);
    return statusObj?.label || status;
  }

  setupNotifications(): void {
    // Get initial unread count from signal
    this.unreadNotifications = this.socketService.getUnreadCountSignal()();
    
    // Subscribe to new notifications
    const newNotifSub = this.socketService.getNotifications().subscribe((notification: Notification) => {
      if (notification.type === 'booking_assigned_to_you') {
        // Reload pending assignments when a new one is assigned
        this.loadDashboardData();
      }
      // Update unread count when new notification arrives
      this.unreadNotifications = this.socketService.getUnreadCountSignal()();
    });
    this.subscriptions.add(newNotifSub);
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getModeLabel(mode: string | undefined): string {
    if (!mode) return 'N/A';
    return mode === 'online' ? 'Online' : 'In Centre';
  }

  getAge(dob: string | undefined): string {
    if (!dob) return 'N/A';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age.toString();
  }

  formatDateShort(dateString: string | undefined): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }
}

