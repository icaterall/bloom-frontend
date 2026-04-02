import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import {
  LucideAngularModule,
  LayoutDashboard, Bell, XCircle, UserCheck, CalendarDays,
  Users, Baby, Stethoscope, Clock, Home, FileText,
  LogOut, ChevronLeft
} from 'lucide-angular';
import { AuthService } from '../../../core/services/auth.service';
import { TranslationService } from '../../../shared/services/translation.service';
import { User } from '../../../shared/models/user.model';

interface NavItem {
  label: string;
  route: string;
  icon: any;
  exact?: boolean;
}

@Component({
  selector: 'app-clinical-manager-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './clinical-manager-layout.component.html',
  styleUrls: ['./clinical-manager-layout.component.css']
})
export class ClinicalManagerLayoutComponent implements OnInit {
  currentUser: User | null = null;
  sidebarCollapsed = false;
  isMobile = false;

  // Icons
  readonly ChevronLeftIcon = ChevronLeft;
  readonly LogOutIcon = LogOut;

  readonly navItems: NavItem[] = [
    { label: 'Dashboard',         route: '/clinical-manager/dashboard',      icon: LayoutDashboard, exact: true },
    { label: 'Bookings',          route: '/clinical-manager/bookings',       icon: Bell },
    { label: 'Failed Bookings',   route: '/clinical-manager/bookings/failed', icon: XCircle },
    { label: 'Assign Cases',      route: '/clinical-manager/assignments',    icon: UserCheck },
    { label: 'Sessions Calendar', route: '/clinical-manager/calendar',       icon: CalendarDays },
    { label: 'Parents & Children', route: '/clinical-manager/parents',       icon: Users },
    { label: 'Children',          route: '/clinical-manager/children',       icon: Baby },
    { label: 'Therapists',        route: '/clinical-manager/therapists',     icon: Stethoscope },
    { label: 'Waitlist',          route: '/clinical-manager/waitlist',       icon: Clock },
    { label: 'Tours & Visits',    route: '/clinical-manager/tours',         icon: Home },
    { label: 'Reports',           route: '/clinical-manager/reports',        icon: FileText },
  ];

  constructor(
    private authService: AuthService,
    private translationService: TranslationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.checkViewport();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.checkViewport();
  }

  toggleCollapse(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  closeMobile(): void {
    if (this.isMobile) {
      this.sidebarCollapsed = true;
    }
  }

  navigateToDashboard(): void {
    this.router.navigate(['/clinical-manager/dashboard']);
  }

  logout(): void {
    this.authService.logout();
  }

  private checkViewport(): void {
    this.isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;
  }
}
