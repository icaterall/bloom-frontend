import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../shared/models/user.model';
import { LucideAngularModule, Baby, Calendar, Target, MessageSquare, FileText, TrendingUp, Bell, Settings, LogOut } from 'lucide-angular';

@Component({
  selector: 'app-parent-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './parent-dashboard.component.html',
  styleUrls: ['./parent-dashboard.component.css']
})
export class ParentDashboardComponent implements OnInit {
  currentUser: User | null = null;

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

  // Sample child data (will be loaded from API later)
  childInfo = {
    name: 'Ahmad',
    age: 5,
    programme: 'Early Intervention',
    nextSession: 'Tomorrow, 10:00 AM',
    therapist: 'Ms. Sarah'
  };

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

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
  }

  logout(): void {
    this.authService.logout();
  }
}
