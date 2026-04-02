import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import {
  LucideAngularModule,
  LayoutDashboard,
  Compass,
  UserPlus,
  Baby,
  Users,
  BarChart3,
  LogOut,
  ChevronLeft,
  Menu,
} from 'lucide-angular';
import { AuthService } from '../../../core/services/auth.service';

/* ─────────────────────────────────────────
   Admin Nav Item Model
   ───────────────────────────────────────── */
export interface AdminNavItem {
  label: string;
  route: string;
  icon: any;            // Lucide icon reference
  badge?: string | number;
  exact?: boolean;      // routerLinkActiveOptions exact match
}

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './admin-sidebar.component.html',
  styleUrls: ['./admin-sidebar.component.css'],
})
export class AdminSidebarComponent {
  @Input()  collapsed = false;
  @Output() collapsedChange = new EventEmitter<boolean>();

  isMobile = false;

  /* ── Icon references ────────────────── */
  readonly ChevronLeftIcon = ChevronLeft;
  readonly MenuIcon        = Menu;
  readonly LogOutIcon      = LogOut;

  /* ── Primary navigation items ───────── */
  readonly navItems: AdminNavItem[] = [
    { label: 'Overview',       route: '/admin/dashboard', icon: LayoutDashboard, exact: true },
    { label: 'Tours & Visits', route: '/admin/tours',     icon: Compass },
    { label: 'Leads',          route: '/admin/leads',     icon: UserPlus },
    { label: 'Children',       route: '/admin/children',  icon: Baby },
    { label: 'Staff',          route: '/admin/staff',     icon: Users },
    { label: 'Reports',        route: '/admin/reports',   icon: BarChart3 },
  ];

  constructor(
    private router: Router,
    private authService: AuthService,
  ) {
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

  closeMobile(): void {
    if (this.isMobile) {
      this.collapsed = true;
      this.collapsedChange.emit(true);
    }
  }

  navigateToDashboard(): void {
    this.router.navigate(['/admin/dashboard']);
  }

  logout(): void {
    this.authService.logout();
  }

  private checkViewport(): void {
    this.isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;
  }
}
