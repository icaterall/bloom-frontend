import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TherapistSessionsService } from '../../../../core/services/therapist-sessions.service';
import { ChildCaseService } from '../../../../core/services/child-case.service';
import { Booking } from '../../../../shared/models/booking.model';
import { Child } from '../../../../shared/models/child.model';
import { ChildCaseUpdate } from '../../../../core/services/child-case.service';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { LucideAngularModule, ArrowLeft, Calendar, Clock, MapPin, Video, User, FileText, CheckCircle, XCircle, AlertCircle, Plus, Image, Paperclip, Folder, Upload } from 'lucide-angular';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-session-details',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TranslatePipe, LucideAngularModule],
  templateUrl: './session-details.component.html',
  styleUrls: ['./session-details.component.css']
})
export class SessionDetailsComponent implements OnInit {
  booking: Booking | null = null;
  child: Child | null = null;
  previousUpdates: ChildCaseUpdate[] = [];
  isLoading = false;
  error: string | null = null;
  successMessage: string | null = null;
  bookingId: number | null = null;

  // Action modals
  showMarkCompletedModal = false;
  showMarkNoShowModal = false;
  showAddUpdateModal = false;
  isSubmitting = false;

  // Icons
  readonly ArrowLeftIcon = ArrowLeft;
  readonly CalendarIcon = Calendar;
  readonly ClockIcon = Clock;
  readonly MapPinIcon = MapPin;
  readonly VideoIcon = Video;
  readonly UserIcon = User;
  readonly FileTextIcon = FileText;
  readonly CheckCircleIcon = CheckCircle;
  readonly XCircleIcon = XCircle;
  readonly AlertCircleIcon = AlertCircle;
  readonly PlusIcon = Plus;
  readonly ImageIcon = Image;
  readonly PaperclipIcon = Paperclip;
  readonly FolderIcon = Folder;
  readonly UploadIcon = Upload;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private sessionsService: TherapistSessionsService,
    private childCaseService: ChildCaseService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('bookingId');
      if (id) {
        this.bookingId = parseInt(id, 10);
        this.loadSessionDetails();
      }
    });
  }

  loadSessionDetails(): void {
    if (!this.bookingId) return;

    this.isLoading = true;
    this.error = null;
    this.successMessage = null;

    this.sessionsService.getSessionById(this.bookingId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.booking = response.data.booking;
          this.child = response.data.child;
          this.previousUpdates = response.data.previousUpdates || [];
        } else {
          this.error = 'Failed to load session details';
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading session details:', error);
        this.error = error.error?.message || 'Failed to load session details. Please try again.';
        this.isLoading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/therapist/sessions']);
  }

  markCompleted(): void {
    if (!this.bookingId) return;

    this.isSubmitting = true;
    this.sessionsService.markCompleted(this.bookingId).subscribe({
      next: (response) => {
        if (response.success) {
          this.showMarkCompletedModal = false;
          this.successMessage = response.message || 'Session marked as completed successfully';
          setTimeout(() => this.successMessage = null, 3000);
          // Reload session details to get updated status
          this.loadSessionDetails();
        } else {
          this.error = 'Failed to mark session as completed';
          this.isSubmitting = false;
        }
      },
      error: (error) => {
        console.error('Error marking session as completed:', error);
        this.error = error.error?.message || 'Failed to mark session as completed. Please try again.';
        this.isSubmitting = false;
      }
    });
  }

  markNoShow(): void {
    if (!this.bookingId) return;

    this.isSubmitting = true;
    this.sessionsService.markNoShow(this.bookingId).subscribe({
      next: (response) => {
        if (response.success) {
          this.showMarkNoShowModal = false;
          this.successMessage = response.message || 'Session marked as no-show successfully';
          setTimeout(() => this.successMessage = null, 3000);
          // Reload session details to get updated status
          this.loadSessionDetails();
        } else {
          this.error = 'Failed to mark session as no-show';
          this.isSubmitting = false;
        }
      },
      error: (error) => {
        console.error('Error marking session as no-show:', error);
        this.error = error.error?.message || 'Failed to mark session as no-show. Please try again.';
        this.isSubmitting = false;
      }
    });
  }

  openAddUpdate(): void {
    if (this.child?.id) {
      this.router.navigate(['/therapist/updates/new'], {
        queryParams: { 
          childId: this.child.id,
          bookingId: this.bookingId 
        }
      });
    }
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
        return 'therapistSessionDetails.status.confirmed';
      case 'completed':
        return 'therapistSessionDetails.status.completed';
      case 'cancelled':
        return 'therapistSessionDetails.status.cancelled';
      case 'no_show':
        return 'therapistSessionDetails.status.noShow';
      default:
        return 'therapistSessionDetails.status.pending';
    }
  }

  getDiagnosisStatusLabel(status?: string): string {
    switch (status) {
      case 'autism':
        return 'therapistSessionDetails.diagnosis.autism';
      case 'gdd':
        return 'therapistSessionDetails.diagnosis.gdd';
      case 'suspected':
        return 'therapistSessionDetails.diagnosis.suspected';
      case 'none':
        return 'therapistSessionDetails.diagnosis.none';
      default:
        return 'therapistSessionDetails.diagnosis.unknown';
    }
  }

  getAttachmentIcon(type: string): any {
    switch (type) {
      case 'photo':
        return this.ImageIcon;
      case 'video':
        return this.VideoIcon;
      case 'document':
        return this.FileTextIcon;
      default:
        return this.PaperclipIcon;
    }
  }

  getGoalsArray(goals: string | string[] | undefined): string[] {
    if (!goals) return [];
    if (Array.isArray(goals)) return goals;
    try {
      return JSON.parse(goals);
    } catch (e) {
      return [goals];
    }
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
}

