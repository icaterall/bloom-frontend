import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TherapistAvailabilityService, AvailabilitySlot } from '../../../core/services/therapist-availability.service';

interface DayRow {
  day_of_week: number;
  label: string;
  enabled: boolean;
  start_time: string;
  end_time: string;
}

@Component({
  selector: 'app-therapist-availability',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6 max-w-3xl mx-auto space-y-4">
      <h1 class="text-2xl font-bold text-gray-900">My Availability</h1>
      <p class="text-sm text-gray-500">Set your weekly working hours. If you set none, you are treated as available (only existing-booking conflicts apply). Time set here is used when clinical managers assign or reschedule your sessions.</p>

      <p *ngIf="isLoading" class="text-sm text-gray-500">Loading…</p>
      <div *ngIf="message" class="rounded-md bg-green-50 border border-green-200 px-3 py-2 text-sm text-green-700">{{ message }}</div>
      <div *ngIf="error" class="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">{{ error }}</div>

      <div *ngIf="!isLoading" class="overflow-x-auto rounded-lg border border-gray-200">
        <table class="min-w-full divide-y divide-gray-200 text-sm">
          <thead class="bg-gray-50 text-left text-xs uppercase text-gray-500">
            <tr><th class="px-4 py-3">Day</th><th class="px-4 py-3">Available</th><th class="px-4 py-3">Start</th><th class="px-4 py-3">End</th></tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr *ngFor="let d of days">
              <td class="px-4 py-3 font-medium text-gray-700">{{ d.label }}</td>
              <td class="px-4 py-3"><input type="checkbox" [(ngModel)]="d.enabled" /></td>
              <td class="px-4 py-3"><input type="time" [(ngModel)]="d.start_time" [disabled]="!d.enabled" class="rounded border border-gray-300 px-2 py-1" /></td>
              <td class="px-4 py-3"><input type="time" [(ngModel)]="d.end_time" [disabled]="!d.enabled" class="rounded border border-gray-300 px-2 py-1" /></td>
            </tr>
          </tbody>
        </table>
      </div>

      <button (click)="save()" [disabled]="busy || isLoading"
        class="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[#2563EB] hover:bg-[#1d4ed8] disabled:bg-blue-300">
        Save availability
      </button>
    </div>
  `
})
export class TherapistAvailabilityComponent implements OnInit {
  days: DayRow[] = [];
  isLoading = false;
  busy = false;
  message = '';
  error = '';

  private readonly DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  constructor(private svc: TherapistAvailabilityService) {}

  ngOnInit(): void {
    this.days = this.DAY_NAMES.map((label, i) => ({
      day_of_week: i, label, enabled: false, start_time: '09:00', end_time: '17:00'
    }));
    this.load();
  }

  load(): void {
    this.isLoading = true;
    this.svc.getMine().subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success && res.data?.weekly) {
          for (const slot of res.data.weekly) {
            const row = this.days[slot.day_of_week];
            if (row) {
              row.enabled = slot.is_available !== false;
              row.start_time = slot.start_time;
              row.end_time = slot.end_time;
            }
          }
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.error = err?.error?.message || 'Failed to load availability.';
      }
    });
  }

  save(): void {
    const slots: AvailabilitySlot[] = this.days
      .filter(d => d.enabled)
      .map(d => ({ day_of_week: d.day_of_week, start_time: d.start_time, end_time: d.end_time, is_available: true }));

    // Client-side guard: start < end.
    for (const s of slots) {
      if (s.start_time >= s.end_time) {
        this.error = `${this.DAY_NAMES[s.day_of_week]}: start time must be before end time.`;
        return;
      }
    }

    this.busy = true; this.message = ''; this.error = '';
    this.svc.setMine(slots).subscribe({
      next: (res) => { this.busy = false; this.message = res.message || 'Availability saved.'; },
      error: (err) => { this.busy = false; this.error = err?.error?.message || 'Failed to save availability.'; }
    });
  }
}
