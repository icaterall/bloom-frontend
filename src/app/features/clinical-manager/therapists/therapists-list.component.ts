import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, Search, User, Mail, Phone, Calendar, Users, ChevronRight, Eye, X, Activity, CheckCircle, XCircle, Clock, Baby } from 'lucide-angular';
import { ClinicalManagerTherapistsService, Therapist, TherapistWithDetails } from '../../../core/services/clinical-manager-therapists.service';

@Component({
  selector: 'app-therapists-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    LucideAngularModule
  ],
  templateUrl: './therapists-list.component.html',
  styleUrls: ['./therapists-list.component.css']
})
export class TherapistsListComponent implements OnInit {
  therapists: Therapist[] = [];
  isLoading = false;
  searchTerm = '';
  currentPage = 1;
  limit = 20;
  total = 0;
  totalPages = 0;
  
  // Modal state
  showTherapistModal = false;
  selectedTherapist: TherapistWithDetails | null = null;
  isLoadingTherapistDetails = false;
  
  // Icons
  readonly SearchIcon = Search;
  readonly UserIcon = User;
  readonly MailIcon = Mail;
  readonly PhoneIcon = Phone;
  readonly CalendarIcon = Calendar;
  readonly UsersIcon = Users;
  readonly ChevronRightIcon = ChevronRight;
  readonly EyeIcon = Eye;
  readonly XIcon = X;
  readonly ActivityIcon = Activity;
  readonly CheckCircleIcon = CheckCircle;
  readonly XCircleIcon = XCircle;
  readonly ClockIcon = Clock;
  readonly BabyIcon = Baby;

  constructor(
    private therapistsService: ClinicalManagerTherapistsService
  ) {}

  ngOnInit(): void {
    this.loadTherapists();
  }

  loadTherapists(): void {
    this.isLoading = true;
    this.therapistsService.getTherapists(this.searchTerm, this.currentPage, this.limit).subscribe({
      next: (response) => {
        if (response.success) {
          this.therapists = response.data || [];
          this.total = response.pagination?.total || 0;
          this.totalPages = response.pagination?.totalPages || 0;
        } else {
          this.therapists = [];
          this.total = 0;
          this.totalPages = 0;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading therapists:', error);
        this.therapists = [];
        this.total = 0;
        this.totalPages = 0;
        this.isLoading = false;
        if (error.error?.message) {
          console.error('Error details:', error.error.message);
        }
      }
    });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadTherapists();
  }

  onSearchClear(): void {
    this.searchTerm = '';
    this.currentPage = 1;
    this.loadTherapists();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadTherapists();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  formatDateTime(dateString: string | undefined): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPages = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxPages / 2));
    let endPage = Math.min(this.totalPages, startPage + maxPages - 1);
    
    if (endPage - startPage < maxPages - 1) {
      startPage = Math.max(1, endPage - maxPages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  viewTherapistDetails(therapistId: number): void {
    this.isLoadingTherapistDetails = true;
    this.showTherapistModal = true;
    this.selectedTherapist = null;
    
    this.therapistsService.getTherapistById(therapistId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.selectedTherapist = response.data;
        } else {
          alert('Failed to load therapist details');
          this.closeTherapistModal();
        }
        this.isLoadingTherapistDetails = false;
      },
      error: (error) => {
        console.error('Error loading therapist details:', error);
        alert(error.error?.message || 'Failed to load therapist details. Please try again.');
        this.isLoadingTherapistDetails = false;
        this.closeTherapistModal();
      }
    });
  }

  closeTherapistModal(): void {
    this.showTherapistModal = false;
    this.selectedTherapist = null;
    this.isLoadingTherapistDetails = false;
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'confirmed':
        return 'status-confirmed';
      case 'completed':
        return 'status-completed';
      case 'cancelled':
        return 'status-cancelled';
      case 'no_show':
        return 'status-no-show';
      default:
        return 'status-pending';
    }
  }
}

