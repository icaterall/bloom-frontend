import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, Search, User, Mail, Phone, Calendar, Users, ChevronRight, Eye } from 'lucide-angular';
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
  
  // Icons
  readonly SearchIcon = Search;
  readonly UserIcon = User;
  readonly MailIcon = Mail;
  readonly PhoneIcon = Phone;
  readonly CalendarIcon = Calendar;
  readonly UsersIcon = Users;
  readonly ChevronRightIcon = ChevronRight;
  readonly EyeIcon = Eye;

  constructor(private parentService: ParentService) {}

  ngOnInit(): void {
    this.loadParents();
  }

  loadParents(): void {
    this.isLoading = true;
    this.parentService.getParents(this.searchTerm, this.currentPage, this.limit).subscribe({
      next: (response) => {
        if (response.success) {
          this.parents = response.data;
          this.total = response.pagination.total;
          this.totalPages = response.pagination.totalPages;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading parents:', error);
        this.isLoading = false;
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

  calculateAge(dateOfBirth: string): number {
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

  formatDate(dateString: string): string {
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
    // TODO: Navigate to parent detail page or open modal
    console.log('View parent details:', parentId);
    // For now, just show an alert
    alert(`Parent ID: ${parentId}\n\nDetailed view coming soon!`);
  }
}

