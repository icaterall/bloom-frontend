import {
  trigger,
  transition,
  style,
  animate,
} from '@angular/animations';

// ──────────────────────────────────────────────
// Reusable modal / overlay animations
// ──────────────────────────────────────────────

/** Backdrop fade-in / fade-out */
export const backdropAnimation = trigger('backdropAnim', [
  transition(':enter', [
    style({ opacity: 0 }),
    animate('200ms ease-out', style({ opacity: 1 })),
  ]),
  transition(':leave', [
    animate('150ms ease-in', style({ opacity: 0 })),
  ]),
]);

/** Modal panel: scale-in with subtle spring, scale-out fast */
export const modalPanelAnimation = trigger('modalPanelAnim', [
  transition(':enter', [
    style({ opacity: 0, transform: 'scale(0.92) translateY(12px)' }),
    animate(
      '280ms cubic-bezier(0.16, 1, 0.3, 1)',
      style({ opacity: 1, transform: 'scale(1) translateY(0)' }),
    ),
  ]),
  transition(':leave', [
    animate(
      '180ms ease-in',
      style({ opacity: 0, transform: 'scale(0.95) translateY(6px)' }),
    ),
  ]),
]);

/** Slide-up animation for drawers / bottom sheets */
export const slideUpAnimation = trigger('slideUpAnim', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateY(100%)' }),
    animate(
      '300ms cubic-bezier(0.16, 1, 0.3, 1)',
      style({ opacity: 1, transform: 'translateY(0)' }),
    ),
  ]),
  transition(':leave', [
    animate(
      '200ms ease-in',
      style({ opacity: 0, transform: 'translateY(100%)' }),
    ),
  ]),
]);

/** Generic fade for toggled elements */
export const fadeAnimation = trigger('fadeAnim', [
  transition(':enter', [
    style({ opacity: 0 }),
    animate('200ms ease-out', style({ opacity: 1 })),
  ]),
  transition(':leave', [
    animate('150ms ease-in', style({ opacity: 0 })),
  ]),
]);
