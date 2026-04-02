import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * BloomCardComponent
 * ──────────────────
 * A premium container with subtle shadow and rounded corners.
 * Uses Angular content projection for header, body, and footer slots.
 *
 * Usage:
 *   <bloom-card [padded]="true" [hoverable]="true">
 *     <div bloom-card-header>
 *       <h3>Card Title</h3>
 *     </div>
 *
 *     <div bloom-card-body>
 *       <p>Card content goes here...</p>
 *     </div>
 *
 *     <div bloom-card-footer>
 *       <bloom-button variant="primary">Confirm</bloom-button>
 *     </div>
 *   </bloom-card>
 */
@Component({
  selector: 'bloom-card',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div [class]="cardClasses">
      <!-- Header slot -->
      <div
        class="bloom-card__header border-b border-surface-200 px-6 py-4"
        [class.hidden]="!hasHeader"
        #headerWrapper
      >
        <ng-content select="[bloom-card-header]" />
      </div>

      <!-- Body slot -->
      <div
        class="bloom-card__body"
        [class.px-6]="padded"
        [class.py-5]="padded"
      >
        <ng-content select="[bloom-card-body]" />
        <!-- Fallback: if no named slot is used, default content lands here -->
        <ng-content />
      </div>

      <!-- Footer slot -->
      <div
        class="bloom-card__footer border-t border-surface-200 px-6 py-4 bg-surface-50"
        [class.rounded-b-bloom]="true"
        [class.hidden]="!hasFooter"
        #footerWrapper
      >
        <ng-content select="[bloom-card-footer]" />
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    /* Hide header/footer wrappers when they have no projected content */
    .bloom-card__header:empty,
    .bloom-card__footer:empty {
      display: none;
    }
  `],
})
export class BloomCardComponent {
  /** Add inner padding to the body section */
  @Input() padded = true;

  /** Lift the card on hover with an elevated shadow */
  @Input() hoverable = false;

  /** Remove shadow entirely (for nested/embedded cards) */
  @Input() flat = false;

  /** Control visibility of the header divider */
  @Input() hasHeader = true;

  /** Control visibility of the footer divider */
  @Input() hasFooter = true;

  get cardClasses(): string {
    const base = [
      'bg-white rounded-bloom overflow-hidden',
      'border border-surface-200',
      'transition-all duration-200 ease-bloom',
    ];

    if (!this.flat) {
      base.push('shadow-bloom-sm');
    }

    if (this.hoverable) {
      base.push('hover:shadow-bloom-lg hover:-translate-y-0.5');
    }

    return base.join(' ');
  }
}
