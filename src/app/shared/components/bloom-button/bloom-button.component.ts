import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * BloomButtonComponent
 * ────────────────────
 * Enterprise-grade button with four visual variants, three sizes,
 * and a built-in loading spinner state.
 *
 * Usage:
 *   <bloom-button variant="primary" size="md" (clicked)="onSave()">
 *     Save Changes
 *   </bloom-button>
 *
 *   <bloom-button variant="accent" [loading]="isSaving" [disabled]="!form.valid">
 *     Submit
 *   </bloom-button>
 */
@Component({
  selector: 'bloom-button',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      [type]="type"
      [disabled]="disabled || loading"
      [class]="computedClasses"
      (click)="handleClick($event)"
    >
      <!-- Loading spinner -->
      @if (loading) {
        <svg
          class="animate-spin-slow shrink-0"
          [class.h-4]="size === 'sm'"
          [class.w-4]="size === 'sm'"
          [class.h-5]="size === 'md'"
          [class.w-5]="size === 'md'"
          [class.h-5]="size === 'lg'"
          [class.w-5]="size === 'lg'"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12" cy="12" r="10"
            stroke="currentColor"
            stroke-width="4"
          />
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      }

      <!-- Icon slot (prefix) -->
      @if (!loading) {
        <ng-content select="[bloom-icon-start]" />
      }

      <!-- Label -->
      <span [class.opacity-0]="loading && !showLabelWhileLoading">
        <ng-content />
      </span>

      <!-- Icon slot (suffix) -->
      @if (!loading) {
        <ng-content select="[bloom-icon-end]" />
      }
    </button>
  `,
  styles: [`
    :host {
      display: inline-block;
    }
  `],
})
export class BloomButtonComponent {
  /* ── Inputs ────────────────────────────── */
  @Input() variant: 'primary' | 'accent' | 'outline' | 'text' = 'primary';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() disabled = false;
  @Input() loading = false;
  @Input() fullWidth = false;
  @Input() showLabelWhileLoading = true;

  /* ── Outputs ───────────────────────────── */
  @Output() clicked = new EventEmitter<MouseEvent>();

  /* ── Click handler ─────────────────────── */
  handleClick(event: MouseEvent): void {
    if (!this.disabled && !this.loading) {
      this.clicked.emit(event);
    }
  }

  /* ── Dynamic class builder ─────────────── */
  get computedClasses(): string {
    const base = [
      'inline-flex items-center justify-center gap-2',
      'font-medium leading-none select-none',
      'rounded-bloom-sm',
      'transition-all duration-200 ease-bloom',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
      'disabled:cursor-not-allowed disabled:opacity-50',
    ];

    // ── Size tokens ─────────────────────
    const sizeMap: Record<string, string> = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2.5 text-sm',
      lg: 'px-6 py-3 text-base',
    };

    // ── Variant tokens ──────────────────
    const variantMap: Record<string, string> = {
      primary: [
        'bg-brand-primary text-white',
        'hover:bg-brand-primary-700 active:bg-brand-primary-800',
        'shadow-bloom-sm hover:shadow-bloom-primary',
        'focus-visible:ring-brand-primary-500',
      ].join(' '),

      accent: [
        'bg-brand-accent text-white',
        'hover:bg-brand-accent-600 active:bg-brand-accent-700',
        'shadow-bloom-sm hover:shadow-bloom-accent',
        'focus-visible:ring-brand-accent-500',
      ].join(' '),

      outline: [
        'border-2 border-brand-primary text-brand-primary bg-transparent',
        'hover:bg-brand-primary-50 active:bg-brand-primary-100',
        'focus-visible:ring-brand-primary-500',
      ].join(' '),

      text: [
        'text-brand-primary bg-transparent',
        'hover:bg-brand-primary-50 active:bg-brand-primary-100',
        'focus-visible:ring-brand-primary-500',
      ].join(' '),
    };

    return [
      ...base,
      sizeMap[this.size],
      variantMap[this.variant],
      this.fullWidth ? 'w-full' : '',
    ].filter(Boolean).join(' ');
  }
}
