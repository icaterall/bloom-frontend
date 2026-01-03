import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-finance-settings',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `<div class="p-6"><h1>{{ 'finance.nav.settings' | translate }}</h1><p>Settings module - Coming Soon</p></div>`
})
export class FinanceSettingsComponent {}

