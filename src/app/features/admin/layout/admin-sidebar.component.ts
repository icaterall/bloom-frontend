import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { LucideAngularModule, Users, Calendar, UserPlus, Baby, TrendingUp, Settings, LogOut, ChevronDown, ChevronRight } from 'lucide-angular';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './admin-sidebar.component.html',
  styleUrls: ['./admin-sidebar.component.css']
})
export class AdminSidebarComponent {
  // UI state
  settingsOpen = true;

  // Icons
  UsersIcon = Users;
  CalendarIcon = Calendar;
  UserPlusIcon = UserPlus;
  BabyIcon = Baby;
  TrendingUpIcon = TrendingUp;
  SettingsIcon = Settings;
  LogOutIcon = LogOut;
  ChevronDownIcon = ChevronDown;
  ChevronRightIcon = ChevronRight;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  navigateToDashboard(): void {
    this.router.navigate(['/admin/dashboard']);
  }

  logout(): void {
    this.authService.logout();
  }
}
