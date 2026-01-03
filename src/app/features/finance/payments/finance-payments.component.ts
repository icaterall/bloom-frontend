import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-finance-payments',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `<div class="p-6"><h1>{{ 'finance.nav.payments' | translate }}</h1><p>Payments module - Coming Soon</p></div>`
})
export class FinancePaymentsComponent {}

