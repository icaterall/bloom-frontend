import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BookingService } from '../../../core/services/booking.service';
import { Booking } from '../../../shared/models/booking.model';
import { ChildCaseService, ChildCaseUpdate } from '../../../core/services/child-case.service';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { LucideAngularModule, ArrowLeft, Calendar, Clock, MapPin, Video, CreditCard, User, FileText, CheckCircle, Image, Paperclip, Folder } from 'lucide-angular';

@Component({
  selector: 'app-session-details',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe, LucideAngularModule],
  templateUrl: './session-details.component.html',
  styleUrls: ['./session-details.component.css']
})
export class SessionDetailsComponent implements OnInit {
  booking: Booking | null = null;
  caseUpdate: ChildCaseUpdate | null = null;
  isLoading = false;
  isLoadingOutcomes = false;
  sessionId: number | null = null;
  error: string | null = null;

  readonly ArrowLeftIcon = ArrowLeft;
  readonly CalendarIcon = Calendar;
  readonly ClockIcon = Clock;
  readonly MapPinIcon = MapPin;
  readonly VideoIcon = Video;
  readonly CreditCardIcon = CreditCard;
  readonly UserIcon = User;
  readonly FileTextIcon = FileText;
  readonly CheckCircleIcon = CheckCircle;
  readonly ImageIcon = Image;
  readonly PaperclipIcon = Paperclip;
  readonly FolderIcon = Folder;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookingService: BookingService,
    private childCaseService: ChildCaseService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('sessionId');
      if (id) {
        this.sessionId = parseInt(id, 10);
        this.loadSession();
      }
    });
  }

  loadSession(): void {
    if (!this.sessionId) return;
    
    this.isLoading = true;
    this.error = null;
    this.bookingService.getBookingById(this.sessionId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.booking = response.data;
          this.isLoading = false;
          // Load case update if booking exists and has a child_id
          if (this.booking?.child_id) {
            this.loadCaseUpdate();
          }
        } else {
          this.error = 'Session not found';
          this.isLoading = false;
        }
      },
      error: (error) => {
        console.error('Error loading session:', error);
        this.error = error.error?.message || 'Failed to load session. Please try again.';
        this.isLoading = false;
      }
    });
  }

  loadCaseUpdate(): void {
    if (!this.booking?.child_id || !this.sessionId) return;

    this.isLoadingOutcomes = true;
    // Get case update for this specific booking
    this.childCaseService.getCaseUpdatesForParent(this.booking.child_id, this.sessionId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const updates = Array.isArray(response.data) ? response.data : [response.data];
          this.caseUpdate = updates.length > 0 ? updates[0] : null;
        }
        this.isLoadingOutcomes = false;
      },
      error: (error) => {
        console.error('Error loading case update:', error);
        this.isLoadingOutcomes = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/parent/sessions']);
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
        return 'sessions.status.completed';
      case 'confirmed':
        return 'sessions.status.confirmed';
      case 'awaiting_payment':
        return 'sessions.status.awaitingPayment';
      case 'awaiting_cash_payment':
        return 'sessions.status.awaitingCashPayment';
      case 'awaiting_clinical_review':
        return 'sessions.status.awaitingReview';
      case 'cancelled':
        return 'sessions.status.cancelled';
      case 'no_show':
        return 'sessions.status.noShow';
      default:
        return 'sessions.status.pending';
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

  getAttachmentIcon(type: string): any {
    switch (type) {
      case 'photo':
      case 'image':
        return this.ImageIcon;
      case 'video':
        return this.VideoIcon;
      case 'document':
        return this.FileTextIcon;
      default:
        return this.PaperclipIcon;
    }
  }
}

