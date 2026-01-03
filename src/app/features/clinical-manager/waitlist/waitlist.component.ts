import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, Search, User, Mail, Phone, Calendar, Users, Eye, X, Baby, Clock, CheckCircle, AlertCircle } from 'lucide-angular';
import { ClinicalManagerWaitlistService, WaitlistChild } from '../../../core/services/clinical-manager-waitlist.service';

@Component({
  selector: 'app-waitlist',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    LucideAngularModule
  ],
  templateUrl: './waitlist.component.html',
  styleUrls: ['./waitlist.component.css']
})
export class WaitlistComponent implements OnInit {
  waitlist: WaitlistChild[] = [];
  isLoading = false;
  searchTerm = '';
  currentPage = 1;
  limit = 20;
  total = 0;
  totalPages = 0;
  
  // Modal state
  showChildModal = false;
  selectedChild: (WaitlistChild & { bookings?: any[] }) | null = null;
  isLoadingChildDetails = false;
  showStatusUpdateModal = false;
  newStatus: 'not_enrolled' | 'in_assessment' | 'enrolled' | '' = '';
  isUpdatingStatus = false;
  
  // Icons
  readonly SearchIcon = Search;
  readonly UserIcon = User;
  readonly MailIcon = Mail;
  readonly PhoneIcon = Phone;
  readonly CalendarIcon = Calendar;
  readonly UsersIcon = Users;
  readonly EyeIcon = Eye;
  readonly XIcon = X;
  readonly BabyIcon = Baby;
  readonly ClockIcon = Clock;
  readonly CheckCircleIcon = CheckCircle;
  readonly AlertCircleIcon = AlertCircle;

  constructor(
    private waitlistService: ClinicalManagerWaitlistService
  ) {}

  ngOnInit(): void {
    this.loadWaitlist();
  }

  loadWaitlist(): void {
    this.isLoading = true;
    this.waitlistService.getWaitlist(this.searchTerm, this.currentPage, this.limit).subscribe({
      next: (response) => {
        if (response.success) {
          this.waitlist = response.data || [];
          this.total = response.pagination?.total || 0;
          this.totalPages = response.pagination?.totalPages || 0;
        } else {
          this.waitlist = [];
          this.total = 0;
          this.totalPages = 0;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading waitlist:', error);
        this.waitlist = [];
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
    this.loadWaitlist();
  }

  onSearchClear(): void {
    this.searchTerm = '';
    this.currentPage = 1;
    this.loadWaitlist();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadWaitlist();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  calculateAge(dateOfBirth: string | undefined): number {
    if (!dateOfBirth) return 0;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
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

  viewChildDetails(childId: number): void {
    this.isLoadingChildDetails = true;
    this.showChildModal = true;
    this.selectedChild = null;
    
    this.waitlistService.getWaitlistChildById(childId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.selectedChild = response.data;
        } else {
          alert('Failed to load child details');
          this.closeChildModal();
        }
        this.isLoadingChildDetails = false;
      },
      error: (error) => {
        console.error('Error loading child details:', error);
        alert(error.error?.message || 'Failed to load child details. Please try again.');
        this.isLoadingChildDetails = false;
        this.closeChildModal();
      }
    });
  }

  closeChildModal(): void {
    this.showChildModal = false;
    this.selectedChild = null;
    this.isLoadingChildDetails = false;
    this.showStatusUpdateModal = false;
    this.newStatus = '';
  }

  openStatusUpdateModal(): void {
    this.showStatusUpdateModal = true;
    this.newStatus = '';
  }

  closeStatusUpdateModal(): void {
    this.showStatusUpdateModal = false;
    this.newStatus = '';
  }

  updateChildStatus(): void {
    if (!this.selectedChild || !this.newStatus) {
      return;
    }

    this.isUpdatingStatus = true;
    this.waitlistService.updateWaitlistStatus(this.selectedChild.id!, this.newStatus as 'not_enrolled' | 'in_assessment' | 'enrolled').subscribe({
      next: (response) => {
        if (response.success) {
          alert(`Child status updated to ${this.newStatus.replace('_', ' ')}`);
          this.closeChildModal();
          this.loadWaitlist(); // Reload waitlist
        } else {
          alert('Failed to update child status');
        }
        this.isUpdatingStatus = false;
      },
      error: (error) => {
        console.error('Error updating child status:', error);
        alert(error.error?.message || 'Failed to update child status. Please try again.');
        this.isUpdatingStatus = false;
      }
    });
  }

  getDaysOnWaitlistClass(days: number): string {
    if (days >= 90) return 'days-long';
    if (days >= 60) return 'days-medium';
    return 'days-short';
  }
}

