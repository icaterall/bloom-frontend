import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { FinanceService, FinancePayment } from '../../../core/services/finance.service';

@Component({
  selector: 'app-finance-payments',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  template: `
    <div class="p-6 max-w-7xl mx-auto space-y-4">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <h1 class="text-2xl font-bold text-gray-900">{{ 'finance.nav.payments' | translate }}</h1>
        <div class="flex items-center gap-2">
          <label class="text-sm text-gray-600">Status</label>
          <select [(ngModel)]="statusFilter" (change)="load()"
                  class="rounded-md border border-gray-300 px-3 py-1.5 text-sm">
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="succeeded">Succeeded</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <label class="text-sm text-gray-600 ml-2">Method</label>
          <select [(ngModel)]="methodFilter" (change)="load()"
                  class="rounded-md border border-gray-300 px-3 py-1.5 text-sm">
            <option value="">All</option>
            <option value="card">Card</option>
            <option value="online_banking">Online banking</option>
            <option value="cash">Cash</option>
          </select>
        </div>
      </div>

      <!-- Loading -->
      <p *ngIf="isLoading" class="text-sm text-gray-500">Loading payments…</p>

      <!-- Error -->
      <div *ngIf="!isLoading && errorMessage" class="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
        {{ errorMessage }}
      </div>

      <!-- Empty -->
      <div *ngIf="!isLoading && !errorMessage && payments.length === 0"
           class="rounded-md bg-gray-50 border border-gray-200 p-6 text-center text-sm text-gray-500">
        No payments found for the selected filters.
      </div>

      <!-- Table -->
      <div *ngIf="!isLoading && !errorMessage && payments.length > 0" class="overflow-x-auto rounded-lg border border-gray-200">
        <table class="min-w-full divide-y divide-gray-200 text-sm">
          <thead class="bg-gray-50 text-left text-xs font-semibold uppercase text-gray-500">
            <tr>
              <th class="px-4 py-3">#</th>
              <th class="px-4 py-3">Booking</th>
              <th class="px-4 py-3">Parent</th>
              <th class="px-4 py-3">Child</th>
              <th class="px-4 py-3">Amount</th>
              <th class="px-4 py-3">Method</th>
              <th class="px-4 py-3">Provider</th>
              <th class="px-4 py-3">Status</th>
              <th class="px-4 py-3">Created</th>
              <th class="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr *ngFor="let p of payments" class="hover:bg-gray-50">
              <td class="px-4 py-3 text-gray-700">{{ p.id }}</td>
              <td class="px-4 py-3 text-gray-700">#{{ p.booking_id }} <span class="text-xs text-gray-400">{{ p.booking_type }}</span></td>
              <td class="px-4 py-3 text-gray-700">{{ p.parent_name || '—' }}</td>
              <td class="px-4 py-3 text-gray-700">{{ p.child_name || '—' }}</td>
              <td class="px-4 py-3 font-medium text-gray-900">{{ p.currency }} {{ (+p.amount).toFixed(2) }}</td>
              <td class="px-4 py-3 text-gray-700">{{ p.method }}</td>
              <td class="px-4 py-3 text-gray-700">{{ p.provider }}</td>
              <td class="px-4 py-3">
                <span class="inline-flex rounded-full px-2 py-0.5 text-xs font-medium" [ngClass]="statusClass(p.status)">
                  {{ p.status }}
                </span>
              </td>
              <td class="px-4 py-3 text-gray-500">{{ p.created_at | date:'medium' }}</td>
              <td class="px-4 py-3">
                <div class="flex gap-2">
                  <button *ngIf="canApproveManual(p)" type="button" (click)="approve(p)" [disabled]="busyId === p.id"
                    class="rounded-md bg-green-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-50">Approve</button>
                  <button *ngIf="canApproveManual(p)" type="button" (click)="reject(p)" [disabled]="busyId === p.id"
                    class="rounded-md border border-red-300 px-2.5 py-1 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50">Reject</button>
                  <button *ngIf="canRefund(p)" type="button" (click)="refund(p)" [disabled]="busyId === p.id"
                    class="rounded-md border border-blue-300 px-2.5 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-50 disabled:opacity-50">Refund</button>
                  <span *ngIf="!canApproveManual(p) && !canRefund(p)" class="text-xs text-gray-300">—</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div *ngIf="actionMessage" class="rounded-md bg-green-50 border border-green-200 px-3 py-2 text-sm text-green-700">{{ actionMessage }}</div>
      <div *ngIf="actionError" class="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">{{ actionError }}</div>

      <p *ngIf="!isLoading && !errorMessage && payments.length > 0" class="text-xs text-gray-400">
        Showing {{ payments.length }} of {{ total }} payment(s). Read-only view.
      </p>
    </div>
  `
})
export class FinancePaymentsComponent implements OnInit {
  payments: FinancePayment[] = [];
  total = 0;
  isLoading = false;
  errorMessage = '';
  statusFilter = '';
  methodFilter = '';
  actionMessage = '';
  actionError = '';
  busyId: number | null = null;

  constructor(private financeService: FinanceService) {}

  canApproveManual(p: FinancePayment): boolean {
    return p.status === 'pending' && (p.method === 'cash' || p.method === 'online_banking');
  }

  canRefund(p: FinancePayment): boolean {
    return p.status === 'succeeded' && p.provider === 'stripe';
  }

  approve(p: FinancePayment): void {
    if (!confirm(`Approve manual payment #${p.id}?`)) return;
    this.runAction(p, this.financeService.approvePayment(p.id), 'Payment approved.');
  }

  reject(p: FinancePayment): void {
    if (!confirm(`Reject manual payment #${p.id}? The booking will NOT be marked paid.`)) return;
    const reason = prompt('Reason for rejection (optional):') || undefined;
    this.runAction(p, this.financeService.rejectPayment(p.id, reason), 'Payment rejected.');
  }

  refund(p: FinancePayment): void {
    if (!confirm(`Refund ${p.currency} ${(+p.amount).toFixed(2)} for payment #${p.id} via Stripe?`)) return;
    const reason = prompt('Reason for refund (optional):') || undefined;
    this.runAction(p, this.financeService.refundPayment(p.id, { reason }), 'Refund processed.');
  }

  private runAction(p: FinancePayment, obs: import('rxjs').Observable<{ success: boolean; message?: string }>, okMsg: string): void {
    this.busyId = p.id;
    this.actionMessage = '';
    this.actionError = '';
    obs.subscribe({
      next: (res) => {
        this.busyId = null;
        this.actionMessage = res.message || okMsg;
        this.load();
      },
      error: (err) => {
        this.busyId = null;
        this.actionError = err?.error?.message || 'Action failed. Please try again.';
      }
    });
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.financeService.getPayments({
      status: this.statusFilter || undefined,
      method: this.methodFilter || undefined,
      page: 1,
      limit: 100
    }).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success) {
          this.payments = res.data || [];
          this.total = res.pagination?.total ?? this.payments.length;
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err?.error?.message || 'Failed to load payments. Please try again.';
      }
    });
  }

  statusClass(status: string): string {
    switch (status) {
      case 'succeeded': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-amber-100 text-amber-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-700';
    }
  }
}
