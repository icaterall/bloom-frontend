import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { LucideAngularModule, XCircle, ArrowLeft } from 'lucide-angular';

@Component({
  selector: 'app-booking-cancel',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center px-4 py-12">
      <div class="max-w-2xl w-full">
        <!-- Cancel Card -->
        <div class="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <!-- Cancel Header -->
          <div class="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-8 text-center">
            <div class="mx-auto w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-lg">
              <lucide-angular [img]="XCircleIcon" size="40" class="text-orange-500"></lucide-angular>
            </div>
            <h1 class="text-2xl font-bold text-white mb-2">Payment Cancelled</h1>
            <p class="text-orange-50">Your payment was not completed</p>
          </div>

          <!-- Content -->
          <div class="px-6 py-8">
            <div class="space-y-6">
              <!-- Message -->
              <div class="bg-orange-50 rounded-lg p-5 border border-orange-200">
                <p class="text-sm text-orange-800">
                  Your booking is still reserved, but payment was not completed. You can complete the payment from your dashboard.
                </p>
              </div>

              <!-- Booking Info -->
              <div *ngIf="bookingId" class="bg-gray-50 rounded-lg p-5 border border-gray-200">
                <p class="text-sm text-gray-600 mb-2">Booking ID:</p>
                <p class="text-base font-semibold text-gray-900">#{{ bookingId }}</p>
              </div>

              <!-- Actions -->
              <div class="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  (click)="goToDashboard()"
                  class="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-[#2563EB] px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#1d4ed8] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  <lucide-angular [img]="ArrowLeftIcon" size="18"></lucide-angular>
                  <span>Go to Dashboard</span>
                </button>
                <button
                  (click)="tryAgain()"
                  class="flex-1 inline-flex items-center justify-center rounded-lg border-2 border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class BookingCancelComponent implements OnInit {
  bookingId: string | null = null;

  XCircleIcon = XCircle;
  ArrowLeftIcon = ArrowLeft;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.bookingId = this.route.snapshot.queryParamMap.get('booking_id');
  }

  goToDashboard(): void {
    this.router.navigate(['/parent/dashboard']);
  }

  tryAgain(): void {
    if (this.bookingId) {
      // Navigate to dashboard where user can retry payment
      this.router.navigate(['/parent/dashboard'], {
        queryParams: { booking_id: this.bookingId }
      });
    } else {
      this.goToDashboard();
    }
  }
}

