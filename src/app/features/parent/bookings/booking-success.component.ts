import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { BookingService } from '../../../core/services/booking.service';
import { AuthService } from '../../../core/services/auth.service';
import { LucideAngularModule, CheckCircle, ArrowRight, Calendar, Clock, MapPin, Video, Mail, AlertCircle, Info, X, LogIn } from 'lucide-angular';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

// Payment-return page (Phase 7 honesty rules + Phase 10 UX):
//  - "Paid" is only ever shown when the BACKEND confirms it (webhook or
//    verify-by-session). The Stripe redirect alone proves nothing.
//  - While the webhook is still confirming, we poll a limited number of times
//    (every 2s, up to ~20s) and say so honestly.
//  - On confirmed success the page stays visible with a visible countdown
//    before redirecting to the booking (bank-style confirmation pause).
//  - A 401 here must NOT log the parent out (the interceptor exempts the
//    by-session endpoint); we show a gentle re-login prompt with returnUrl.
@Component({
  selector: 'app-booking-success',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, TranslatePipe],
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

          <button (click)="showToast = false" class="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-gray-100" aria-label="Dismiss notification">
            <lucide-angular [img]="XIcon" size="18"></lucide-angular>
          </button>
        </div>
      </div>

      <div class="max-w-2xl w-full">
        <!-- Success Card -->
        <div class="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <!-- Header — colour + copy reflect the BACKEND-confirmed payment state -->
          <div class="px-6 py-8 text-center"
               [ngClass]="isPaymentUnpaidOrFailed ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                          : 'bg-gradient-to-r from-green-500 to-emerald-500'">
            <div class="mx-auto w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-lg">
              <lucide-angular [img]="isConfirmedPaid ? CheckCircleIcon : (isPaymentUnpaidOrFailed ? AlertCircleIcon : InfoIcon)"
                              size="40"
                              [ngClass]="isPaymentUnpaidOrFailed ? 'text-amber-500' : 'text-green-500'"></lucide-angular>
            </div>
            <h1 class="text-2xl font-bold text-white mb-2">{{ isConfirmedPaid ? '✅' : (isPaymentUnpaidOrFailed ? '⚠️' : '⏳') }}</h1>
            <p class="text-white/90">
              {{ isConfirmedPaid ? ('bookingWizard.step4.paymentReceived' | translate)
                 : (isPaymentUnpaidOrFailed ? ('paymentResult.notCompleted' | translate)
                    : ('paymentResult.confirming' | translate)) }}
            </p>
          </div>

          <!-- Content -->
          <div class="px-6 py-8">
            <!-- Auth expired: show a gentle re-login prompt, never a blank logout -->
            <div *ngIf="authExpired" class="space-y-6">
              <div class="bg-blue-50 rounded-lg p-5 border border-blue-200">
                <p class="text-sm text-blue-800 text-center">
                  {{ 'paymentResult.sessionExpired' | translate }}
                </p>
              </div>
              <div class="flex justify-center">
                <button
                  (click)="goToLogin()"
                  class="inline-flex items-center justify-center gap-2 rounded-lg bg-[#2563EB] px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#1d4ed8] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  <lucide-angular [img]="LogInIcon" size="18"></lucide-angular>
                  <span>{{ 'paymentResult.logIn' | translate }}</span>
                </button>
              </div>
            </div>

            <!-- Payment Verification Status Alert -->
            <div *ngIf="!authExpired && verificationDetails" class="mb-6">
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

            <div *ngIf="!authExpired && isLoading" class="text-center py-8">
              <div class="inline-flex items-center space-x-3">
                <span class="h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></span>
                <span class="text-sm text-gray-600">{{ 'paymentResult.checking' | translate }}</span>
              </div>
            </div>

            <div *ngIf="!authExpired && !isLoading && booking" class="space-y-6">
              <!-- Payment Badge — reflects the backend-confirmed state, not the redirect -->
              <div class="flex items-center justify-center">
                <span *ngIf="isConfirmedPaid" class="inline-flex items-center gap-2 rounded-full bg-green-100 px-5 py-2.5 text-sm font-bold text-green-800 ring-2 ring-green-300">
                  <span class="text-lg">✅</span>
                  <span>{{ 'bookingWizard.step4.paymentReceivedDesc' | translate }}</span>
                </span>
                <span *ngIf="!isConfirmedPaid && !isPaymentUnpaidOrFailed" class="inline-flex items-center gap-2 rounded-full bg-blue-100 px-5 py-2.5 text-sm font-bold text-blue-800 ring-2 ring-blue-300">
                  <span class="h-2 w-2 rounded-full bg-blue-400 animate-pulse"></span>
                  <span>{{ 'paymentResult.confirming' | translate }}</span>
                </span>
                <span *ngIf="isPaymentUnpaidOrFailed" class="inline-flex items-center gap-2 rounded-full bg-amber-100 px-5 py-2.5 text-sm font-bold text-amber-800 ring-2 ring-amber-300">
                  <span class="text-lg">⚠️</span>
                  <span>{{ 'paymentResult.notCompleted' | translate }}</span>
                </span>
              </div>

              <!-- Bank-style confirmation pause: visible countdown before redirect -->
              <div *ngIf="isConfirmedPaid && autoRedirectActive"
                   class="rounded-lg border border-green-200 bg-green-50 p-4 text-center"
                   role="status" aria-live="polite">
                <p class="text-sm text-green-800 mb-1">{{ 'paymentResult.successNotice' | translate }}</p>
                <p class="text-sm font-semibold text-green-900">
                  {{ 'paymentResult.redirectPrefix' | translate }} {{ redirectSeconds }} {{ 'paymentResult.redirectSuffix' | translate }}
                </p>
                <button (click)="cancelAutoRedirect()"
                        class="mt-2 text-sm font-medium text-green-700 underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-green-500 rounded">
                  {{ 'paymentResult.stay' | translate }}
                </button>
              </div>

              <!-- Still processing after limited polling: honest, no false 'paid' -->
              <div *ngIf="pollingExhausted && !isConfirmedPaid && !isPaymentUnpaidOrFailed"
                   class="rounded-lg border border-blue-200 bg-blue-50 p-4 text-center">
                <p class="text-sm text-blue-800">{{ 'paymentResult.stillProcessing' | translate }}</p>
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

              <!-- Booking Status Badge — only when the booking is actually paid/confirmed -->
              <div *ngIf="isConfirmedPaid" class="flex items-center justify-center">
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
                  *ngIf="booking?.id"
                  (click)="goToBooking()"
                  class="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-[#2563EB] px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#1d4ed8] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  <span>{{ 'paymentResult.goToBooking' | translate }}</span>
                  <lucide-angular [img]="ArrowRightIcon" size="18"></lucide-angular>
                </button>
                <button
                  (click)="goToDashboard()"
                  class="flex-1 inline-flex items-center justify-center rounded-lg border-2 border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  {{ 'paymentResult.goToDashboard' | translate }}
                </button>
              </div>
            </div>

            <!-- Fallback State (booking not yet retrievable) — do NOT assert success -->
            <div *ngIf="!authExpired && !isLoading && !booking && !errorMessage" class="space-y-6">
              <div class="flex items-center justify-center">
                <span class="inline-flex items-center gap-2 rounded-full bg-blue-100 px-5 py-2.5 text-sm font-bold text-blue-800 ring-2 ring-blue-300">
                  <span class="h-2 w-2 rounded-full bg-blue-400 animate-pulse"></span>
                  {{ 'paymentResult.confirming' | translate }}
                </span>
              </div>
              <div class="bg-blue-50 rounded-lg p-5 border border-blue-200">
                <p class="text-sm text-blue-800 text-center">
                  {{ 'paymentResult.stillProcessing' | translate }}
                </p>
              </div>
              <div class="flex justify-center pt-4">
                <button
                  (click)="goToDashboard()"
                  class="inline-flex items-center justify-center gap-2 rounded-lg bg-[#2563EB] px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#1d4ed8] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  <span>{{ 'paymentResult.goToDashboard' | translate }}</span>
                  <lucide-angular [img]="ArrowRightIcon" size="18"></lucide-angular>
                </button>
              </div>
            </div>

            <!-- Error State -->
            <div *ngIf="!authExpired && !isLoading && errorMessage" class="text-center py-8">
              <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p class="text-sm text-red-800">{{ errorMessage }}</p>
              </div>
              <button
                (click)="goToDashboard()"
                class="inline-flex items-center justify-center rounded-lg bg-[#2563EB] px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#1d4ed8] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                {{ 'paymentResult.goToDashboard' | translate }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class BookingSuccessComponent implements OnInit, OnDestroy {
  sessionId: string | null = null;
  booking: any = null;
  isLoading = true;
  errorMessage = '';
  verificationDetails: any = null;

  // Limited polling while the webhook confirms (client asked for ~2s x ~20s).
  private static readonly MAX_POLLS = 10;
  private static readonly POLL_INTERVAL_MS = 2000;
  private pollCount = 0;
  private pollTimer: ReturnType<typeof setTimeout> | null = null;
  pollingExhausted = false;

  // The in-flight verify/fallback HTTP subscription. Tracked so ngOnDestroy can
  // cancel it — otherwise a late response could re-arm polling or force a
  // redirect after the parent has already navigated away.
  private verifySub: Subscription | null = null;
  private destroyed = false;

  // Bank-style pause: stay on the confirmation ~6s with a visible countdown.
  private static readonly REDIRECT_SECONDS = 6;
  redirectSeconds = BookingSuccessComponent.REDIRECT_SECONDS;
  autoRedirectActive = false;
  private countdownTimer: ReturnType<typeof setInterval> | null = null;

  // Auth token invalid on return from Stripe → re-login prompt (no forced logout).
  authExpired = false;

  private finalToastShown = false;

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
  LogInIcon = LogIn;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookingService: BookingService,
    private authService: AuthService
  ) {}

  // Backend-confirmed payment? Only then do we tell the parent "Payment received".
  // The webhook (or backend verify) is the source of truth — never the redirect alone.
  get isConfirmedPaid(): boolean {
    return this.booking?.payment_status === 'paid'
      || this.booking?.status === 'awaiting_clinical_review'
      || this.verificationDetails?.stripe_status === 'paid';
  }

  // Stripe reported the payment is not completed (declined / abandoned / unpaid).
  get isPaymentUnpaidOrFailed(): boolean {
    const s = this.verificationDetails?.stripe_status;
    return s === 'unpaid' || s === 'failed' || this.booking?.payment_status === 'failed';
  }

  ngOnInit(): void {
    this.sessionId = this.route.snapshot.queryParamMap.get('session_id');

    if (!this.sessionId) {
      this.errorMessage = 'Invalid session. Please contact support if you believe this is an error.';
      this.isLoading = false;
      return;
    }

    // Verify against the backend (short first delay so the webhook has a head start).
    this.scheduleVerify(300);
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.clearPollTimer();
    this.clearCountdownTimer();
    // Abort any in-flight verify/fallback request so its callback can't run on
    // the destroyed component (which would re-arm polling or redirect the user).
    this.verifySub?.unsubscribe();
    this.verifySub = null;
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

  private scheduleVerify(delayMs: number): void {
    this.clearPollTimer();
    this.pollTimer = setTimeout(() => this.verifyPayment(), delayMs);
  }

  private verifyPayment(): void {
    if (!this.sessionId || this.destroyed) {
      this.isLoading = false;
      return;
    }
    this.pollCount++;

    this.verifySub?.unsubscribe();
    this.verifySub = this.bookingService.getBookingBySession(this.sessionId).subscribe({
      next: (response) => {
        if (this.destroyed) return;
        if (response.success && response.data) {
          this.booking = response.data;
          this.verificationDetails = response.verification;
          this.isLoading = false;

          if (this.isConfirmedPaid) {
            this.onConfirmedPaid();
            return;
          }
          if (this.isPaymentUnpaidOrFailed) {
            this.showFinalToast('error', 'Payment Not Completed',
              'Stripe reports this payment was not completed. You can try again from your booking.');
            return;
          }
          // Still pending — keep polling (limited), stay honest.
          this.continueOrExhaustPolling();
        } else {
          this.handleVerifyFailure(null);
        }
      },
      error: (error) => {
        if (this.destroyed) return;
        if (error?.status === 401) {
          // Token invalid after the Stripe round-trip. Do NOT blank the page or
          // log the user out — offer a re-login that returns right here.
          this.authExpired = true;
          this.isLoading = false;
          this.clearPollTimer();
          return;
        }
        this.handleVerifyFailure(error);
      }
    });
  }

  private continueOrExhaustPolling(): void {
    if (this.pollCount < BookingSuccessComponent.MAX_POLLS) {
      this.scheduleVerify(BookingSuccessComponent.POLL_INTERVAL_MS);
    } else {
      this.pollingExhausted = true;
      this.showFinalToast('info', 'Payment Processing',
        'Your payment is still being processed. Check your dashboard in a little while.');
    }
  }

  private handleVerifyFailure(error: any): void {
    if (this.destroyed) return;
    if (this.pollCount < BookingSuccessComponent.MAX_POLLS) {
      this.scheduleVerify(BookingSuccessComponent.POLL_INTERVAL_MS);
      return;
    }
    // Final fallback: show the most recent booking so the parent has SOMETHING
    // actionable — but the paid badge still keys off backend-confirmed state.
    this.pollingExhausted = true;
    this.verifySub?.unsubscribe();
    this.verifySub = this.bookingService.getBookings().subscribe({
      next: (bookingsResponse) => {
        if (this.destroyed) return;
        if (bookingsResponse.success && Array.isArray(bookingsResponse.data)) {
          const recentBookings = bookingsResponse.data.sort(
            (a: any, b: any) => new Date(b.updated_at || b.created_at).getTime() -
                                new Date(a.updated_at || a.created_at).getTime()
          );
          if (recentBookings.length > 0) {
            this.booking = recentBookings[0];
            if (this.isConfirmedPaid) {
              this.onConfirmedPaid();
            }
          }
        }
        this.isLoading = false;
      },
      error: () => {
        if (this.destroyed) return;
        this.showFinalToast('error', 'Retrieval Failed',
          'We could not load your booking details. Please check your dashboard.');
        this.isLoading = false;
      }
    });
  }

  private onConfirmedPaid(): void {
    if (this.destroyed) return;
    this.clearPollTimer();
    this.showFinalToast('success', 'Payment Verified', 'Your payment was confirmed successfully.');
    this.startRedirectCountdown();
  }

  private showFinalToast(type: 'success' | 'error' | 'info', title: string, message: string): void {
    if (this.finalToastShown) return;
    this.finalToastShown = true;
    this.triggerToast(type, title, message);
  }

  private startRedirectCountdown(): void {
    if (this.autoRedirectActive || this.countdownTimer) return;
    this.autoRedirectActive = true;
    this.redirectSeconds = BookingSuccessComponent.REDIRECT_SECONDS;

    this.countdownTimer = setInterval(() => {
      this.redirectSeconds--;
      if (this.redirectSeconds <= 0) {
        this.clearCountdownTimer();
        this.autoRedirectActive = false;
        if (this.booking?.id) {
          this.goToBooking();
        } else {
          this.goToDashboard();
        }
      }
    }, 1000);
  }

  cancelAutoRedirect(): void {
    this.clearCountdownTimer();
    this.autoRedirectActive = false;
  }

  private clearPollTimer(): void {
    if (this.pollTimer) {
      clearTimeout(this.pollTimer);
      this.pollTimer = null;
    }
  }

  private clearCountdownTimer(): void {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = null;
    }
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

  goToLogin(): void {
    // The by-session 401 intentionally did NOT log the parent out (the page
    // stayed visible). Now that they've chosen to re-login, clear the dead
    // token/user so the login form actually renders (isAuthenticatedUser()
    // would otherwise be a false positive and bounce them to the dashboard),
    // and preserve the payment returnUrl so login brings them straight back.
    this.authService.logout(`/parent/bookings/success?session_id=${this.sessionId}`);
  }

  goToBooking(): void {
    if (this.booking?.id) {
      this.router.navigate(['/parent/bookings', this.booking.id]);
    } else {
      this.goToDashboard();
    }
  }

  goToDashboard(): void {
    this.router.navigate(['/parent/home']);
  }

  viewBookings(): void {
    // Navigate to bookings list if it exists, otherwise dashboard
    this.router.navigate(['/parent/home']);
  }
}
