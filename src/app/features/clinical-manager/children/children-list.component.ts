import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { LucideAngularModule, Search, User, Mail, Phone, Calendar, Users, ChevronRight, Eye, X, Baby } from 'lucide-angular';
import { ClinicalManagerChildrenService, ChildWithParent } from '../../../core/services/clinical-manager-children.service';

@Component({
  selector: 'app-children-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    LucideAngularModule
  ],
  templateUrl: './children-list.component.html',
  styleUrls: ['./children-list.component.css']
})
export class ChildrenListComponent implements OnInit {
  children: ChildWithParent[] = [];
  isLoading = false;
  searchTerm = '';
  currentPage = 1;
  limit = 20;
  total = 0;
  totalPages = 0;
  
  // Modal state
  showChildModal = false;
  selectedChild: ChildWithParent | null = null;
  isLoadingChildDetails = false;
  
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
  readonly BabyIcon = Baby;

  constructor(
    private childrenService: ClinicalManagerChildrenService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadChildren();
  }

  loadChildren(): void {
    this.isLoading = true;
    this.childrenService.getChildren(this.searchTerm, this.currentPage, this.limit).subscribe({
      next: (response) => {
        console.log('Children API Response:', response);
        if (response.success) {
          this.children = response.data || [];
          this.total = response.pagination?.total || 0;
          this.totalPages = response.pagination?.totalPages || 0;
          console.log(`Loaded ${this.children.length} children, total: ${this.total}`);
        } else {
          console.warn('API returned success: false', response);
          this.children = [];
          this.total = 0;
          this.totalPages = 0;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading children:', error);
        console.error('Error status:', error.status);
        console.error('Error message:', error.message);
        console.error('Error details:', error.error);
        this.children = [];
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
    this.loadChildren();
  }

  onSearchClear(): void {
    this.searchTerm = '';
    this.currentPage = 1;
    this.loadChildren();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadChildren();
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
    
    this.childrenService.getChildById(childId).subscribe({
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
  }

  getStatusBadgeClass(status: string | undefined): string {
    if (!status) return '';
    switch (status) {
      case 'not_enrolled':
        return 'status-not-enrolled';
      case 'in_assessment':
        return 'status-in-assessment';
      case 'enrolled':
        return 'status-enrolled';
      case 'on_waitlist':
        return 'status-waitlist';
      default:
        return '';
    }
  }
}

