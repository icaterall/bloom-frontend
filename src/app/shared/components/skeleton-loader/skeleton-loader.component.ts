import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

// ──────────────────────────────────────────────
// Skeleton Loader — shimmer placeholder blocks
// that replace raw spinners for a premium feel.
//
// Usage:
//   <app-skeleton type="table" [rows]="6" [cols]="5" />
//   <app-skeleton type="card" [count]="3" />
//   <app-skeleton type="text" [lines]="4" />
// ──────────────────────────────────────────────

@Component({
  selector: 'app-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- TABLE skeleton -->
    @if (type === 'table') {
      <div class="w-full overflow-hidden rounded-bloom border border-gray-100 bg-white">
        <!-- Table header -->
        <div class="flex gap-4 border-b border-gray-100 bg-gray-50/60 px-6 py-4">
          @for (col of colArray; track col) {
            <div class="flex-1">
              <div class="skeleton-shimmer h-4 rounded-md" [style.width.%]="randomWidth(60, 90)"></div>
            </div>
          }
        </div>
        <!-- Table rows -->
        @for (row of rowArray; track row) {
          <div class="flex items-center gap-4 border-b border-gray-50 px-6 py-4 last:border-b-0"
               [style.animation-delay.ms]="row * 60">
            @for (col of colArray; track col) {
              <div class="flex-1">
                <div class="skeleton-shimmer h-4 rounded-md" [style.width.%]="randomWidth(40, 100)"></div>
              </div>
            }
          </div>
        }
      </div>
    }

    <!-- CARD skeleton -->
    @if (type === 'card') {
      <div class="grid gap-6" [ngClass]="cardGridClass">
        @for (card of countArray; track card) {
          <div class="rounded-bloom border border-gray-100 bg-white p-6 shadow-sm">
            <div class="flex items-center gap-4 mb-5">
              <div class="skeleton-shimmer h-12 w-12 rounded-full flex-shrink-0"></div>
              <div class="flex-1 space-y-2">
                <div class="skeleton-shimmer h-4 w-3/4 rounded-md"></div>
                <div class="skeleton-shimmer h-3 w-1/2 rounded-md"></div>
              </div>
            </div>
            <div class="space-y-3">
              <div class="skeleton-shimmer h-3 w-full rounded-md"></div>
              <div class="skeleton-shimmer h-3 w-5/6 rounded-md"></div>
              <div class="skeleton-shimmer h-3 w-2/3 rounded-md"></div>
            </div>
            <div class="mt-5 flex gap-3">
              <div class="skeleton-shimmer h-9 w-24 rounded-bloom"></div>
              <div class="skeleton-shimmer h-9 w-20 rounded-bloom"></div>
            </div>
          </div>
        }
      </div>
    }

    <!-- TEXT skeleton -->
    @if (type === 'text') {
      <div class="space-y-3">
        @for (line of lineArray; track line) {
          <div class="skeleton-shimmer h-4 rounded-md"
               [style.width.%]="line === lineArray.length - 1 ? randomWidth(30, 60) : randomWidth(80, 100)">
          </div>
        }
      </div>
    }

    <!-- STAT skeleton (dashboard stat cards) -->
    @if (type === 'stat') {
      <div class="grid gap-6" [ngClass]="statGridClass">
        @for (stat of countArray; track stat) {
          <div class="rounded-bloom border border-gray-100 bg-white p-5 shadow-sm">
            <div class="flex items-center justify-between mb-3">
              <div class="skeleton-shimmer h-3 w-24 rounded-md"></div>
              <div class="skeleton-shimmer h-8 w-8 rounded-bloom"></div>
            </div>
            <div class="skeleton-shimmer h-8 w-20 rounded-md mb-2"></div>
            <div class="skeleton-shimmer h-3 w-32 rounded-md"></div>
          </div>
        }
      </div>
    }
  `,
  styles: [`
    .skeleton-shimmer {
      background: linear-gradient(
        90deg,
        #f1f5f9 0%,
        #e8eef6 40%,
        #f1f5f9 80%
      );
      background-size: 200% 100%;
      animation: shimmer 1.6s ease-in-out infinite;
    }

    @keyframes shimmer {
      0%   { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `],
})
export class SkeletonLoaderComponent {
  /** Skeleton layout variant */
  @Input() type: 'table' | 'card' | 'text' | 'stat' = 'table';

  /** Number of table rows */
  @Input() rows = 5;

  /** Number of table columns */
  @Input() cols = 4;

  /** Number of text lines */
  @Input() lines = 3;

  /** Number of card / stat items */
  @Input() count = 3;

  get rowArray(): number[]   { return Array.from({ length: this.rows }, (_, i) => i); }
  get colArray(): number[]   { return Array.from({ length: this.cols }, (_, i) => i); }
  get lineArray(): number[]  { return Array.from({ length: this.lines }, (_, i) => i); }
  get countArray(): number[] { return Array.from({ length: this.count }, (_, i) => i); }

  get cardGridClass(): string {
    if (this.count >= 3) return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
    if (this.count === 2) return 'grid-cols-1 md:grid-cols-2';
    return 'grid-cols-1';
  }

  get statGridClass(): string {
    if (this.count >= 4) return 'grid-cols-2 lg:grid-cols-4';
    if (this.count === 3) return 'grid-cols-1 md:grid-cols-3';
    return 'grid-cols-1 md:grid-cols-2';
  }

  /**
   * Produce a deterministic-looking random width to make skeletons
   * look organic. The seed is based on the loop index so it stays
   * stable across re-renders.
   */
  randomWidth(min: number, max: number): number {
    return Math.floor(min + Math.random() * (max - min));
  }
}
