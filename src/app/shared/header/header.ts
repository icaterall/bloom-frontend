import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, Menu, X, ChevronDown, Globe, User, Phone, Mail } from 'lucide-angular';
import { TranslationService } from '../services/translation.service';
import { TranslatePipe } from '../pipes/translate.pipe';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterModule, LucideAngularModule, TranslatePipe, HttpClientModule],
  templateUrl: './header.html',
  styleUrls: ['./header.scss'],
  standalone: true
})
export class HeaderComponent {
  readonly MenuIcon = Menu;
  readonly XIcon = X;
  readonly ChevronDownIcon = ChevronDown;
  readonly GlobeIcon = Globe;
  readonly UserIcon = User;
  readonly PhoneIcon = Phone;
  readonly MailIcon = Mail;

  isMenuOpen = false;
  isScrolled = false;
  currentLanguage = 'my'; // Default to Malay

  constructor(
    public translationService: TranslationService,
    private authService: AuthService
  ) {
    // Subscribe to language changes
    this.translationService.currentLang$.subscribe(lang => {
      this.currentLanguage = lang;
    });
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled = window.scrollY > 20;
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
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
