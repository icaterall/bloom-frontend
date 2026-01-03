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
  CreditCard,
  Banknote,
  FileText,
  Folder,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  User as UserIcon
} from 'lucide-angular';

@Component({
  selector: 'app-finance-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, TranslatePipe],
  templateUrl: './finance-layout.component.html'
})
export class FinanceLayoutComponent implements OnInit {
  currentUser: User | null = null;
  currentLanguage = 'en';
  isSidebarOpen = true;
  isMobile = false;
  isProfileMenuOpen = false;
  
  // Icons
  BellIcon = Bell;
  SettingsIcon = Settings;
  LogOutIcon = LogOut;
  MenuIcon = Menu;
  XIcon = X;
  HomeIcon = Home;
  CreditCardIcon = CreditCard;
  BanknoteIcon = Banknote;
  FileTextIcon = FileText;
  ReceiptIcon = FileText; // Using FileText as Receipt icon (lucide doesn't have Receipt)
  FolderIcon = Folder;
  BarChart3Icon = BarChart3;
  ChevronLeftIcon = ChevronLeft;
  ChevronRightIcon = ChevronRight;
  UserIcon = UserIcon;

  menuItems = [
    { icon: this.HomeIcon, labelKey: 'finance.nav.dashboard', route: '/finance/dashboard' },
    { icon: this.CreditCardIcon, labelKey: 'finance.nav.payments', route: '/finance/payments' },
    { icon: this.BanknoteIcon, labelKey: 'finance.nav.cashDesk', route: '/finance/cash' },
    { icon: this.FileTextIcon, labelKey: 'finance.nav.invoices', route: '/finance/invoices' },
    { icon: this.ReceiptIcon, labelKey: 'finance.nav.receipts', route: '/finance/receipts' },
    { icon: this.FolderIcon, labelKey: 'finance.nav.statements', route: '/finance/statements' },
    { icon: this.BarChart3Icon, labelKey: 'finance.nav.reports', route: '/finance/reports' },
    { icon: this.SettingsIcon, labelKey: 'finance.nav.settings', route: '/finance/settings' },
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
      // TODO: Update user preference in backend
    }
  }

  toggleProfileMenu(): void {
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }

  closeProfileMenu(): void {
    this.isProfileMenuOpen = false;
  }
}

