import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { TranslationService } from '../../../shared/services/translation.service';
import { User } from '../../../shared/models/user.model';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-clinical-manager-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './clinical-manager-layout.component.html'
})
export class ClinicalManagerLayoutComponent implements OnInit {
  currentUser: User | null = null;
  currentLanguage = 'my';
  isSidebarOpen = true;
  isMobile = false;
  isUserMenuOpen = false;

  menuItems = [
    { 
      labelEn: 'Dashboard', 
      labelMy: 'Papan Pemuka', 
      route: '/clinical-manager/dashboard',
      icon: '📊'
    },
    { 
      labelEn: 'Bookings', 
      labelMy: 'Tempahan', 
      route: '/clinical-manager/bookings',
      icon: '🔔'
    },
    { 
      labelEn: 'Sessions Calendar', 
      labelMy: 'Kalendar Sesi', 
      route: '/clinical-manager/calendar',
      icon: '📅'
    },
    { 
      labelEn: 'Children', 
      labelMy: 'Kanak-kanak', 
      route: '/clinical-manager/children',
      icon: '👶'
    },
    { 
      labelEn: 'Therapists', 
      labelMy: 'Ahli Terapi', 
      route: '/clinical-manager/therapists',
      icon: '👥'
    },
    { 
      labelEn: 'Waitlist', 
      labelMy: 'Senarai Menunggu', 
      route: '/clinical-manager/waitlist',
      icon: '⏳'
    },
    { 
      labelEn: 'Reports', 
      labelMy: 'Laporan', 
      route: '/clinical-manager/reports',
      icon: '📄'
    },
    { 
      labelEn: 'Messages', 
      labelMy: 'Mesej', 
      route: '/clinical-manager/messages',
      icon: '💬'
    }
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
    this.isMobile = window.innerWidth < 1024;
    if (this.isMobile) {
      this.isSidebarOpen = false;
    } else {
      this.isSidebarOpen = true;
    }
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  toggleUserMenu(): void {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  logout(): void {
    this.authService.logout();
    this.isUserMenuOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.cm-user-menu')) {
      this.isUserMenuOpen = false;
    }
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

  getMenuLabel(item: any): string {
    return this.currentLanguage === 'en' ? item.labelEn : item.labelMy;
  }
}
