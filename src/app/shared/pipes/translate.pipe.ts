import { Pipe, PipeTransform, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { TranslationService } from '../services/translation.service';
import { Subscription } from 'rxjs';

@Pipe({
  name: 'translate',
  standalone: true,
  pure: false // Make it impure to react to language changes
})
export class TranslatePipe implements PipeTransform, OnDestroy {
  private subscription?: Subscription;
  private lastKey?: string;
  private lastValue?: string;
  private lastLang?: string;

  constructor(
    private translationService: TranslationService,
    private cdr: ChangeDetectorRef
  ) {}

  transform(key: string): string {
    if (!key) return '';

    const currentLang = this.translationService.getCurrentLanguage();
    
    // Check if we need to update
    if (this.lastKey === key && this.lastLang === currentLang) {
      return this.lastValue || key;
    }

    // Unsubscribe from previous subscription if needed
    if (this.subscription && (this.lastKey !== key || !this.lastLang)) {
      this.subscription.unsubscribe();
    }

    // Update cache
    this.lastKey = key;
    this.lastLang = currentLang;
    this.lastValue = this.translationService.translate(key);

    // Subscribe to language changes only once per key
    if (!this.subscription || this.lastKey !== key) {
      this.subscription = this.translationService.currentLang$.subscribe(() => {
        this.lastLang = this.translationService.getCurrentLanguage();
        this.lastValue = this.translationService.translate(key);
        this.cdr.markForCheck();
      });
    }

    return this.lastValue;
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
