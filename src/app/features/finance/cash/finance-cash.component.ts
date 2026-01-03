import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-finance-cash',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `<div class="p-6"><h1>{{ 'finance.nav.cashDesk' | translate }}</h1><p>Cash Desk module - Coming Soon</p></div>`
})
export class FinanceCashComponent {}

