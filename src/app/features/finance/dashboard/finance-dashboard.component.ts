import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-finance-dashboard',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <div class="max-w-7xl mx-auto space-y-6">
      <h1 class="text-2xl font-bold text-gray-900">{{ 'finance.nav.dashboard' | translate }}</h1>
      <p class="text-gray-600">Finance Dashboard - Coming Soon</p>
    </div>
  `
})
export class FinanceDashboardComponent implements OnInit {
  ngOnInit(): void {
    // TODO: Implement dashboard
  }
}

