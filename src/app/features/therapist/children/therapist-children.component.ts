import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TherapistBookingService } from '../../../core/services/therapist-booking.service';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { LucideAngularModule, Search, User, Calendar, ArrowRight, Users } from 'lucide-angular';

interface TherapistChild {
  id: number;
  name: string;
  dob: string;
  gender?: string;
  parent_id: number;
  parent_name: string;
  parent_email?: string;
  parent_mobile?: string;
  bookings_count: number;
  last_session_date?: string;
  first_assigned_date?: string;
}

@Component({
  selector: 'app-therapist-children',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TranslatePipe, LucideAngularModule],
  templateUrl: './therapist-children.component.html',
  styleUrls: ['./therapist-children.component.css']
})
export class TherapistChildrenComponent implements OnInit {
  children: TherapistChild[] = [];
  filteredChildren: TherapistChild[] = [];
  searchQuery = '';
  isLoading = false;
  error: string | null = null;

  // Icons
  readonly SearchIcon = Search;
  readonly UserIcon = User;
  readonly CalendarIcon = Calendar;
  readonly ArrowRightIcon = ArrowRight;
  readonly UsersIcon = Users;

  constructor(private bookingService: TherapistBookingService) {}

  ngOnInit(): void {
    this.loadChildren();
  }

  loadChildren(): void {
    this.isLoading = true;
    this.error = null;

    this.bookingService.getMyChildren().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.children = response.data;
          this.filteredChildren = this.children;
        } else {
          this.error = 'Failed to load children';
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading children:', error);
        this.error = error.error?.message || 'Failed to load children. Please try again.';
        this.isLoading = false;
      }
    });
  }

  onSearchChange(): void {
    if (!this.searchQuery.trim()) {
      this.filteredChildren = this.children;
      return;
    }

    const query = this.searchQuery.toLowerCase().trim();
    this.filteredChildren = this.children.filter(child =>
      child.name.toLowerCase().includes(query) ||
      child.parent_name.toLowerCase().includes(query)
    );
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
}

