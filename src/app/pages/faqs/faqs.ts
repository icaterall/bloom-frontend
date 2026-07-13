import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, ChevronDown } from 'lucide-angular';
import { HeaderComponent } from '../../shared/header/header';
import { FooterComponent } from '../../shared/footer/footer';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

interface FaqItem {
  id: string;
  open: boolean;
}

@Component({
  selector: 'app-faqs',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LucideAngularModule,
    HeaderComponent,
    FooterComponent,
    TranslatePipe,
  ],
  templateUrl: './faqs.html',
  styleUrl: './faqs.scss',
})
export class Faqs {
  readonly ChevronDownIcon = ChevronDown;

  // All visible copy lives in assets/i18n/{en,my}.json — this array holds only
  // the item ids; question/answer keys are 'faqs.items.<id>.q' / '.a', piped
  // through | translate in the template. Multiple panels may be open at once.
  faqs: FaqItem[] = [
    { id: 'services', open: false },
    { id: 'booking', open: false },
    { id: 'childProfile', open: false },
    { id: 'confirmation', open: false },
    { id: 'payments', open: false },
    { id: 'cancel', open: false },
    { id: 'online', open: false },
    { id: 'updates', open: false },
    { id: 'contact', open: false },
    { id: 'fees', open: false },
  ];

  toggle(item: FaqItem): void {
    item.open = !item.open;
  }
}
