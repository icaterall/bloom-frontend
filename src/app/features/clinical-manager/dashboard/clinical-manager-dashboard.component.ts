import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../shared/models/user.model';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-clinical-manager-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe],
  templateUrl: './clinical-manager-dashboard.component.html',
  styleUrls: ['./clinical-manager-dashboard.component.css']
})
export class ClinicalManagerDashboardComponent implements OnInit {
  currentUser: User | null = null;
  isLoading = false;
  todayDate = new Date();

  // KPI Data
  dashboardMetrics = {
    newPaidBookings: 5,
    sessionsToday: 12,
    waitingForAssessment: 3,
    noShowsThisWeek: 2
  };

  // Pending Bookings
  pendingBookings = [
    {
      id: 1,
      childName: 'Ahmad bin Ali',
      childAge: 5,
      parentName: 'Puan Siti',
      sessionType: 'Initial Assessment',
      mode: 'In-centre',
      preferredTime: '2024-12-10 10:00',
      paidAmount: 150,
      status: 'Paid, awaiting review'
    },
    {
      id: 2,
      childName: 'Sarah Lee',
      childAge: 4,
      parentName: 'Mrs. Lee',
      sessionType: 'Initial Assessment',
      mode: 'Online',
      preferredTime: '2024-12-11 14:00',
      paidAmount: 150,
      status: 'Paid, awaiting review'
    }
  ];

  // Today's Sessions
  todaySessions = [
    {
      time: '09:00-10:00',
      childName: 'Ali Rahman',
      therapist: 'Dr. Sarah',
      mode: 'In-centre',
      status: 'Scheduled'
    },
    {
      time: '10:00-11:00',
      childName: 'Emma Wong',
      therapist: 'Ms. Fatimah',
      mode: 'Online',
      status: 'In progress'
    },
    {
      time: '11:00-12:00',
      childName: 'Zain Ismail',
      therapist: 'Dr. Sarah',
      mode: 'In-centre',
      status: 'Scheduled'
    }
  ];

  // Therapist Workload
  therapistWorkload = [
    {
      name: 'Dr. Sarah Johnson',
      todaySessions: 5,
      thisWeek: 18,
      newChildren: 3,
      load: 'High'
    },
    {
      name: 'Ms. Fatimah Ahmad',
      todaySessions: 4,
      thisWeek: 15,
      newChildren: 2,
      load: 'Normal'
    },
    {
      name: 'Mr. John Tan',
      todaySessions: 3,
      thisWeek: 12,
      newChildren: 1,
      load: 'Light'
    }
  ];

  // Alerts
  alerts = [
    {
      type: 'warning',
      message: 'Child "Ahmad bin Ali" has been waiting for initial assessment for 16 days',
      action: 'View child'
    },
    {
      type: 'danger',
      message: 'Child "Sarah Lee" had 3 no-shows in the last month',
      action: 'View child'
    },
    {
      type: 'info',
      message: 'Session completed but notes missing after 24 hours - Dr. Sarah',
      action: 'View session'
    }
  ];

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    // TODO: Call API to get real dashboard data
    // For now using mock data
    setTimeout(() => {
      this.isLoading = false;
    }, 500);
  }

  getLoadClass(load: string): string {
    switch (load) {
      case 'Light': return 'bg-green-100 text-green-800';
      case 'Normal': return 'bg-blue-100 text-blue-800';
      case 'High': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Scheduled': return 'bg-blue-100 text-blue-800';
      case 'In progress': return 'bg-green-100 text-green-800';
      case 'Completed': return 'bg-gray-100 text-gray-800';
      case 'No-show': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getAlertClass(type: string): string {
    switch (type) {
      case 'warning': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'danger': return 'bg-red-50 border-red-200 text-red-800';
      case 'info': return 'bg-blue-50 border-blue-200 text-blue-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  }

  approveBooking(bookingId: number): void {
    console.log('Approve booking:', bookingId);
    // TODO: Open modal to assign therapist
  }

  rejectBooking(bookingId: number): void {
    console.log('Reject booking:', bookingId);
    // TODO: Open modal to provide reason
  }

  viewBookingDetails(bookingId: number): void {
    console.log('View booking details:', bookingId);
    // TODO: Navigate to booking details or open modal
  }
}
