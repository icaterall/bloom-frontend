import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { TranslationService } from '../../../shared/services/translation.service';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { User } from '../../../shared/models/user.model';
import { 
  LucideAngularModule, 
  Bell, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Home,
  CalendarPlus,
  Calendar,
  CreditCard,
  FileText,
  ChevronLeft,
  ChevronRight,
  User as UserIcon,
  Clock
} from 'lucide-angular';

@Component({
  selector: 'app-parent-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, TranslatePipe],
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
  HomeIcon = Home;
  CalendarPlusIcon = CalendarPlus;
  CalendarIcon = Calendar;
  ClockIcon = Clock;
  CreditCardIcon = CreditCard;
  FileTextIcon = FileText;
  ChevronLeftIcon = ChevronLeft;
  ChevronRightIcon = ChevronRight;
  UserIcon = UserIcon;

  menuItems = [
    { icon: this.HomeIcon, labelKey: 'navigation.home', route: '/parent/home' },
    { icon: this.CalendarIcon, labelKey: 'navigation.schedule', route: '/parent/schedule' },
    { icon: this.ClockIcon, labelKey: 'navigation.sessions', route: '/parent/sessions' },
    { icon: this.FileTextIcon, labelKey: 'navigation.childUpdates', route: '/parent/updates' },
    { icon: this.CreditCardIcon, labelKey: 'navigation.payments', route: '/parent/payments' },
    { icon: this.SettingsIcon, labelKey: 'navigation.settings', route: '/parent/settings' },
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
      // Always keep sidebar open on desktop
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
