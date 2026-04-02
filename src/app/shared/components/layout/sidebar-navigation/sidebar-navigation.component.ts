import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

/* ─────────────────────────────────────────
   Navigation Item Model
   ───────────────────────────────────────── */
export interface NavItem {
  label: string;
  route: string;
  icon: string;          // SVG path data (d="...")
  badge?: string | number;
  children?: NavItem[];
}

/**
 * SidebarNavigationComponent
 * ──────────────────────────
 * A collapsible side navigation for the staff/enterprise shell.
 * Highlights the active route with brand-primary blue.
 *
 * Usage:
 *   <bloom-sidebar
 *     [navItems]="menuItems"
 *     [collapsed]="isSidebarCollapsed"
 *     (collapsedChange)="isSidebarCollapsed = $event"
 *   />
 */
@Component({
  selector: 'bloom-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Backdrop (mobile) -->
    @if (!collapsed && isMobile) {
      <div
        class="fixed inset-0 z-30 bg-surface-900/40 backdrop-blur-sm lg:hidden"
        (click)="collapse()"
      ></div>
    }

    <aside
      class="group/sidebar flex flex-col h-full bg-surface border-r border-surface-200
             transition-all duration-250 ease-bloom z-40 overflow-hidden"
      [class.w-72]="!collapsed"
      [class.w-[4.5rem]]="collapsed && !isMobile"
      [class.fixed]="isMobile"
      [class.translate-x-0]="!collapsed || !isMobile"
      [class.-translate-x-full]="collapsed && isMobile"
      [class.shadow-bloom-xl]="isMobile && !collapsed"
    >
      <!-- ── Brand header ────────────────── -->
      <div class="flex items-center h-16 px-4 border-b border-surface-200 shrink-0">
        <!-- Logo mark -->
        <div class="flex items-center justify-center w-10 h-10 rounded-bloom-sm
                    bg-brand-primary shrink-0">
          <svg class="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
            <path d="M8 14s1.5 2 4 2 4-2 4-2" />
            <circle cx="9" cy="9" r="1" fill="currentColor" />
            <circle cx="15" cy="9" r="1" fill="currentColor" />
          </svg>
        </div>

        <!-- Brand name (hidden when collapsed) -->
        @if (!collapsed) {
          <div class="ml-3 overflow-hidden">
            <p class="text-sm font-bold text-surface-800 truncate leading-tight">
              Bloom Spectrum
            </p>
            <p class="text-[0.65rem] text-surface-400 font-medium uppercase tracking-wider">
              Centre
            </p>
          </div>
        }
      </div>

      <!-- ── Navigation items ────────────── -->
      <nav class="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-thin">
        @for (item of navItems; track item.route) {
          <a
            [routerLink]="item.route"
            routerLinkActive="bloom-nav-active"
            [routerLinkActiveOptions]="{ exact: item.route === '/dashboard' }"
            class="group flex items-center gap-3 rounded-bloom-sm px-3 py-2.5
                   text-sm font-medium text-surface-600
                   transition-all duration-150 ease-bloom
                   hover:bg-brand-primary-50 hover:text-brand-primary
                   focus-visible:outline-none focus-visible:ring-2
                   focus-visible:ring-brand-primary-500 focus-visible:ring-offset-1"
            [class.justify-center]="collapsed"
            [attr.title]="collapsed ? item.label : null"
          >
            <!-- Icon -->
            <svg
              class="w-5 h-5 shrink-0 transition-colors duration-150"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path [attr.d]="item.icon" />
            </svg>

            <!-- Label (hidden when collapsed) -->
            @if (!collapsed) {
              <span class="truncate">{{ item.label }}</span>

              <!-- Badge -->
              @if (item.badge) {
                <span class="ml-auto inline-flex items-center justify-center
                             h-5 min-w-[1.25rem] px-1.5 rounded-bloom-full
                             bg-brand-primary text-[0.625rem] font-bold text-white">
                  {{ item.badge }}
                </span>
              }
            }
          </a>
        }
      </nav>

      <!-- ── Collapse toggle ─────────────── -->
      <div class="border-t border-surface-200 px-3 py-3 shrink-0">
        <button
          (click)="toggleCollapse()"
          class="flex items-center justify-center w-full gap-2 rounded-bloom-sm
                 px-3 py-2 text-sm font-medium text-surface-500
                 hover:bg-surface-100 hover:text-surface-700
                 transition-all duration-150 ease-bloom
                 focus-visible:outline-none focus-visible:ring-2
                 focus-visible:ring-brand-primary-500"
        >
          <svg
            class="w-5 h-5 transition-transform duration-250 ease-bloom"
            [class.rotate-180]="collapsed"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
          @if (!collapsed) {
            <span>Collapse</span>
          }
        </button>
      </div>
    </aside>
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
    }

    /* Active route highlight — brand-primary blue */
    :host ::ng-deep .bloom-nav-active {
      background-color: rgba(38, 99, 235, 0.08);
      color: #2663EB;
      font-weight: 600;
    }

    :host ::ng-deep .bloom-nav-active svg {
      color: #2663EB;
    }

    /* Thin scrollbar for nav overflow */
    .scrollbar-thin {
      scrollbar-width: thin;
      scrollbar-color: #CBD5E1 transparent;
    }
    .scrollbar-thin::-webkit-scrollbar {
      width: 4px;
    }
    .scrollbar-thin::-webkit-scrollbar-thumb {
      background-color: #CBD5E1;
      border-radius: 9999px;
    }
  `],
})
export class SidebarNavigationComponent {
  @Input() navItems: NavItem[] = [];
  @Input() collapsed = false;
  @Output() collapsedChange = new EventEmitter<boolean>();

  isMobile = false;

  constructor() {
    this.checkViewport();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.checkViewport();
  }

  toggleCollapse(): void {
    this.collapsed = !this.collapsed;
    this.collapsedChange.emit(this.collapsed);
  }

  collapse(): void {
    this.collapsed = true;
    this.collapsedChange.emit(true);
  }

  private checkViewport(): void {
    this.isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;
  }
}
