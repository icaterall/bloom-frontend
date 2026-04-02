import { Component, ChangeDetectionStrategy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarNavigationComponent, NavItem } from '../sidebar-navigation/sidebar-navigation.component';
import { TopNavigationBarComponent } from '../top-navigation-bar/top-navigation-bar.component';
import { AuthService } from '../../../../core/services/auth.service';

/**
 * MainLayoutComponent
 * ────────────────────
 * The enterprise application shell that wraps every authenticated page.
 * Combines the sidebar, top-bar, and <router-outlet> in a responsive
 * Flexbox layout. The sidebar and top-bar are fixed while the main
 * content area scrolls independently.
 *
 * Usage (in routing):
 *   {
 *     path: '',
 *     component: MainLayoutComponent,
 *     children: [
 *       { path: 'dashboard', component: DashboardComponent },
 *       ...
 *     ]
 *   }
 */
@Component({
  selector: 'bloom-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    SidebarNavigationComponent,
    TopNavigationBarComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex h-screen overflow-hidden bg-surface-50">
      <!-- ── Sidebar ─────────────────────── -->
      <bloom-sidebar
        [navItems]="navItems()"
        [collapsed]="sidebarCollapsed()"
        (collapsedChange)="sidebarCollapsed.set($event)"
      />

      <!-- ── Main column ─────────────────── -->
      <div
        class="flex flex-col flex-1 min-w-0 transition-all duration-250 ease-bloom"
      >
        <!-- Top navigation bar -->
        <bloom-topbar
          [userName]="userName()"
          [userEmail]="userEmail()"
          [userRole]="userRole()"
          [userAvatar]="userAvatar()"
          [notificationCount]="notificationCount()"
          [showBrandInTopbar]="sidebarCollapsed()"
          (menuToggle)="sidebarCollapsed.set(!sidebarCollapsed())"
          (notificationsClick)="onNotificationsClick()"
          (profileClick)="onProfileClick()"
          (settingsClick)="onSettingsClick()"
          (logoutClick)="onLogout()"
        />

        <!-- Scrollable content area -->
        <main
          class="flex-1 overflow-y-auto overflow-x-hidden"
          id="main-content"
          role="main"
        >
          <div class="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <router-outlet />
          </div>
        </main>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100vh;
    }
  `],
})
export class MainLayoutComponent {
  private authService = inject(AuthService);

  /* ─────────────────────────────────────────
     Reactive State (Angular Signals)
     ───────────────────────────────────────── */
  sidebarCollapsed = signal(false);
  notificationCount = signal(3);

  /* ── User info derived from AuthService ── */
  userName = signal('Ashraf Rahman');
  userEmail = signal('ashqahman@gmail.com');
  userRole = signal('Admin');
  userAvatar = signal<string | null>(null);

  /* ─────────────────────────────────────────
     Navigation Configuration
     Role-based menus can be computed from the
     current user's role via the AuthService.
     ───────────────────────────────────────── */
  navItems = computed<NavItem[]>(() => [
    {
      label: 'Dashboard',
      route: '/admin/dashboard',
      icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1',
    },
    {
      label: 'Bookings',
      route: '/admin/bookings',
      icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
      badge: 5,
    },
    {
      label: 'Children',
      route: '/admin/children',
      icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
    },
    {
      label: 'Therapists',
      route: '/admin/therapists',
      icon: 'M5.121 17.804A9 9 0 0112 15c2.59 0 4.926 1.093 6.879 2.804M15 10a3 3 0 11-6 0 3 3 0 016 0z',
    },
    {
      label: 'Finance',
      route: '/admin/finance',
      icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    },
    {
      label: 'Reports',
      route: '/admin/reports',
      icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    },
    {
      label: 'Users',
      route: '/admin/users',
      icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
    },
    {
      label: 'Settings',
      route: '/admin/settings',
      icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
    },
  ]);

  /* ─────────────────────────────────────────
     Event Handlers
     ───────────────────────────────────────── */
  onNotificationsClick(): void {
    // TODO: Open notifications panel
    console.log('[MainLayout] Notifications clicked');
  }

  onProfileClick(): void {
    // TODO: Navigate to profile page
    console.log('[MainLayout] Profile clicked');
  }

  onSettingsClick(): void {
    // TODO: Navigate to settings page
    console.log('[MainLayout] Settings clicked');
  }

  onLogout(): void {
    this.authService.logout();
  }
}
