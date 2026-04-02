import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToursService } from '../../../core/services/tours.service';
import { ToastService } from '../../../core/services/toast.service';
import { Tour, TourStatus } from '../../../shared/models/tour.model';
import {
  backdropAnimation,
  modalPanelAnimation,
} from '../../../shared/animations/modal.animations';

@Component({
  selector: 'app-tours',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tours.component.html',
  animations: [backdropAnimation, modalPanelAnimation],
})
export class ToursComponent implements OnInit {
  /* ───── state ───── */
  tours: Tour[] = [];
  isLoading = false;

  /* ───── modal state ───── */
  showManageModal = false;
  selectedTour: Tour | null = null;
  scheduledDate = '';
  scheduledTime = '';
  internalNote = '';
  isSaving = false;

  constructor(
    private toursService: ToursService,
    private toast: ToastService,
  ) {}

  /* ───── lifecycle ───── */
  ngOnInit(): void {
    this.loadTours();
  }

  /* ───── derived columns (getters) ───── */
  get pendingTours(): Tour[] {
    return this.tours.filter(t => t.status === 'pending');
  }

  get confirmedTours(): Tour[] {
    return this.tours.filter(t => t.status === 'confirmed');
  }

  get completedTours(): Tour[] {
    return this.tours.filter(
      t => t.status === 'completed' || t.status === 'no_show',
    );
  }

  /* ───── data fetching ───── */
  loadTours(): void {
    this.isLoading = true;
    this.toursService.getTours().subscribe({
      next: (res) => {
        this.tours = res.data ?? [];
        this.isLoading = false;
      },
      error: () => {
        this.toast.error('Failed to load tours', 'Please try again.');
        this.isLoading = false;
      },
    });
  }

  /* ───── modal helpers ───── */
  openManageModal(tour: Tour): void {
    this.selectedTour = tour;
    this.internalNote = tour.notes ?? '';

    if (tour.confirmed_start_at) {
      const d = new Date(tour.confirmed_start_at);
      this.scheduledDate = d.toISOString().slice(0, 10);
      this.scheduledTime = d.toTimeString().slice(0, 5);
    } else if (tour.preferred_start_at) {
      const d = new Date(tour.preferred_start_at);
      this.scheduledDate = d.toISOString().slice(0, 10);
      this.scheduledTime = d.toTimeString().slice(0, 5);
    } else {
      this.scheduledDate = '';
      this.scheduledTime = '';
    }

    this.showManageModal = true;
  }

  closeModal(): void {
    this.showManageModal = false;
    this.selectedTour = null;
    this.isSaving = false;
  }

  /* ───── actions ───── */
  confirmTour(): void {
    if (!this.selectedTour || !this.scheduledDate || !this.scheduledTime) return;
    this.isSaving = true;

    const isoDate = new Date(
      `${this.scheduledDate}T${this.scheduledTime}:00`,
    ).toISOString();

    this.toursService
      .updateStatus(this.selectedTour.id, 'confirmed', isoDate)
      .subscribe({
        next: () => {
          this.toast.success('Tour Confirmed', 'The visit has been scheduled.');
          this.closeModal();
          this.loadTours();
        },
        error: () => {
          this.toast.error('Error', 'Could not confirm tour.');
          this.isSaving = false;
        },
      });
  }

  markCompleted(): void {
    if (!this.selectedTour) return;
    this.isSaving = true;
    this.toursService
      .updateStatus(this.selectedTour.id, 'completed')
      .subscribe({
        next: () => {
          this.toast.success('Completed', 'Tour marked as completed.');
          this.closeModal();
          this.loadTours();
        },
        error: () => {
          this.toast.error('Error', 'Could not update tour.');
          this.isSaving = false;
        },
      });
  }

  markNoShow(): void {
    if (!this.selectedTour) return;
    this.isSaving = true;
    this.toursService
      .updateStatus(this.selectedTour.id, 'no_show')
      .subscribe({
        next: () => {
          this.toast.success('No-Show', 'Tour marked as no-show.');
          this.closeModal();
          this.loadTours();
        },
        error: () => {
          this.toast.error('Error', 'Could not update tour.');
          this.isSaving = false;
        },
      });
  }

  saveNote(): void {
    if (!this.selectedTour || !this.internalNote.trim()) return;
    this.isSaving = true;
    this.toursService
      .addNote(this.selectedTour.id, this.internalNote.trim())
      .subscribe({
        next: () => {
          this.toast.success('Note Saved', 'Internal note updated.');
          this.isSaving = false;
          this.loadTours();
        },
        error: () => {
          this.toast.error('Error', 'Could not save note.');
          this.isSaving = false;
        },
      });
  }

  /* ───── display helpers ───── */
  formatDate(iso: string | undefined): string {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleDateString('en-MY', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  formatTime(iso: string | undefined): string {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleTimeString('en-MY', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  formatDateTime(iso: string | undefined): string {
    if (!iso) return '—';
    return `${this.formatDate(iso)}, ${this.formatTime(iso)}`;
  }

  getStatusLabel(status: TourStatus): string {
    const map: Record<TourStatus, string> = {
      pending: 'Pending',
      confirmed: 'Scheduled',
      completed: 'Completed',
      no_show: 'No-Show',
    };
    return map[status] ?? status;
  }

  getStatusClass(status: TourStatus): string {
    const map: Record<TourStatus, string> = {
      pending: 'bg-amber-50 text-amber-700 border border-amber-200',
      confirmed: 'bg-blue-50 text-blue-700 border border-blue-200',
      completed: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
      no_show: 'bg-gray-100 text-gray-500 border border-gray-200',
    };
    return map[status] ?? '';
  }
}
