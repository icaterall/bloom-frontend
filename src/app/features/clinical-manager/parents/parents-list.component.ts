import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { LucideAngularModule, Search, User, Mail, Phone, Calendar, Users, ChevronRight, Eye, X } from 'lucide-angular';
import { ParentService, Parent } from '../../../core/services/parent.service';

@Component({
  selector: 'app-parents-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    LucideAngularModule
  ],
  templateUrl: './parents-list.component.html',
  styleUrls: ['./parents-list.component.css']
})
export class ParentsListComponent implements OnInit {
  parents: Parent[] = [];
  isLoading = false;
  searchTerm = '';
  currentPage = 1;
  limit = 20;
  total = 0;
  totalPages = 0;
  
  // Modal state
  showParentModal = false;
  selectedParent: Parent | null = null;
  isLoadingParentDetails = false;
  
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

  constructor(
    private parentService: ParentService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadParents();
  }

  loadParents(): void {
    this.isLoading = true;
    this.parentService.getParents(this.searchTerm, this.currentPage, this.limit).subscribe({
      next: (response) => {
        console.log('Parents API Response:', response);
        if (response.success) {
          this.parents = response.data || [];
          this.total = response.pagination?.total || 0;
          this.totalPages = response.pagination?.totalPages || 0;
          console.log(`Loaded ${this.parents.length} parents, total: ${this.total}`);
        } else {
          console.warn('API returned success: false', response);
          this.parents = [];
          this.total = 0;
          this.totalPages = 0;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading parents:', error);
        console.error('Error status:', error.status);
        console.error('Error message:', error.message);
        console.error('Error details:', error.error);
        this.parents = [];
        this.total = 0;
        this.totalPages = 0;
        this.isLoading = false;
        // Show user-friendly error message if needed
        if (error.error?.message) {
          console.error('Error details:', error.error.message);
        }
      }
    });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadParents();
  }

  onSearchClear(): void {
    this.searchTerm = '';
    this.currentPage = 1;
    this.loadParents();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadParents();
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

  viewParentDetails(parentId: number): void {
    this.isLoadingParentDetails = true;
    this.showParentModal = true;
    this.selectedParent = null;
    
    this.parentService.getParentById(parentId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.selectedParent = response.data;
        } else {
          alert('Failed to load parent details');
          this.closeParentModal();
        }
        this.isLoadingParentDetails = false;
      },
      error: (error) => {
        console.error('Error loading parent details:', error);
        alert(error.error?.message || 'Failed to load parent details. Please try again.');
        this.isLoadingParentDetails = false;
        this.closeParentModal();
      }
    });
  }

  closeParentModal(): void {
    this.showParentModal = false;
    this.selectedParent = null;
    this.isLoadingParentDetails = false;
  }
}

