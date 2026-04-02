import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  HostListener,
  ElementRef,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

/**
 * TopNavigationBarComponent
 * ─────────────────────────
 * A sleek enterprise top-bar containing the brand logo (left),
 * and user profile dropdown + notification bell (right).
 *
 * Usage:
 *   <bloom-topbar
 *     [userName]="currentUser.name"
 *     [userRole]="currentUser.role"
 *     [userAvatar]="currentUser.avatarUrl"
 *     [notificationCount]="unreadCount"
 *     (menuToggle)="toggleSidebar()"
 *     (notificationsClick)="openNotifications()"
 *     (profileClick)="openProfile()"
 *     (logoutClick)="logout()"
 *   />
 */
@Component({
  selector: 'bloom-topbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header
      class="sticky top-0 z-20 flex items-center justify-between h-16
             bg-surface/80 backdrop-blur-md border-b border-surface-200
             px-4 lg:px-6 transition-all duration-200"
    >
      <!-- ── Left: Hamburger + Brand ─────── -->
      <div class="flex items-center gap-3">
        <!-- Mobile hamburger -->
        <button
          class="lg:hidden flex items-center justify-center w-9 h-9 rounded-bloom-sm
                 text-surface-500 hover:bg-surface-100 hover:text-surface-700
                 transition-colors duration-150
                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary-500"
          (click)="menuToggle.emit()"
          aria-label="Toggle navigation"
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <path d="M3 12h18M3 6h18M3 18h18" />
          </svg>
        </button>

        <!-- Brand wordmark (visible on desktop when sidebar is collapsed) -->
        @if (showBrandInTopbar) {
          <a routerLink="/" class="flex items-center gap-2 group">
            <div class="w-8 h-8 rounded-bloom-sm bg-brand-primary flex items-center justify-center">
              <svg class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" stroke-width="2">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
                <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                <circle cx="9" cy="9" r="1" fill="currentColor" />
                <circle cx="15" cy="9" r="1" fill="currentColor" />
              </svg>
            </div>
            <span class="hidden sm:block text-sm font-bold text-surface-800
                         group-hover:text-brand-primary transition-colors">
              Bloom Spectrum
            </span>
          </a>
        }

        <!-- Page title slot -->
        <ng-content select="[bloom-topbar-title]" />
      </div>

      <!-- ── Right: Actions ──────────────── -->
      <div class="flex items-center gap-2">
        <!-- Notification bell -->
        <button
          class="relative flex items-center justify-center w-9 h-9 rounded-bloom-sm
                 text-surface-500 hover:bg-surface-100 hover:text-surface-700
                 transition-colors duration-150
                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary-500"
          (click)="notificationsClick.emit()"
          aria-label="Notifications"
        >
          <!-- Bell icon -->
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2"
               stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 01-3.46 0" />
          </svg>

          <!-- Notification count badge -->
          @if (notificationCount && notificationCount > 0) {
            <span class="absolute -top-0.5 -right-0.5 flex items-center justify-center
                         h-4.5 min-w-[1.125rem] px-1 rounded-bloom-full
                         bg-error text-[0.6rem] font-bold text-white
                         ring-2 ring-surface animate-scale-in">
              {{ notificationCount > 99 ? '99+' : notificationCount }}
            </span>
          }
        </button>

        <!-- Divider -->
        <div class="hidden sm:block w-px h-6 bg-surface-200"></div>

        <!-- Profile dropdown -->
        <div class="relative">
          <button
            class="flex items-center gap-2.5 rounded-bloom-sm px-2 py-1.5
                   hover:bg-surface-100 transition-colors duration-150
                   focus-visible:outline-none focus-visible:ring-2
                   focus-visible:ring-brand-primary-500"
            (click)="toggleProfileMenu()"
            [attr.aria-expanded]="isProfileOpen"
            aria-haspopup="true"
          >
            <!-- Avatar -->
            <div class="relative w-8 h-8 rounded-full overflow-hidden
                        ring-2 ring-surface-200 shrink-0">
              @if (userAvatar) {
                <img
                  [src]="userAvatar"
                  [alt]="userName"
                  class="w-full h-full object-cover"
                />
              } @else {
                <div class="w-full h-full bg-brand-primary-100 flex items-center
                            justify-center text-brand-primary-700 text-xs font-bold">
                  {{ userInitials }}
                </div>
              }
              <!-- Online indicator -->
              <span class="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full
                           bg-success ring-2 ring-surface"></span>
            </div>

            <!-- Name & role (hidden on small screens) -->
            <div class="hidden md:block text-left">
              <p class="text-sm font-medium text-surface-800 leading-tight truncate max-w-[140px]">
                {{ userName }}
              </p>
              <p class="text-[0.65rem] text-surface-400 capitalize">
                {{ userRole | titlecase }}
              </p>
            </div>

            <!-- Chevron -->
            <svg
              class="hidden md:block w-4 h-4 text-surface-400 transition-transform duration-200"
              [class.rotate-180]="isProfileOpen"
              viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>

          <!-- Dropdown menu -->
          @if (isProfileOpen) {
            <div
              class="absolute right-0 mt-2 w-56 rounded-bloom border border-surface-200
                     bg-surface shadow-bloom-lg py-1 z-50 animate-scale-in origin-top-right"
              role="menu"
            >
              <!-- Profile header -->
              <div class="px-4 py-3 border-b border-surface-200">
                <p class="text-sm font-semibold text-surface-800">{{ userName }}</p>
                <p class="text-xs text-surface-400 truncate">{{ userEmail }}</p>
              </div>

              <!-- Menu items -->
              <button
                class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-surface-600
                       hover:bg-surface-50 hover:text-surface-800 transition-colors"
                (click)="profileClick.emit(); closeProfileMenu()"
                role="menuitem"
              >
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" stroke-width="2"
                     stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                My Profile
              </button>

              <button
                class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-surface-600
                       hover:bg-surface-50 hover:text-surface-800 transition-colors"
                (click)="settingsClick.emit(); closeProfileMenu()"
                role="menuitem"
              >
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" stroke-width="2"
                     stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83
                           2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33
                           1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65
                           1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2
                           2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15
                           1.65 1.65 0 003.17 14H3a2 2 0 010-4h.09A1.65
                           1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2
                           2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68
                           1.65 1.65 0 0010 3.17V3a2 2 0 014 0v.09a1.65
                           1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2
                           2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.32 9
                           1.65 1.65 0 0020.83 10H21a2 2 0 010 4h-.09a1.65
                           1.65 0 00-1.51 1z" />
                </svg>
                Settings
              </button>

              <div class="my-1 border-t border-surface-200"></div>

              <button
                class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-error-600
                       hover:bg-error-50 transition-colors"
                (click)="logoutClick.emit(); closeProfileMenu()"
                role="menuitem"
              >
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" stroke-width="2"
                     stroke-linecap="round" stroke-linejoin="round">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Log out
              </button>
            </div>
          }
        </div>
      </div>
    </header>
  `,
  styles: [`
    :host {
      display: block;
    }
  `],
})
export class TopNavigationBarComponent {
  private elementRef = inject(ElementRef);

  /* ── Inputs ────────────────────────────── */
  @Input() userName = '';
  @Input() userEmail = '';
  @Input() userRole = '';
  @Input() userAvatar: string | null = null;
  @Input() notificationCount: number | null = 0;
  @Input() showBrandInTopbar = false;

  /* ── Outputs ───────────────────────────── */
  @Output() menuToggle = new EventEmitter<void>();
  @Output() notificationsClick = new EventEmitter<void>();
  @Output() profileClick = new EventEmitter<void>();
  @Output() settingsClick = new EventEmitter<void>();
  @Output() logoutClick = new EventEmitter<void>();

  /* ── State ─────────────────────────────── */
  isProfileOpen = false;

  /* ── Computed ──────────────────────────── */
  get userInitials(): string {
    if (!this.userName) return '?';
    return this.userName
      .split(' ')
      .map(part => part.charAt(0))
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  /* ── Actions ───────────────────────────── */
  toggleProfileMenu(): void {
    this.isProfileOpen = !this.isProfileOpen;
  }

  closeProfileMenu(): void {
    this.isProfileOpen = false;
  }

  /* Close dropdown when clicking outside */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isProfileOpen = false;
    }
  }
}
