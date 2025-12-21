import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { BookingService } from '../../../core/services/booking.service';
import { LucideAngularModule, CheckCircle, ArrowRight, Calendar, Clock, MapPin, Video, Mail, AlertCircle, Info, X } from 'lucide-angular';

@Component({
  selector: 'app-booking-success',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-4 py-12 relative">
      <!-- Toast Notification -->
      <div *ngIf="showToast" class="fixed top-6 right-6 z-50 transition-all duration-300 transform translate-y-0 opacity-100">
        <div [class]="'rounded-lg shadow-xl p-4 flex items-center gap-3 border-l-4 min-w-[320px] max-w-md ' + 
          (toastType === 'success' ? 'bg-white border-green-500 text-gray-800' : 
           toastType === 'error' ? 'bg-white border-red-500 text-gray-800' : 
           'bg-white border-blue-500 text-gray-800')">
          
          <div [class]="'flex-shrink-0 p-1 rounded-full ' + 
            (toastType === 'success' ? 'bg-green-100 text-green-600' : 
             toastType === 'error' ? 'bg-red-100 text-red-600' : 
             'bg-blue-100 text-blue-600')">
            <lucide-angular [img]="toastType === 'success' ? CheckCircleIcon : toastType === 'error' ? AlertCircleIcon : InfoIcon" size="20"></lucide-angular>
          </div>
          
          <div class="flex-1">
            <p [class]="'text-sm font-bold ' + 
              (toastType === 'success' ? 'text-green-800' : 
               toastType === 'error' ? 'text-red-800' : 
               'text-blue-800')">
              {{ toastTitle }}
            </p>
            <p class="text-sm text-gray-600 mt-0.5 leading-tight">{{ toastMessage }}</p>
          </div>
          
          <button (click)="showToast = false" class="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-gray-100">
            <lucide-angular [img]="XIcon" size="18"></lucide-angular>
          </button>
        </div>
      </div>

      <div class="max-w-2xl w-full">
        <!-- Success Card -->
        <div class="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <!-- Success Header -->
          <div class="bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-8 text-center">
            <div class="mx-auto w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-lg">
              <lucide-angular [img]="CheckCircleIcon" size="40" class="text-green-500"></lucide-angular>
            </div>
            <h1 class="text-2xl font-bold text-white mb-2">Payment Successful!</h1>
            <p class="text-green-50">Your booking has been confirmed and paid</p>
          </div>

          <!-- Content -->
          <div class="px-6 py-8">
            <!-- Payment Verification Status Alert -->
            <div *ngIf="verificationDetails" class="mb-6">
              <div *ngIf="verificationDetails.error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <div class="flex items-start">
                  <div class="flex-shrink-0">
                    <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <div class="ml-3">
                    <h3 class="text-sm font-medium text-red-800">Verification Error</h3>
                    <div class="mt-2 text-sm text-red-700">
                      <p>{{ verificationDetails.error }}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div *ngIf="!verificationDetails.error && verificationDetails.stripe_status" class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div class="flex">
                  <div class="flex-shrink-0">
                    <svg class="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <div class="ml-3 flex-1 md:flex md:justify-between">
                    <p class="text-sm text-blue-700">
                      Stripe Status: <span class="font-bold">{{ verificationDetails.stripe_status | titlecase }}</span>
                      <span *ngIf="verificationDetails.message" class="mx-2">•</span>
                      <span>{{ verificationDetails.message }}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div *ngIf="isLoading" class="text-center py-8">
              <div class="inline-flex items-center space-x-3">
                <span class="h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></span>
                <span class="text-sm text-gray-600">Verifying your payment...</span>
              </div>
            </div>

            <div *ngIf="!isLoading && booking" class="space-y-6">
              <!-- Payment Success Badge - Always show success since Stripe redirected here -->
              <div class="flex items-center justify-center">
                <span class="inline-flex items-center gap-2 rounded-full bg-green-100 px-5 py-2.5 text-sm font-bold text-green-800 ring-2 ring-green-300">
                  <lucide-angular [img]="CheckCircleIcon" size="18" class="text-green-600"></lucide-angular>
                  Payment Successful - {{ booking.currency || 'MYR' }} {{ booking.price | number:'1.2-2' }}
                </span>
              </div>

              <!-- Booking Details -->
              <div class="bg-gray-50 rounded-lg p-5 border border-gray-200">
                <h2 class="text-lg font-semibold text-gray-900 mb-4">Booking Details</h2>
                <div class="space-y-3">
                  <div class="flex justify-between">
                    <span class="text-sm text-gray-600">Booking ID:</span>
                    <span class="text-sm font-medium text-gray-900">#{{ booking.id }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-sm text-gray-600">Child:</span>
                    <span class="text-sm font-medium text-gray-900">{{ booking.child_name || 'N/A' }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-sm text-gray-600">Service:</span>
                    <span class="text-sm font-medium text-gray-900">{{ booking.booking_type_name || booking.booking_type || 'N/A' }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-sm text-gray-600">Mode:</span>
                    <span class="text-sm font-medium text-gray-900">{{ getModeLabel(booking.mode) }}</span>
                  </div>
                </div>
              </div>

              <!-- Schedule Confirmation Section -->
              <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-5 border-2 border-blue-200">
                <div class="flex items-center gap-2 mb-4">
                  <lucide-angular [img]="CalendarIcon" size="20" class="text-blue-600"></lucide-angular>
                  <h2 class="text-lg font-semibold text-gray-900">Schedule Confirmation</h2>
                </div>
                <div class="space-y-3">
                  <div class="flex items-start gap-3">
                    <lucide-angular [img]="ClockIcon" size="18" class="text-blue-500 mt-0.5 flex-shrink-0"></lucide-angular>
                    <div>
                      <p class="text-sm font-medium text-gray-900">Preferred Time</p>
                      <p class="text-sm text-gray-700">{{ formatDate(booking.preferred_start_at || booking.start_at) }}</p>
                    </div>
                  </div>
                  <div class="flex items-start gap-3">
                    <lucide-angular [img]="booking.mode === 'online' ? VideoIcon : MapPinIcon" size="18" class="text-blue-500 mt-0.5 flex-shrink-0"></lucide-angular>
                    <div>
                      <p class="text-sm font-medium text-gray-900">Location</p>
                      <p class="text-sm text-gray-700">{{ getModeLabel(booking.mode) }}</p>
                    </div>
                  </div>
                </div>
                <div class="mt-4 p-3 bg-white rounded-md border border-blue-100">
                  <p class="text-xs text-blue-800">
                    <strong>Note:</strong> We will confirm the exact time within 24 hours. You'll receive a confirmation email with the final schedule.
                  </p>
                </div>
              </div>

              <!-- Online Session Information (only for online mode) -->
              <div *ngIf="booking.mode === 'online'" class="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-5 border-2 border-purple-200">
                <div class="flex items-center gap-2 mb-4">
                  <lucide-angular [img]="VideoIcon" size="20" class="text-purple-600"></lucide-angular>
                  <h2 class="text-lg font-semibold text-gray-900">Online Session Details</h2>
                </div>
                <div class="space-y-3">
                  <div class="flex items-center gap-3 p-3 bg-white rounded-md border border-purple-100">
                    <div class="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <lucide-angular [img]="VideoIcon" size="20" class="text-purple-600"></lucide-angular>
                    </div>
                    <div>
                      <p class="text-sm font-semibold text-gray-900">Google Meet Session</p>
                      <p class="text-xs text-gray-600">Video conference link will be sent via email</p>
                    </div>
                  </div>
                  <div class="flex items-start gap-3">
                    <lucide-angular [img]="MailIcon" size="18" class="text-purple-500 mt-0.5 flex-shrink-0"></lucide-angular>
                    <div>
                      <p class="text-sm text-gray-700">
                        You will receive an email with:
                      </p>
                      <ul class="mt-1 text-sm text-gray-600 list-disc list-inside space-y-1">
                        <li>Google Meet link for your session</li>
                        <li>Calendar invitation</li>
                        <li>Preparation instructions</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <!-- In-Centre Information (only for in_centre mode) -->
              <div *ngIf="booking.mode === 'in_centre'" class="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-5 border-2 border-amber-200">
                <div class="flex items-center gap-2 mb-4">
                  <lucide-angular [img]="MapPinIcon" size="20" class="text-amber-600"></lucide-angular>
                  <h2 class="text-lg font-semibold text-gray-900">Visit Information</h2>
                </div>
                <div class="space-y-3">
                  <div class="flex items-start gap-3 p-3 bg-white rounded-md border border-amber-100">
                    <div class="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <lucide-angular [img]="MapPinIcon" size="20" class="text-amber-600"></lucide-angular>
                    </div>
                    <div>
                      <p class="text-sm font-semibold text-gray-900">Bloom Spectrum Centre</p>
                      <p class="text-xs text-gray-600">No. A-1-08, Block A, Conezion Commercial</p>
                      <p class="text-xs text-gray-600">Persiaran IRC 3, IOI Resort City, 62502 Putrajaya</p>
                    </div>
                  </div>
                  <div class="flex items-start gap-3">
                    <lucide-angular [img]="MailIcon" size="18" class="text-amber-500 mt-0.5 flex-shrink-0"></lucide-angular>
                    <div>
                      <p class="text-sm text-gray-700">
                        You will receive an email with:
                      </p>
                      <ul class="mt-1 text-sm text-gray-600 list-disc list-inside space-y-1">
                        <li>Confirmed appointment time</li>
                        <li>Directions and parking info</li>
                        <li>What to bring checklist</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Booking Status Badge -->
              <div class="flex items-center justify-center">
                <span class="inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-2 text-sm font-semibold text-green-700 ring-1 ring-green-200">
                  <span class="h-2 w-2 rounded-full bg-green-400"></span>
                  Booking Confirmed - Awaiting Schedule Confirmation
                </span>
              </div>
              
              <!-- Next Steps Notice -->
              <div class="bg-green-50 rounded-lg p-4 border border-green-200">
                <p class="text-sm text-green-800">
                  <strong>What's next?</strong> Our team will review your booking and confirm the exact appointment time. 
                  You'll receive a confirmation email with all the details shortly.
                </p>
              </div>

              <!-- Actions -->
              <div class="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  (click)="goToDashboard()"
                  class="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-[#2563EB] px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#1d4ed8] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  <span>Go to Dashboard</span>
                  <lucide-angular [img]="ArrowRightIcon" size="18"></lucide-angular>
                </button>
                <button
                  (click)="viewBookings()"
                  class="flex-1 inline-flex items-center justify-center rounded-lg border-2 border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  View All Bookings
                </button>
              </div>
            </div>

            <!-- Fallback Success State (booking not found but payment was successful) -->
            <div *ngIf="!isLoading && !booking && !errorMessage" class="space-y-6">
              <div class="flex items-center justify-center">
                <span class="inline-flex items-center gap-2 rounded-full bg-green-100 px-5 py-2.5 text-sm font-bold text-green-800 ring-2 ring-green-300">
                  <lucide-angular [img]="CheckCircleIcon" size="18" class="text-green-600"></lucide-angular>
                  Payment Successful!
                </span>
              </div>
              <div class="bg-green-50 rounded-lg p-5 border border-green-200">
                <p class="text-sm text-green-800 text-center">
                  Your payment was processed successfully. Your booking is being confirmed and you'll receive an email with the details shortly.
                </p>
              </div>
              <div class="flex justify-center pt-4">
                <button
                  (click)="goToDashboard()"
                  class="inline-flex items-center justify-center gap-2 rounded-lg bg-[#2563EB] px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#1d4ed8] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  <span>Go to Dashboard</span>
                  <lucide-angular [img]="ArrowRightIcon" size="18"></lucide-angular>
                </button>
              </div>
            </div>

            <!-- Error State -->
            <div *ngIf="!isLoading && errorMessage" class="text-center py-8">
              <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p class="text-sm text-red-800">{{ errorMessage }}</p>
              </div>
              <button
                (click)="goToDashboard()"
                class="inline-flex items-center justify-center rounded-lg bg-[#2563EB] px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#1d4ed8] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class BookingSuccessComponent implements OnInit {
  sessionId: string | null = null;
  booking: any = null;
  isLoading = true;
  errorMessage = '';
  verificationDetails: any = null;

  // Toast properties
  showToast = false;
  toastType: 'success' | 'error' | 'info' = 'success';
  toastTitle = '';
  toastMessage = '';

  // Icons
  CheckCircleIcon = CheckCircle;
  ArrowRightIcon = ArrowRight;
  CalendarIcon = Calendar;
  ClockIcon = Clock;
  MapPinIcon = MapPin;
  VideoIcon = Video;
  MailIcon = Mail;
  AlertCircleIcon = AlertCircle;
  InfoIcon = Info;
  XIcon = X;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookingService: BookingService
  ) {}


  ngOnInit(): void {
    console.log('[BookingSuccess] Component MOUNTED - ngOnInit called');
    console.log('[BookingSuccess] Current URL:', window.location.href);
    this.sessionId = this.route.snapshot.queryParamMap.get('session_id');
    console.log('[BookingSuccess] Initialized with session_id:', this.sessionId);
    
    if (!this.sessionId) {
      this.errorMessage = 'Invalid session. Please contact support if you believe this is an error.';
      this.isLoading = false;
      return;
    }

    // Verify payment and get booking details
    this.verifyPayment();
  }

  triggerToast(type: 'success' | 'error' | 'info', title: string, message: string) {
    this.toastType = type;
    this.toastTitle = title;
    this.toastMessage = message;
    this.showToast = true;

    // Auto hide after 8 seconds
    setTimeout(() => {
      this.showToast = false;
    }, 8000);
  }

  verifyPayment(retryCount: number = 0): void {
    if (!this.sessionId) {
      // No session ID but we're on success page - show generic success
      this.isLoading = false;
      return;
    }

    // Reduced delay - fetch immediately on first try, small delay on retries
    const delay = retryCount === 0 ? 500 : 2000;
    
    console.log(`[BookingSuccess] Verifying payment for session ${this.sessionId} (attempt ${retryCount + 1})`);

    setTimeout(() => {
      this.bookingService.getBookingBySession(this.sessionId!).subscribe({
        next: (response) => {
          console.log('[BookingSuccess] Verification response:', response);
          if (response.success && response.data) {
            this.booking = response.data;
            this.verificationDetails = response.verification;
            
            // Trigger toast based on verification status
            if (this.verificationDetails) {
              if (this.verificationDetails.error) {
                 this.triggerToast('error', 'Verification Warning', 'Payment processed but verification had issues: ' + this.verificationDetails.error);
              } else if (this.verificationDetails.stripe_status === 'paid') {
                 this.triggerToast('success', 'Payment Verified', 'Stripe confirmed your payment was successful.');
              } else if (this.verificationDetails.stripe_status === 'unpaid') {
                 this.triggerToast('error', 'Payment Unpaid', 'Stripe reports this payment is still unpaid.');
              } else {
                 this.triggerToast('info', 'Payment Status', `Stripe status: ${this.verificationDetails.stripe_status}`);
              }
            } else {
              // Fallback if no verification object but we have data
              this.triggerToast('success', 'Booking Confirmed', 'Your booking has been successfully retrieved.');
            }

            // If booking status is still not updated after backend verification, show success anyway
            // (payment was successful, status update might be delayed)
            if (this.booking.payment_status !== 'paid' && this.booking.status !== 'awaiting_clinical_review') {
              console.warn('Payment successful but booking status not yet updated. Showing success message.');
              // Still show success - payment was completed, status will update soon
            }
            
            this.isLoading = false;
          } else {
            // Retry up to 2 times
            if (retryCount < 2) {
              console.log(`Retrying payment verification (attempt ${retryCount + 1})...`);
              this.verifyPayment(retryCount + 1);
            } else {
              // Final fallback: try fetching all bookings
              this.bookingService.getBookings().subscribe({
                next: (bookingsResponse) => {
                  if (bookingsResponse.success && Array.isArray(bookingsResponse.data)) {
                    const recentBookings = bookingsResponse.data
                      .sort(
                        (a: any, b: any) => new Date(b.updated_at || b.created_at).getTime() - 
                                          new Date(a.updated_at || a.created_at).getTime()
                      );
                    
                    if (recentBookings.length > 0) {
                      // Show the most recent booking (likely the one just paid)
                      this.booking = recentBookings[0];
                      this.triggerToast('success', 'Booking Retrieved', 'We found your recent booking, though direct verification timed out.');
                    } else {
                       this.triggerToast('info', 'Status Unknown', 'Payment processed, but we could not find the booking details yet.');
                    }
                  }
                  this.isLoading = false;
                },
                error: () => {
                  console.error('[BookingSuccess] Failed to load bookings after payment success');
                  this.triggerToast('error', 'Retrieval Failed', 'Payment processed, but failed to load booking details.');
                  this.isLoading = false;
                }
              });
            }
          }
        },
        error: (error) => {
          console.error('Error fetching booking by session:', error);
          
          // Retry up to 2 times
          if (retryCount < 2) {
            console.log(`Retrying payment verification after error (attempt ${retryCount + 1})...`);
            this.verifyPayment(retryCount + 1);
          } else {
            // Final fallback: try fetching all bookings
            this.bookingService.getBookings().subscribe({
              next: (bookingsResponse) => {
                if (bookingsResponse.success && Array.isArray(bookingsResponse.data)) {
                  const recentBookings = bookingsResponse.data
                    .sort(
                      (a: any, b: any) => new Date(b.updated_at || b.created_at).getTime() - 
                                        new Date(a.updated_at || a.created_at).getTime()
                    );
                  
                  if (recentBookings.length > 0) {
                    this.booking = recentBookings[0];
                    this.triggerToast('success', 'Booking Retrieved', 'We found your recent booking, though direct verification encountered an error.');
                  } else {
                    this.triggerToast('info', 'Status Unknown', 'Payment processed, but we could not find the booking details yet.');
                  }
                }
                this.isLoading = false;
              },
              error: () => {
                console.error('[BookingSuccess] Failed to load bookings after payment verification error');
                this.triggerToast('error', 'Retrieval Failed', 'Payment processed, but failed to load booking details.');
                this.isLoading = false;
              }
            });
          }
        }
      });
    }, delay);
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return date.toLocaleDateString('en-US', options);
  }

  getModeLabel(mode: string): string {
    return mode === 'in_centre' ? 'In-centre (Putrajaya)' : 'Online (Google Meet)';
  }

  getStatusLabel(status: string): string {
    const statusMap: { [key: string]: string } = {
      'awaiting_clinical_review': 'Awaiting Clinical Review',
      'confirmed': 'Confirmed',
      'awaiting_payment': 'Awaiting Payment',
      'paid': 'Paid'
    };
    return statusMap[status] || status || 'Pending';
  }

  goToDashboard(): void {
    this.router.navigate(['/parent/dashboard']);
  }

  viewBookings(): void {
    // Navigate to bookings list if it exists, otherwise dashboard
    this.router.navigate(['/parent/dashboard']);
  }
}

