import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TherapistBookingService } from '../../../core/services/therapist-booking.service';
import { ChildCaseService } from '../../../core/services/child-case.service';
import { LucideAngularModule, User, Calendar, FileText, TrendingUp, AlertCircle, CheckCircle, Edit, Save, X } from 'lucide-angular';

interface AssignedChild {
  id: number;
  name: string;
  dob?: string;
  gender?: string;
  parent_id: number;
  parent_name?: string;
  parent_email?: string;
  parent_mobile?: string;
  bookings_count: number;
  last_session_date?: string;
  first_assigned_date?: string;
  current_status?: string;
}

@Component({
  selector: 'app-therapist-cases',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LucideAngularModule],
  templateUrl: './therapist-cases.component.html',
  styleUrls: ['./therapist-cases.component.css']
})
export class TherapistCasesComponent implements OnInit {
  children: AssignedChild[] = [];
  isLoading = false;
  error: string | null = null;
  editingStatus: { [key: number]: boolean } = {};
  statusValues = [
    { value: 'progressing', label: 'Progressing', color: 'blue' },
    { value: 'stable', label: 'Stable', color: 'green' },
    { value: 'improving', label: 'Improving', color: 'emerald' },
    { value: 'needs_attention', label: 'Needs Attention', color: 'orange' }
  ];
  updatingStatus: { [key: number]: boolean } = {};

  // Icons
  readonly UserIcon = User;
  readonly CalendarIcon = Calendar;
  readonly FileTextIcon = FileText;
  readonly TrendingUpIcon = TrendingUp;
  readonly AlertCircleIcon = AlertCircle;
  readonly CheckCircleIcon = CheckCircle;
  readonly EditIcon = Edit;
  readonly SaveIcon = Save;
  readonly XIcon = X;

  constructor(
    private bookingService: TherapistBookingService,
    private childCaseService: ChildCaseService
  ) {}

  ngOnInit(): void {
    this.loadChildren();
  }

  loadChildren(): void {
    this.isLoading = true;
    this.error = null;

    this.bookingService.getMyChildren().subscribe({
      next: (response) => {
        if (response.success) {
          this.children = response.data.map((child: any) => ({
            ...child,
            current_status: this.getLatestStatus(child.id)
          }));
          // Load latest status for each child
          this.children.forEach(child => {
            this.loadLatestStatus(child.id);
          });
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading children:', error);
        this.error = error.error?.message || 'Error loading children';
        this.isLoading = false;
      }
    });
  }

  loadLatestStatus(childId: number): void {
    this.childCaseService.getCaseUpdates(childId, undefined, 1, 1).subscribe({
      next: (response) => {
        if (response.success && response.data.length > 0) {
          const latestUpdate = response.data[0];
          const child = this.children.find(c => c.id === childId);
          if (child) {
            child.current_status = latestUpdate.status || undefined;
          }
        }
      },
      error: (error) => {
        console.error('Error loading latest status:', error);
      }
    });
  }

  getLatestStatus(childId: number): string | undefined {
    // This will be populated by loadLatestStatus
    return undefined;
  }

  startEditingStatus(childId: number): void {
    this.editingStatus[childId] = true;
  }

  cancelEditingStatus(childId: number): void {
    this.editingStatus[childId] = false;
  }

  updateChildStatus(childId: number, status: string): void {
    if (!status) {
      return;
    }

    this.updatingStatus[childId] = true;

    this.childCaseService.updateChildStatus(childId, status).subscribe({
      next: (response) => {
        if (response.success) {
          const child = this.children.find(c => c.id === childId);
          if (child) {
            child.current_status = status;
          }
          this.editingStatus[childId] = false;
          // Reload to get updated data
          this.loadLatestStatus(childId);
        }
        this.updatingStatus[childId] = false;
      },
      error: (error) => {
        console.error('Error updating child status:', error);
        alert(error.error?.message || 'Error updating child status');
        this.updatingStatus[childId] = false;
      }
    });
  }

  getStatusColor(status: string | undefined): string {
    if (!status) return 'gray';
    const statusObj = this.statusValues.find(s => s.value === status);
    return statusObj?.color || 'gray';
  }

  getStatusLabel(status: string | undefined): string {
    if (!status) return 'No Status';
    const statusObj = this.statusValues.find(s => s.value === status);
    return statusObj?.label || status;
  }

  getAge(dob: string | undefined): string {
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
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  viewChildCase(childId: number): void {
    // This will be handled by routerLink in template
  }
}
