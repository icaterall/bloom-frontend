import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { TranslationService } from '../../../shared/services/translation.service';
import { User } from '../../../shared/models/user.model';
import { 
  LucideAngularModule, 
  Bell, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  LayoutDashboard, 
  User as UserIcon,
  FileText,
  MessageSquare,
  Calendar,
  ChevronLeft,
  ChevronRight
} from 'lucide-angular';

@Component({
  selector: 'app-parent-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './parent-layout.component.html'
})
export class ParentLayoutComponent implements OnInit {
  currentUser: User | null = null;
  currentLanguage = 'my';
  isSidebarOpen = true;
  isMobile = false;
  
  // Icons
  BellIcon = Bell;
  SettingsIcon = Settings;
  LogOutIcon = LogOut;
  MenuIcon = Menu;
  XIcon = X;
  DashboardIcon = LayoutDashboard;
  UserIcon = UserIcon;
  FileTextIcon = FileText;
  MessageSquareIcon = MessageSquare;
  CalendarIcon = Calendar;
  ChevronLeftIcon = ChevronLeft;
  ChevronRightIcon = ChevronRight;

  menuItems = [
    { label: 'Dashboard', icon: this.DashboardIcon, route: '/parent/dashboard' },
    { label: 'Profile Settings', icon: this.SettingsIcon, route: '/parent/settings' },
    // Placeholders for future features
    // { label: 'Reports', icon: this.FileTextIcon, route: '/parent/reports' },
    // { label: 'Messages', icon: this.MessageSquareIcon, route: '/parent/messages' },
    // { label: 'Schedule', icon: this.CalendarIcon, route: '/parent/schedule' },
  ];

  constructor(
    private authService: AuthService,
    private translationService: TranslationService,
    private router: Router
  ) {
     this.translationService.currentLang$.subscribe(lang => {
      this.currentLanguage = lang;
    });
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.checkScreenSize();
    window.addEventListener('resize', () => this.checkScreenSize());
  }

  checkScreenSize() {
    this.isMobile = window.innerWidth < 1024; // lg breakpoint
    if (this.isMobile) {
      this.isSidebarOpen = false;
    } else {
      this.isSidebarOpen = true;
    }
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  logout(): void {
    this.authService.logout();
  }

  toggleLanguage(): void {
    this.translationService.toggleLanguage();
    const newLang = this.translationService.getCurrentLanguage();
    if (this.authService.isAuthenticatedUser()) {
      this.authService.updateProfile({ preferred_language: newLang }).subscribe({
        error: (err) => console.error('Failed to update language preference', err)
      });
    }
  }
}
