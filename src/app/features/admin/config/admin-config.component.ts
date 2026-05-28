import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminConfigService, CenterHour, AdminBookingType, PricingRule } from '../../../core/services/admin-config.service';

@Component({
  selector: 'app-admin-config',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6 max-w-6xl mx-auto space-y-8">
      <h1 class="text-2xl font-bold text-gray-900">Configuration</h1>
      <div *ngIf="message" class="rounded-md bg-green-50 border border-green-200 px-3 py-2 text-sm text-green-700">{{ message }}</div>
      <div *ngIf="error" class="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">{{ error }}</div>

      <!-- Booking types -->
      <section class="space-y-3">
        <h2 class="text-lg font-semibold text-gray-800">Booking types</h2>
        <p *ngIf="loadingTypes" class="text-sm text-gray-500">Loading…</p>
        <div *ngIf="!loadingTypes" class="overflow-x-auto rounded-lg border border-gray-200">
          <table class="min-w-full divide-y divide-gray-200 text-sm">
            <thead class="bg-gray-50 text-left text-xs uppercase text-gray-500">
              <tr><th class="px-4 py-3">Code</th><th class="px-4 py-3">Name</th><th class="px-4 py-3">Mode</th><th class="px-4 py-3">Duration</th><th class="px-4 py-3">Payment</th><th class="px-4 py-3">Active</th><th class="px-4 py-3">Action</th></tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr *ngFor="let bt of bookingTypes">
                <td class="px-4 py-3 font-mono text-xs">{{ bt.code }}</td>
                <td class="px-4 py-3">{{ bt.name }}</td>
                <td class="px-4 py-3">{{ bt.allowed_mode }}</td>
                <td class="px-4 py-3">{{ bt.default_duration_min }} min</td>
                <td class="px-4 py-3">{{ bt.payment_required ? 'Required' : 'Free' }}</td>
                <td class="px-4 py-3">
                  <span class="inline-flex rounded-full px-2 py-0.5 text-xs font-medium"
                        [ngClass]="bt.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'">
                    {{ bt.is_active ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td class="px-4 py-3">
                  <button (click)="toggleType(bt)" [disabled]="busy"
                    class="rounded-md border px-2.5 py-1 text-xs font-semibold"
                    [ngClass]="bt.is_active ? 'border-red-300 text-red-700 hover:bg-red-50' : 'border-green-300 text-green-700 hover:bg-green-50'">
                    {{ bt.is_active ? 'Deactivate' : 'Activate' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="text-xs text-gray-400">Inactive types are hidden from the parent booking flow.</p>
      </section>

      <!-- Centre hours -->
      <section class="space-y-3">
        <h2 class="text-lg font-semibold text-gray-800">Centre opening hours</h2>
        <p *ngIf="loadingHours" class="text-sm text-gray-500">Loading…</p>
        <div *ngIf="!loadingHours" class="overflow-x-auto rounded-lg border border-gray-200">
          <table class="min-w-full divide-y divide-gray-200 text-sm">
            <thead class="bg-gray-50 text-left text-xs uppercase text-gray-500">
              <tr><th class="px-4 py-3">Day</th><th class="px-4 py-3">Closed</th><th class="px-4 py-3">Open</th><th class="px-4 py-3">Close</th></tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr *ngFor="let h of hours">
                <td class="px-4 py-3">{{ h.day_name || dayName(h.day_of_week) }}</td>
                <td class="px-4 py-3"><input type="checkbox" [(ngModel)]="h.is_closed" /></td>
                <td class="px-4 py-3"><input type="time" [(ngModel)]="h.open_time" [disabled]="h.is_closed" class="rounded border border-gray-300 px-2 py-1" /></td>
                <td class="px-4 py-3"><input type="time" [(ngModel)]="h.close_time" [disabled]="h.is_closed" class="rounded border border-gray-300 px-2 py-1" /></td>
              </tr>
            </tbody>
          </table>
        </div>
        <button (click)="saveHours()" [disabled]="busy || loadingHours"
          class="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[#2563EB] hover:bg-[#1d4ed8] disabled:bg-blue-300">
          Save opening hours
        </button>
        <p class="text-xs text-gray-400">Opening hours drive the parent booking availability check.</p>
      </section>

      <!-- Pricing (read-only) -->
      <section class="space-y-3">
        <h2 class="text-lg font-semibold text-gray-800">Pricing rules <span class="text-xs font-normal text-gray-400">(read-only)</span></h2>
        <p *ngIf="loadingPricing" class="text-sm text-gray-500">Loading…</p>
        <p *ngIf="!loadingPricing && pricing.length === 0" class="text-sm text-gray-500">No pricing rules found.</p>
        <div *ngIf="pricing.length" class="overflow-x-auto rounded-lg border border-gray-200">
          <table class="min-w-full divide-y divide-gray-200 text-sm">
            <thead class="bg-gray-50 text-left text-xs uppercase text-gray-500">
              <tr><th class="px-4 py-3">#</th><th class="px-4 py-3">Mode</th><th class="px-4 py-3">Duration</th><th class="px-4 py-3">Price</th><th class="px-4 py-3">Active</th></tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr *ngFor="let pr of pricing">
                <td class="px-4 py-3">{{ pr.id }}</td>
                <td class="px-4 py-3">{{ pr.mode }}</td>
                <td class="px-4 py-3">{{ pr.duration_min || '—' }}</td>
                <td class="px-4 py-3 font-medium">{{ pr.currency || 'MYR' }} {{ pr.price }}</td>
                <td class="px-4 py-3">{{ pr.is_active ? 'Yes' : 'No' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="text-xs text-gray-400">Pricing editing is available via the API; inline editing is a future enhancement.</p>
      </section>
    </div>
  `
})
export class AdminConfigComponent implements OnInit {
  bookingTypes: AdminBookingType[] = [];
  hours: CenterHour[] = [];
  pricing: PricingRule[] = [];
  loadingTypes = false;
  loadingHours = false;
  loadingPricing = false;
  busy = false;
  message = '';
  error = '';

  private readonly DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  constructor(private cfg: AdminConfigService) {}

  ngOnInit(): void {
    this.loadTypes();
    this.loadHours();
    this.loadPricing();
  }

  dayName(d: number): string { return this.DAY_NAMES[d] ?? String(d); }

  loadTypes(): void {
    this.loadingTypes = true;
    this.cfg.getBookingTypes().subscribe({
      next: (r) => { this.loadingTypes = false; if (r.success) this.bookingTypes = r.data || []; },
      error: () => { this.loadingTypes = false; this.error = 'Failed to load booking types.'; }
    });
  }

  loadHours(): void {
    this.loadingHours = true;
    this.cfg.getCenterHours().subscribe({
      next: (r) => { this.loadingHours = false; if (r.success) this.hours = (r.data || []).sort((a, b) => a.day_of_week - b.day_of_week); },
      error: () => { this.loadingHours = false; this.error = 'Failed to load centre hours.'; }
    });
  }

  loadPricing(): void {
    this.loadingPricing = true;
    this.cfg.getPricing().subscribe({
      next: (r) => { this.loadingPricing = false; if (r.success) this.pricing = r.data || []; },
      error: () => { this.loadingPricing = false; /* pricing optional */ }
    });
  }

  toggleType(bt: AdminBookingType): void {
    this.busy = true; this.message = ''; this.error = '';
    this.cfg.setBookingTypeActive(bt.id, !bt.is_active).subscribe({
      next: (res) => { this.busy = false; this.message = res.message || 'Booking type updated.'; this.loadTypes(); },
      error: (err) => { this.busy = false; this.error = err?.error?.message || 'Failed to update booking type.'; }
    });
  }

  saveHours(): void {
    // Backend requires all 7 days with valid times when open.
    const schedule = this.hours.map(h => ({
      day_of_week: h.day_of_week,
      is_closed: !!h.is_closed,
      open_time: h.is_closed ? (h.open_time || '09:00') : h.open_time,
      close_time: h.is_closed ? (h.close_time || '18:00') : h.close_time
    }));
    this.busy = true; this.message = ''; this.error = '';
    this.cfg.updateCenterHours(schedule).subscribe({
      next: (res) => { this.busy = false; this.message = res.message || 'Opening hours saved.'; this.loadHours(); },
      error: (err) => { this.busy = false; this.error = err?.error?.message || err?.error?.errors?.[0] || 'Failed to save hours.'; }
    });
  }
}
