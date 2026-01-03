import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { TranslationService } from '../../../shared/services/translation.service';
import { TherapistNotificationsService } from '../../../core/services/therapist-notifications.service';
import { SocketService } from '../../../core/services/socket.service';
import { User } from '../../../shared/models/user.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-therapist-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './therapist-layout.component.html'
})
export class TherapistLayoutComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  currentLanguage = 'my';
  isSidebarOpen = true;
  isMobile = false;
  isUserMenuOpen = false;
  unreadNotificationsCount = 0;
  private subscriptions = new Subscription();

  menuItems = [
    { 
      labelEn: 'Dashboard', 
      labelMy: 'Papan Pemuka', 
      route: '/therapist/dashboard',
      icon: '📊'
    },
    { 
      labelEn: 'My Bookings', 
      labelMy: 'Tempahan Saya', 
      route: '/therapist/bookings',
      icon: '📅'
    },
    { 
      labelEn: 'Child Cases', 
      labelMy: 'Kes Kanak-kanak', 
      route: '/therapist/cases',
      icon: '👶'
    }
  ];

  constructor(
    private authService: AuthService,
    private translationService: TranslationService,
    private router: Router,
    private notificationsService: TherapistNotificationsService,
    private socketService: SocketService
  ) {
    this.translationService.currentLang$.subscribe(lang => {
      this.currentLanguage = lang;
    });
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.checkMobile();
    this.loadNotificationCount();
    this.setupSocketListeners();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadNotificationCount(): void {
    this.notificationsService.getNotifications(true).subscribe({
      next: (response) => {
        if (response.success) {
          this.unreadNotificationsCount = response.unreadCount;
        }
      },
      error: (error) => {
        console.error('Error loading notification count:', error);
      }
    });
  }

  setupSocketListeners(): void {
    // Listen for new notifications
    const notifSub = this.socketService.getNotifications().subscribe(() => {
      this.loadNotificationCount();
    });
    this.subscriptions.add(notifSub);
  }

  @HostListener('window:resize')
  onResize(): void {
    this.checkMobile();
  }

  checkMobile(): void {
    this.isMobile = window.innerWidth < 1024;
    if (this.isMobile) {
      this.isSidebarOpen = false;
    }
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  toggleUserMenu(): void {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  toggleLanguage(): void {
    const newLang = this.currentLanguage === 'en' ? 'my' : 'en';
    this.translationService.setLanguage(newLang);
  }

  getMenuLabel(item: any): string {
    return this.currentLanguage === 'en' ? item.labelEn : item.labelMy;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

