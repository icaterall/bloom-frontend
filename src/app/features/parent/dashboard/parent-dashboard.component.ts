import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ChildService } from '../../../core/services/child.service';
import { TranslationService } from '../../../shared/services/translation.service';
import { User } from '../../../shared/models/user.model';
import { Child } from '../../../shared/models/child.model';
import { AddChildModalComponent } from '../components/add-child-modal/add-child-modal.component';
import { LucideAngularModule, Baby, Calendar, Target, MessageSquare, FileText, TrendingUp, Bell, Settings, LogOut, Plus, CheckCircle } from 'lucide-angular';

@Component({
  selector: 'app-parent-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    LucideAngularModule, 
    AddChildModalComponent
  ],
  templateUrl: './parent-dashboard.component.html',
  styleUrls: ['./parent-dashboard.component.css']
})
export class ParentDashboardComponent implements OnInit {
  currentUser: User | null = null;
  children: Child[] = [];
  isLoading = true;
  showAddChildModal = false;
  currentLanguage = 'my';

  // Icons
  BabyIcon = Baby;
  CalendarIcon = Calendar;
  TargetIcon = Target;
  MessageSquareIcon = MessageSquare;
  FileTextIcon = FileText;
  TrendingUpIcon = TrendingUp;
  BellIcon = Bell;
  SettingsIcon = Settings;
  LogOutIcon = LogOut;
  PlusIcon = Plus;
  CheckCircleIcon = CheckCircle;

  // Sample data (will be replaced with real data later)
  upcomingSessions = [
    { date: 'Tomorrow', time: '10:00 AM', type: 'Individual Therapy', therapist: 'Ms. Sarah' },
    { date: 'Friday', time: '2:00 PM', type: 'Group Activity', therapist: 'Mr. John' },
    { date: 'Next Monday', time: '10:00 AM', type: 'Assessment', therapist: 'Ms. Sarah' }
  ];

  recentProgress = [
    { area: 'Communication', progress: 'Improved eye contact during conversations', date: '2 days ago' },
    { area: 'Social Skills', progress: 'Participated in group play for 15 minutes', date: '3 days ago' },
    { area: 'Daily Living', progress: 'Successfully used utensils during lunch', date: '1 week ago' }
  ];

  constructor(
    private authService: AuthService,
    private childService: ChildService,
    private translationService: TranslationService
  ) {
    this.translationService.currentLang$.subscribe(lang => {
      this.currentLanguage = lang;
    });
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadChildren();
  }

  loadChildren(): void {
    this.isLoading = true;
    this.childService.getChildren().subscribe({
      next: (response) => {
        if (response.success && Array.isArray(response.data)) {
          this.children = response.data;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading children:', error);
        this.isLoading = false;
      }
    });
  }

  openAddChildModal(): void {
    this.showAddChildModal = true;
  }

  closeAddChildModal(): void {
    this.showAddChildModal = false;
  }

  onChildAdded(): void {
    this.loadChildren();
  }

  logout(): void {
    this.authService.logout();
  }

  toggleLanguage(): void {
    this.translationService.toggleLanguage();
    const newLang = this.translationService.getCurrentLanguage();
    
    // If user is logged in, update preference
    if (this.authService.isAuthenticatedUser()) {
      this.authService.updateProfile({ preferred_language: newLang }).subscribe({
        error: (err) => console.error('Failed to update language preference', err)
      });
    }
  }

  // Helper to calculate age
  calculateAge(dateOfBirth: string): number {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }
}

