import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, Menu, X, ChevronDown, Globe, User, Phone, Mail } from 'lucide-angular';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterModule, LucideAngularModule],
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
  currentLanguage = 'en';

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled = window.scrollY > 20;
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  toggleLanguage() {
    this.currentLanguage = this.currentLanguage === 'en' ? 'ms' : 'en';
  }
}
