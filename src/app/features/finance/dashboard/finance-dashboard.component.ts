import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { FinanceService, FinanceSummary } from '../../../core/services/finance.service';

@Component({
  selector: 'app-finance-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe],
  template: `
    <div class="max-w-7xl mx-auto space-y-6 p-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-gray-900">{{ 'finance.nav.dashboard' | translate }}</h1>
        <a routerLink="/finance/payments" class="text-sm font-medium text-[#2563EB] hover:underline">View all payments →</a>
      </div>

      <p *ngIf="isLoading" class="text-sm text-gray-500">Loading summary…</p>
      <div *ngIf="!isLoading && errorMessage" class="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
        {{ errorMessage }}
      </div>

      <ng-container *ngIf="!isLoading && !errorMessage && summary">
        <p class="text-sm text-gray-500">This month — {{ summary.period.month }} {{ summary.period.year }}</p>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="rounded-lg border border-gray-200 bg-white p-4">
            <p class="text-xs uppercase text-gray-500">Confirmed revenue</p>
            <p class="mt-1 text-2xl font-bold text-green-700">RM {{ summary.total_confirmed_revenue.toFixed(2) }}</p>
            <p class="text-xs text-gray-400">{{ summary.succeeded_count }} succeeded</p>
          </div>
          <div class="rounded-lg border border-gray-200 bg-white p-4">
            <p class="text-xs uppercase text-gray-500">Pending revenue</p>
            <p class="mt-1 text-2xl font-bold text-amber-600">RM {{ summary.total_pending_revenue.toFixed(2) }}</p>
            <p class="text-xs text-gray-400">{{ summary.pending_count }} pending</p>
          </div>
          <div class="rounded-lg border border-gray-200 bg-white p-4">
            <p class="text-xs uppercase text-gray-500">Failed</p>
            <p class="mt-1 text-2xl font-bold text-red-600">RM {{ summary.total_failed_revenue.toFixed(2) }}</p>
            <p class="text-xs text-gray-400">{{ summary.failed_count }} failed</p>
          </div>
          <div class="rounded-lg border border-gray-200 bg-white p-4">
            <p class="text-xs uppercase text-gray-500">Total payments</p>
            <p class="mt-1 text-2xl font-bold text-gray-900">{{ summary.total_payments }}</p>
            <p class="text-xs text-gray-400">card {{ summary.card_count }} · cash {{ summary.cash_count }} · bank {{ summary.bank_count }}</p>
          </div>
        </div>
      </ng-container>
    </div>
  `
})
export class FinanceDashboardComponent implements OnInit {
  summary: FinanceSummary | null = null;
  isLoading = false;
  errorMessage = '';

  constructor(private financeService: FinanceService) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.financeService.getSummary().subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success) this.summary = res.data;
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err?.error?.message || 'Failed to load finance summary.';
      }
    });
  }
}
