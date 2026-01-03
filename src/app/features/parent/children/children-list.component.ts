import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ChildService } from '../../../core/services/child.service';
import { Child } from '../../../shared/models/child.model';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { LucideAngularModule, Users, Plus } from 'lucide-angular';

@Component({
  selector: 'app-children-list',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe, LucideAngularModule],
  templateUrl: './children-list.component.html'
})
export class ChildrenListComponent implements OnInit {
  children: Child[] = [];
  isLoading = false;

  readonly UsersIcon = Users;
  readonly PlusIcon = Plus;

  constructor(private childService: ChildService) {}

  ngOnInit(): void {
    this.loadChildren();
  }

  loadChildren(): void {
    this.isLoading = true;
    this.childService.getChildren().subscribe({
      next: (response) => {
        // Handle both single Child and Child[] responses
        if (Array.isArray(response.data)) {
          this.children = response.data;
        } else if (response.data) {
          this.children = [response.data];
        } else {
          this.children = [];
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading children:', error);
        this.isLoading = false;
      }
    });
  }

  calculateAge(dateOfBirth: string): number {
    if (!dateOfBirth) return 0;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }
}

