import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ChildService } from '../../../core/services/child.service';
import { Child } from '../../../shared/models/child.model';
import { BookingWizardComponent } from '../components/booking-wizard/booking-wizard.component';

@Component({
  selector: 'app-child-booking',
  standalone: true,
  imports: [CommonModule, BookingWizardComponent],
  template: `
    <div class="max-w-4xl mx-auto">
      <app-booking-wizard
        [child]="child"
        (close)="onClose()"
      ></app-booking-wizard>
    </div>
  `
})
export class ChildBookingComponent implements OnInit {
  child: Child | null = null;
  childId: number | null = null;

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
    
    this.childService.getChildById(this.childId).subscribe({
      next: (response) => {
        // Handle both single Child and Child[] responses
        this.child = Array.isArray(response.data) ? response.data[0] : response.data;
      },
      error: (error) => {
        console.error('Error loading child:', error);
      }
    });
  }

  onClose(): void {
    if (this.childId) {
      this.router.navigate(['/parent/children', this.childId]);
    } else {
      this.router.navigate(['/parent/children']);
    }
  }
}

