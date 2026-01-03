import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ChildService } from '../../../core/services/child.service';
import { Child } from '../../../shared/models/child.model';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { LucideAngularModule, ArrowLeft, CalendarPlus, Pencil } from 'lucide-angular';

@Component({
  selector: 'app-child-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe, LucideAngularModule],
  templateUrl: './child-profile.component.html'
})
export class ChildProfileComponent implements OnInit {
  child: Child | null = null;
  isLoading = false;
  childId: number | null = null;

  readonly ArrowLeftIcon = ArrowLeft;
  readonly CalendarPlusIcon = CalendarPlus;
  readonly PencilIcon = Pencil;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private childService: ChildService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('childId');
      if (id) {
        this.childId = parseInt(id, 10);
        this.loadChild();
      }
    });
  }

  loadChild(): void {
    if (!this.childId) return;
    
    this.isLoading = true;
    this.childService.getChildById(this.childId).subscribe({
      next: (response) => {
        // Handle both single Child and Child[] responses
        this.child = Array.isArray(response.data) ? response.data[0] : response.data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading child:', error);
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

  bookSession(): void {
    if (this.childId) {
      this.router.navigate(['/parent/children', this.childId, 'book']);
    }
  }

  goBack(): void {
    this.router.navigate(['/parent/children']);
  }
}

