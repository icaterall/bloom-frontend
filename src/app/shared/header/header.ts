import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { LucideAngularModule, Menu, X, ChevronDown, Globe, User, Phone, Mail, LogOut, LayoutDashboard, Settings } from 'lucide-angular';
import { TranslationService } from '../services/translation.service';
import { TranslatePipe } from '../pipes/translate.pipe';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { User as AppUser } from '../models/user.model';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterModule, LucideAngularModule, TranslatePipe, HttpClientModule],
  templateUrl: './header.html',
  styleUrls: ['./header.scss'],
  standalone: true
})
export class HeaderComponent implements OnInit {
  readonly MenuIcon = Menu;
  readonly XIcon = X;
  readonly ChevronDownIcon = ChevronDown;
  readonly GlobeIcon = Globe;
  readonly UserIcon = User;
  readonly PhoneIcon = Phone;
  readonly MailIcon = Mail;
  readonly LogOutIcon = LogOut;
  readonly LayoutDashboardIcon = LayoutDashboard;
  readonly SettingsIcon = Settings;

  isMenuOpen = false;
  isUserMenuOpen = false;
  isScrolled = false;
  currentLanguage = 'my'; // Default to Malay
  currentUser: AppUser | null = null;

  constructor(
    public translationService: TranslationService,
    public authService: AuthService,
    private router: Router
  ) {
    // Subscribe to language changes
    this.translationService.currentLang$.subscribe(lang => {
      this.currentLanguage = lang;
    });
  }

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled = window.scrollY > 20;
  }

  // Close dropdown when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-menu-container')) {
      this.isUserMenuOpen = false;
    }
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  toggleUserMenu() {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  logout() {
    this.authService.logout();
    this.isUserMenuOpen = false;
    this.isMenuOpen = false;
  }

  getDashboardLink(): string {
    if (!this.currentUser) return '/';
    
    switch (this.currentUser.role) {
      case 'admin': return '/admin/dashboard';
      case 'parent': return '/parent/dashboard';
      case 'staff': return '/staff/dashboard';
      default: return '/';
    }
  }

  toggleLanguage() {
    this.translationService.toggleLanguage();
    const newLang = this.translationService.getCurrentLanguage();
    
    // If user is logged in, update preference
    if (this.authService.isAuthenticatedUser()) {
      this.authService.updateProfile({ preferred_language: newLang }).subscribe({
        error: (err) => console.error('Failed to update language preference', err)
      });
    }
  }
}
