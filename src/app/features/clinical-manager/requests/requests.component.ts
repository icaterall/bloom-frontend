import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClinicalManagerRequestsService } from '../../../core/services/clinical-manager-requests.service';

@Component({
  selector: 'app-cm-requests',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6 max-w-7xl mx-auto space-y-8">
      <h1 class="text-2xl font-bold text-gray-900">Cancellation & Reschedule Requests</h1>

      <div *ngIf="message" class="rounded-md bg-green-50 border border-green-200 px-3 py-2 text-sm text-green-700">{{ message }}</div>
      <div *ngIf="error" class="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">{{ error }}</div>

      <!-- Cancellation requests -->
      <section class="space-y-3">
        <h2 class="text-lg font-semibold text-gray-800">Cancellation requests</h2>
        <p *ngIf="loadingCancel" class="text-sm text-gray-500">Loading…</p>
        <p *ngIf="!loadingCancel && cancellations.length === 0" class="text-sm text-gray-500">No pending cancellation requests.</p>
        <div *ngIf="cancellations.length" class="overflow-x-auto rounded-lg border border-gray-200">
          <table class="min-w-full divide-y divide-gray-200 text-sm">
            <thead class="bg-gray-50 text-left text-xs uppercase text-gray-500">
              <tr><th class="px-4 py-3">#</th><th class="px-4 py-3">Child</th><th class="px-4 py-3">Parent</th><th class="px-4 py-3">Type</th><th class="px-4 py-3">Payment</th><th class="px-4 py-3">Reason</th><th class="px-4 py-3">Actions</th></tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr *ngFor="let b of cancellations">
                <td class="px-4 py-3">{{ b.id }}</td>
                <td class="px-4 py-3">{{ b.child_name }}</td>
                <td class="px-4 py-3">{{ b.parent_name }}</td>
                <td class="px-4 py-3">{{ b.booking_type_name || b.booking_type }}</td>
                <td class="px-4 py-3">{{ b.payment_status }}</td>
                <td class="px-4 py-3 text-gray-500">{{ b.cancellation_reason || '—' }}</td>
                <td class="px-4 py-3">
                  <div class="flex gap-2">
                    <button (click)="approveCancel(b.id)" [disabled]="busyId === b.id"
                      class="rounded-md bg-green-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-50">Approve</button>
                    <button (click)="rejectCancel(b.id)" [disabled]="busyId === b.id"
                      class="rounded-md border border-red-300 px-2.5 py-1 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50">Reject</button>
                  </div>
                  <p *ngIf="b.payment_status === 'paid'" class="mt-1 text-xs text-amber-600">Paid — refund via Finance after approval.</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Reschedule requests -->
      <section class="space-y-3">
        <h2 class="text-lg font-semibold text-gray-800">Reschedule requests</h2>
        <p *ngIf="loadingReschedule" class="text-sm text-gray-500">Loading…</p>
        <p *ngIf="!loadingReschedule && reschedules.length === 0" class="text-sm text-gray-500">No pending reschedule requests.</p>
        <div *ngIf="reschedules.length" class="overflow-x-auto rounded-lg border border-gray-200">
          <table class="min-w-full divide-y divide-gray-200 text-sm">
            <thead class="bg-gray-50 text-left text-xs uppercase text-gray-500">
              <tr><th class="px-4 py-3">#</th><th class="px-4 py-3">Child</th><th class="px-4 py-3">Parent</th><th class="px-4 py-3">Current</th><th class="px-4 py-3">Requested</th><th class="px-4 py-3">Actions</th></tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr *ngFor="let b of reschedules">
                <td class="px-4 py-3">{{ b.id }}</td>
                <td class="px-4 py-3">{{ b.child_name }}</td>
                <td class="px-4 py-3">{{ b.parent_name }}</td>
                <td class="px-4 py-3 text-gray-500">{{ b.preferred_start_at | date:'short' }}</td>
                <td class="px-4 py-3 font-medium">{{ b.requested_start_at | date:'short' }}</td>
                <td class="px-4 py-3">
                  <div class="flex gap-2">
                    <button (click)="approveReschedule(b.id)" [disabled]="busyId === b.id"
                      class="rounded-md bg-green-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-50">Approve</button>
                    <button (click)="rejectReschedule(b.id)" [disabled]="busyId === b.id"
                      class="rounded-md border border-red-300 px-2.5 py-1 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50">Reject</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  `
})
export class CmRequestsComponent implements OnInit {
  cancellations: any[] = [];
  reschedules: any[] = [];
  loadingCancel = false;
  loadingReschedule = false;
  busyId: number | null = null;
  message = '';
  error = '';

  constructor(private svc: ClinicalManagerRequestsService) {}

  ngOnInit(): void {
    this.loadCancellations();
    this.loadReschedules();
  }

  loadCancellations(): void {
    this.loadingCancel = true;
    this.svc.getCancellationRequests().subscribe({
      next: (r) => { this.loadingCancel = false; if (r.success) this.cancellations = r.data || []; },
      error: () => { this.loadingCancel = false; }
    });
  }

  loadReschedules(): void {
    this.loadingReschedule = true;
    this.svc.getRescheduleRequests().subscribe({
      next: (r) => { this.loadingReschedule = false; if (r.success) this.reschedules = r.data || []; },
      error: () => { this.loadingReschedule = false; }
    });
  }

  private run(id: number, obs: import('rxjs').Observable<{ success: boolean; message?: string }>, reload: () => void): void {
    this.busyId = id; this.message = ''; this.error = '';
    obs.subscribe({
      next: (res) => { this.busyId = null; this.message = res.message || 'Done.'; reload(); },
      error: (err) => { this.busyId = null; this.error = err?.error?.message || 'Action failed.'; }
    });
  }

  approveCancel(id: number): void { this.run(id, this.svc.approveCancellation(id), () => this.loadCancellations()); }
  rejectCancel(id: number): void { this.run(id, this.svc.rejectCancellation(id), () => this.loadCancellations()); }
  approveReschedule(id: number): void { this.run(id, this.svc.approveReschedule(id), () => this.loadReschedules()); }
  rejectReschedule(id: number): void { this.run(id, this.svc.rejectReschedule(id), () => this.loadReschedules()); }
}
