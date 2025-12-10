import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StaffService, Staff } from '../../../core/services/staff.service';
import { AddStaffModalComponent } from './add-staff-modal.component';

@Component({
  selector: 'app-staff-list',
  standalone: true,
  imports: [CommonModule, AddStaffModalComponent],
  templateUrl: './staff-list.component.html',
  styleUrls: ['./staff-list.component.css']
})
export class StaffListComponent implements OnInit {
  staff: Staff[] = [];
  isLoading = false;
  showAddStaffModal = false;

  constructor(private staffService: StaffService) {}

  ngOnInit(): void {
    this.loadStaff();
  }

  loadStaff(): void {
    this.isLoading = true;
    this.staffService.getStaff().subscribe({
      next: (response) => {
        if (response.success && Array.isArray(response.data)) {
          this.staff = response.data;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading staff:', error);
        this.isLoading = false;
      }
    });
  }

  openAddStaffModal(): void {
    this.showAddStaffModal = true;
  }

  closeAddStaffModal(): void {
    this.showAddStaffModal = false;
  }

  onStaffAdded(): void {
    this.loadStaff();
    this.closeAddStaffModal();
  }

  toggleStaffStatus(staffMember: Staff): void {
    this.staffService.updateStaff(staffMember.id, { is_active: !staffMember.is_active }).subscribe({
      next: () => {
        this.loadStaff();
      },
      error: (error) => {
        console.error('Error updating staff status:', error);
      }
    });
  }

  getRoleDisplay(role: string): string {
    return role === 'clinical_manager' ? 'Clinical Manager' : 'Therapist';
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-MY', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}
