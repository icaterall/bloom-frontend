import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../shared/models/user.model';
import { LucideAngularModule, Bell, Search, Settings } from 'lucide-angular';

@Component({
  selector: 'app-admin-header',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './admin-header.component.html',
  styleUrls: ['./admin-header.component.css'],
})
export class AdminHeaderComponent {
  currentUser: User | null = null;

  readonly BellIcon     = Bell;
  readonly SearchIcon   = Search;
  readonly SettingsIcon = Settings;

  constructor(private authService: AuthService) {
    this.currentUser = this.authService.getCurrentUser();
  }

  get userInitial(): string {
    return this.currentUser?.name?.charAt(0)?.toUpperCase() || 'A';
  }
}
