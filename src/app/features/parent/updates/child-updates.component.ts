import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ChildService } from '../../../core/services/child.service';
import { ChildCaseService, ChildCaseUpdate } from '../../../core/services/child-case.service';
import { Child } from '../../../shared/models/child.model';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { LucideAngularModule, FileText, Calendar, User, Image, Video, File, ArrowRight, Clock } from 'lucide-angular';

@Component({
  selector: 'app-child-updates',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe, LucideAngularModule],
  templateUrl: './child-updates.component.html',
  styleUrls: ['./child-updates.component.css']
})
export class ChildUpdatesComponent implements OnInit {
  children: Child[] = [];
  allUpdates: ChildCaseUpdate[] = [];
  isLoading = true;
  selectedChildId: number | null = null;
  filteredUpdates: ChildCaseUpdate[] = [];

  readonly FileTextIcon = FileText;
  readonly CalendarIcon = Calendar;
  readonly UserIcon = User;
  readonly ImageIcon = Image;
  readonly VideoIcon = Video;
  readonly FileIcon = File;
  readonly ArrowRightIcon = ArrowRight;
  readonly ClockIcon = Clock;

  constructor(
    private childService: ChildService,
    private childCaseService: ChildCaseService
  ) {}

  ngOnInit(): void {
    this.loadChildren();
  }

  loadChildren(): void {
    this.isLoading = true;
    this.childService.getChildren().subscribe({
      next: (response) => {
        // Handle both single Child and Child[] responses
        this.children = Array.isArray(response.data) ? response.data : (response.data ? [response.data] : []);
        if (this.children.length > 0) {
          this.loadAllUpdates();
        } else {
          this.isLoading = false;
        }
      },
      error: (err) => {
        console.error('Error loading children:', err);
        this.isLoading = false;
      }
    });
  }

  loadAllUpdates(): void {
    const updatePromises = this.children.map(child => 
      this.childCaseService.getCaseUpdatesForParent(child.id!).toPromise()
    );

    Promise.all(updatePromises).then(results => {
      this.allUpdates = [];
      results.forEach((response, index) => {
        if (response?.success && Array.isArray(response.data)) {
          const updates = response.data.map(update => ({
            ...update,
            child_name: this.children[index].full_name
          }));
          this.allUpdates.push(...updates);
        }
      });

      // Sort by date (newest first)
      this.allUpdates.sort((a, b) => {
        const dateA = new Date(a.created_at || 0).getTime();
        const dateB = new Date(b.created_at || 0).getTime();
        return dateB - dateA;
      });

      this.filteredUpdates = this.allUpdates;
      this.isLoading = false;
    }).catch(err => {
      console.error('Error loading updates:', err);
      this.isLoading = false;
    });
  }

  filterByChild(childId: number | null): void {
    this.selectedChildId = childId;
    if (childId === null) {
      this.filteredUpdates = this.allUpdates;
    } else {
      this.filteredUpdates = this.allUpdates.filter(update => update.child_id === childId);
    }
  }

  getGoalsArray(goals: string[] | string | undefined): string[] {
    if (!goals) return [];
    if (Array.isArray(goals)) return goals;
    try {
      return JSON.parse(goals);
    } catch {
      return [goals];
    }
  }

  getAttachmentIcon(type: string) {
    switch (type) {
      case 'photo':
      case 'image':
        return this.ImageIcon;
      case 'video':
        return this.VideoIcon;
      default:
        return this.FileIcon;
    }
  }
}

