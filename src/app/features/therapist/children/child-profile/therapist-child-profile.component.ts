import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TherapistBookingService } from '../../../../core/services/therapist-booking.service';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { LucideAngularModule, ArrowLeft, User, Calendar, Clock, MapPin, Video, FileText, Plus, AlertCircle, CheckCircle, XCircle, Phone, Mail } from 'lucide-angular';

interface ChildData {
  id: number;
  full_name: string;
  date_of_birth: string;
  gender?: string;
  primary_language?: string;
  other_languages?: string;
  diagnosis_status?: string;
  diagnosis_details?: string;
  main_concerns?: string;
  family_goals?: string;
  child_status?: string;
  school_status?: string;
  parent_id: number;
  parent_name: string;
  parent_email?: string;
  parent_mobile?: string;
  parent_preferred_language?: string;
}

interface Session {
  id: number;
  booking_type: string;
  booking_type_name?: string;
  status: string;
  confirmed_start_at?: string;
  confirmed_end_at?: string;
  preferred_start_at?: string;
  mode?: string;
  online_meeting_link?: string;
  created_at: string;
}

interface ProgressUpdate {
  id: number;
  update_type: string;
  title?: string;
  body: string;
  status: string;
  published_at?: string;
  created_at: string;
  booking_type_name?: string;
  media?: any[];
}

@Component({
  selector: 'app-therapist-child-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe, LucideAngularModule],
  templateUrl: './therapist-child-profile.component.html',
  styleUrls: ['./therapist-child-profile.component.css']
})
export class TherapistChildProfileComponent implements OnInit {
  child: ChildData | null = null;
  sessions: Session[] = [];
  progressUpdates: ProgressUpdate[] = [];
  isLoading = false;
  error: string | null = null;
  childId: number | null = null;

  // Icons
  readonly ArrowLeftIcon = ArrowLeft;
  readonly UserIcon = User;
  readonly CalendarIcon = Calendar;
  readonly ClockIcon = Clock;
  readonly MapPinIcon = MapPin;
  readonly VideoIcon = Video;
  readonly FileTextIcon = FileText;
  readonly PlusIcon = Plus;
  readonly AlertCircleIcon = AlertCircle;
  readonly CheckCircleIcon = CheckCircle;
  readonly XCircleIcon = XCircle;
  readonly PhoneIcon = Phone;
  readonly MailIcon = Mail;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookingService: TherapistBookingService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('childId');
      if (id) {
        this.childId = parseInt(id, 10);
        this.loadChildProfile();
      }
    });
  }

  loadChildProfile(): void {
    if (!this.childId) return;

    this.isLoading = true;
    this.error = null;

    this.bookingService.getChildById(this.childId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.child = response.data.child;
          this.sessions = response.data.sessions || [];
          this.progressUpdates = response.data.progressUpdates || [];
        } else {
          this.error = 'Failed to load child profile';
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading child profile:', error);
        this.error = error.error?.message || 'Failed to load child profile. Please try again.';
        this.isLoading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/therapist/children']);
  }

  addUpdate(): void {
    if (this.childId) {
      this.router.navigate(['/therapist/updates/new'], {
        queryParams: { childId: this.childId }
      });
    }
  }

  calculateAge(dob: string | undefined): string {
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

  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  formatDateTime(dateString: string | undefined): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
        return 'therapistChildProfile.status.completed';
      case 'confirmed':
        return 'therapistChildProfile.status.confirmed';
      case 'awaiting_payment':
        return 'therapistChildProfile.status.awaitingPayment';
      case 'awaiting_cash_payment':
        return 'therapistChildProfile.status.awaitingCashPayment';
      case 'awaiting_clinical_review':
        return 'therapistChildProfile.status.awaitingReview';
      case 'cancelled':
        return 'therapistChildProfile.status.cancelled';
      case 'no_show':
        return 'therapistChildProfile.status.noShow';
      default:
        return 'therapistChildProfile.status.pending';
    }
  }

  getDiagnosisStatusLabel(status?: string): string {
    switch (status) {
      case 'autism':
        return 'therapistChildProfile.diagnosis.autism';
      case 'gdd':
        return 'therapistChildProfile.diagnosis.gdd';
      case 'suspected':
        return 'therapistChildProfile.diagnosis.suspected';
      case 'none':
        return 'therapistChildProfile.diagnosis.none';
      case 'unknown':
        return 'therapistChildProfile.diagnosis.unknown';
      default:
        return 'therapistChildProfile.diagnosis.unknown';
    }
  }

  getUpdateTypeLabel(type: string): string {
    switch (type) {
      case 'session_summary':
        return 'therapistChildProfile.updateType.sessionSummary';
      case 'weekly_note':
        return 'therapistChildProfile.updateType.weeklyNote';
      case 'milestone':
        return 'therapistChildProfile.updateType.milestone';
      case 'home_activity':
        return 'therapistChildProfile.updateType.homeActivity';
      case 'incident':
        return 'therapistChildProfile.updateType.incident';
      default:
        return type;
    }
  }
}

