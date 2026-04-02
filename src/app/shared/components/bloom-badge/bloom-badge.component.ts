import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * BloomBadgeComponent
 * ───────────────────
 * A small status-indicator pill that dynamically changes colour
 * based on the `status` input. Optional leading dot for extra emphasis.
 *
 * Usage:
 *   <bloom-badge status="success">Active</bloom-badge>
 *   <bloom-badge status="warning" [dot]="true">Pending</bloom-badge>
 *   <bloom-badge status="error" size="lg">Overdue</bloom-badge>
 */
@Component({
  selector: 'bloom-badge',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span [class]="computedClasses">
      <!-- Optional pulsing dot indicator -->
      @if (dot) {
        <span
          class="relative flex h-2 w-2"
          [attr.aria-hidden]="true"
        >
          <span
            class="absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping"
            [ngClass]="dotPingClass"
          ></span>
          <span
            class="relative inline-flex h-2 w-2 rounded-full"
            [ngClass]="dotSolidClass"
          ></span>
        </span>
      }

      <ng-content />
    </span>
  `,
  styles: [`
    :host {
      display: inline-flex;
    }
  `],
})
export class BloomBadgeComponent {
  @Input() status: 'success' | 'warning' | 'error' | 'info' = 'info';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() dot = false;

  /* ── Colour maps (background + text) ──── */
  private readonly statusStyles: Record<string, string> = {
    success: 'bg-success-50 text-success-700 ring-1 ring-inset ring-success-600/20',
    warning: 'bg-warning-50 text-warning-700 ring-1 ring-inset ring-warning-600/20',
    error:   'bg-error-50 text-error-700 ring-1 ring-inset ring-error-600/20',
    info:    'bg-info-50 text-info-700 ring-1 ring-inset ring-info-600/20',
  };

  /* ── Dot colour maps ────────────────────── */
  private readonly dotPingStyles: Record<string, string> = {
    success: 'bg-success-500',
    warning: 'bg-warning-500',
    error:   'bg-error-500',
    info:    'bg-info-500',
  };

  private readonly dotSolidStyles: Record<string, string> = {
    success: 'bg-success-600',
    warning: 'bg-warning-600',
    error:   'bg-error-600',
    info:    'bg-info-600',
  };

  /* ── Size tokens ────────────────────────── */
  private readonly sizeStyles: Record<string, string> = {
    sm: 'px-2 py-0.5 text-[0.65rem]',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1 text-sm',
  };

  get computedClasses(): string {
    return [
      'inline-flex items-center gap-1.5',
      'font-medium rounded-bloom-full',
      'whitespace-nowrap select-none',
      this.sizeStyles[this.size],
      this.statusStyles[this.status],
    ].join(' ');
  }

  get dotPingClass(): string {
    return this.dotPingStyles[this.status];
  }

  get dotSolidClass(): string {
    return this.dotSolidStyles[this.status];
  }
}
