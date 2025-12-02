import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../shared/models/user.model';
import { TranslationService } from '../../../shared/services/translation.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  currentUser: User | null = null;
  currentLanguage: 'en' | 'my' = 'en';

  // Dashboard data (static for now)
  dashboardStats = {
    todayTours: 3,
    newLeads: 8,
    activeChildren: 42,
    pendingEnrollments: 5
  };

  recentActivities = [
    { type: 'tour', message: 'New tour booked for tomorrow', time: '2 hours ago' },
    { type: 'lead', message: 'New inquiry from parent', time: '3 hours ago' },
    { type: 'enrollment', message: 'Child enrolled in Early Intervention', time: '5 hours ago' },
    { type: 'payment', message: 'Payment received for monthly fee', time: '1 day ago' }
  ];

  constructor(
    private authService: AuthService,
    private translationService: TranslationService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.translationService.currentLang$.subscribe(lang => {
      this.currentLanguage = lang as 'en' | 'my';
    });
  }

  toggleLanguage(): void {
    this.translationService.toggleLanguage();
  }
}
