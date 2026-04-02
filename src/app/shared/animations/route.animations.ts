import {
  trigger,
  transition,
  style,
  animate,
  query,
  group,
} from '@angular/animations';

// ──────────────────────────────────────────────
// Route-level fade-in transition
//
// Wrap <router-outlet> with a div that carries
// [@routeAnimation] bound to the outlet's
// activatedRoute data.
//
// Example:
//   <div [@routeAnimation]="outlet?.activatedRouteData">
//     <router-outlet #outlet="outlet" />
//   </div>
// ──────────────────────────────────────────────

export const routeFadeAnimation = trigger('routeAnimation', [
  transition('* <=> *', [
    // Style the entering & leaving pages
    query(':enter', [
      style({ opacity: 0, transform: 'translateY(8px)' }),
    ], { optional: true }),

    query(':leave', [
      style({ opacity: 1, transform: 'translateY(0)' }),
    ], { optional: true }),

    group([
      // Fade out the old page
      query(':leave', [
        animate('180ms ease-in',
          style({ opacity: 0, transform: 'translateY(-6px)' })),
      ], { optional: true }),

      // Fade in the new page (with slight delay so the exit
      // completes before the enter begins)
      query(':enter', [
        animate('280ms 100ms cubic-bezier(0.16, 1, 0.3, 1)',
          style({ opacity: 1, transform: 'translateY(0)' })),
      ], { optional: true }),
    ]),
  ]),
]);
