import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideAngularModule, X, Clock, MapPin, Monitor, Calendar, FileText, ChevronLeft, ChevronRight, ArrowLeft, ArrowRight, Lock } from 'lucide-angular';
import { Child } from '../../../../shared/models/child.model';
import { BookingService } from '../../../../core/services/booking.service';
import { BookingType } from '../../../../shared/models/booking-type.model';
import { CreateBookingRequest } from '../../../../shared/models/booking.model';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { TranslationService } from '../../../../shared/services/translation.service';
import { AuthService } from '../../../../core/services/auth.service';
import { backdropAnimation, modalPanelAnimation } from '../../../../shared/animations';
import { toLocalYMD, parseYMDLocal, toCentreTimestamp, CENTRE_TIMEZONE } from '../../../../shared/utils/date-utils';
import { classifyHttpError, errorDisplayMessage } from '../../../../core/errors/http-error';

@Component({
  selector: 'app-booking-wizard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule, TranslatePipe],
  animations: [backdropAnimation, modalPanelAnimation],
  templateUrl: './booking-wizard.component.html',
  styleUrls: ['./booking-wizard.component.css']
})
export class BookingWizardComponent implements OnInit {
  @Input() child: Child | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() stepComplete = new EventEmitter<any>();

  currentStep = 1;
  totalSteps = 4;
  bookingForm: FormGroup;
  bookingTypes: BookingType[] = [];
  isLoadingTypes = false;
  selectedBookingType: BookingType | null = null;
  selectedMode: 'in_centre' | 'online' | null = null;
  pricePreview: { price: number; currency: string } | null = null;
  isLoadingPrice = false;
  
  // Step 1 data (stored when moving to step 2)
  step1Data: any = null;
  
  // Step 2 data
  minDate: string = '';
  selectedDate: string = '';
  selectedTime: string = '';
  availableTimeSlots: string[] = [];
  isLoadingSlots = false;
  slotsMessage = '';
  isLoadingBooking = false;
  errorMessage = '';
  
  // Calendar state
  calendarMonth: number = 0;
  calendarYear: number = 0;
  calendarDays: (Date | null)[] = [];
  today: Date = new Date();
  
  // Step 3 data (stored booking from step 2)
  createdBooking: any = null;
  isLoadingPayment = false;
  paymentConfirmationMessage: string = '';

  // Icons
  XIcon = X;
  ClockIcon = Clock;
  MapPinIcon = MapPin;
  MonitorIcon = Monitor;
  CalendarIcon = Calendar;
  FileTextIcon = FileText;
  ChevronLeftIcon = ChevronLeft;
  ChevronRightIcon = ChevronRight;
  ArrowLeftIcon = ArrowLeft;
  ArrowRightIcon = ArrowRight;
  LockIcon = Lock;

  currentLanguage: string = 'en';

  constructor(
    private fb: FormBuilder,
    private bookingService: BookingService,
    private translationService: TranslationService,
    private authService: AuthService
  ) {
    // Set min date to tomorrow (local calendar day — toISOString() would shift
    // the day for any browser east of UTC)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    this.minDate = toLocalYMD(tomorrow);
    
    // Generate available time slots (9 AM to 5 PM, hourly)
    this.availableTimeSlots = this.generateTimeSlots();
    
    this.bookingForm = this.fb.group({
      // Step 1
      booking_type: ['', Validators.required],
      mode: ['', Validators.required],
      // Step 2
      date: ['', Validators.required],
      time: ['', Validators.required],
      notes: [''],
      urgency: [''],
      // Step 3
      payment_method: ['', Validators.required],
      agree_to_policy: [false, Validators.requiredTrue]
    });
  }

  ngOnInit(): void {
    this.currentLanguage = this.translationService.getCurrentLanguage();
    this.translationService.currentLang$.subscribe(lang => {
      this.currentLanguage = lang;
    });
    this.loadBookingTypes();
    this.initCalendar();
    
    // Watch for booking type changes to update mode options
    this.bookingForm.get('booking_type')?.valueChanges.subscribe(code => {
      if (!this.isRestoringDraft) this.resetBookingAttempt();
      const type = this.bookingTypes.find(t => t.code === code);
      this.selectedBookingType = type || null;

      // Auto-select mode if only one is allowed
      if (type) {
        if (type.allowed_mode === 'in_centre') {
          this.bookingForm.patchValue({ mode: 'in_centre' });
        } else if (type.allowed_mode === 'online') {
          this.bookingForm.patchValue({ mode: 'online' });
        }
      }

      this.updatePricePreview();
    });

    // Watch for mode changes to update price
    this.bookingForm.get('mode')?.valueChanges.subscribe(() => {
      if (!this.isRestoringDraft) this.resetBookingAttempt();
      this.updatePricePreview();
    });

    // Watch for step changes to reinitialize calendar
    this.bookingForm.get('date')?.valueChanges.subscribe(date => {
      if (date) {
        if (!this.isRestoringDraft) this.resetBookingAttempt();
        const selected = parseYMDLocal(date);
        this.calendarMonth = selected.getMonth();
        this.calendarYear = selected.getFullYear();
        this.generateCalendarDays();
        this.loadAvailableSlots(date);
      }
    });

    // A time change also invalidates a deferred booking (never pay for a stale slot).
    this.bookingForm.get('time')?.valueChanges.subscribe(() => {
      if (!this.isRestoringDraft) this.resetBookingAttempt();
    });

    // Load saved draft if exists
    this.loadProgress();
  }

  // Local Storage Draft Methods

  private getDraftKey(): string {
    return this.child ? `booking_draft_${this.child.id}` : 'booking_draft_general';
  }

  saveProgress(): void {
    // Never persist a draft once the wizard has reached confirmation (step 4):
    // otherwise closing the success screen resurrects a completed booking and
    // blocks new bookings for that child until the draft expires.
    if (this.currentStep >= 4) return;

    // Only save if we are past step 1 or have selected something in step 1
    const formValue = this.bookingForm.value;
    const hasData = formValue.booking_type || formValue.mode || this.step1Data;

    if (!hasData) return;

    const draft = {
      currentStep: this.currentStep,
      formValue: this.bookingForm.value,
      step1Data: this.step1Data,
      createdBooking: this.createdBooking,
      timestamp: new Date().getTime()
    };
    
    try {
      localStorage.setItem(this.getDraftKey(), JSON.stringify(draft));
      console.log('Draft saved', draft);
    } catch (e) {
      console.error('Error saving draft', e);
    }
  }

  loadProgress(): void {
    try {
      const saved = localStorage.getItem(this.getDraftKey());
      if (saved) {
        const draft = JSON.parse(saved);
        
        // Optional: Check if draft is too old (e.g. > 24 hours)
        const oneDay = 24 * 60 * 60 * 1000;
        if (new Date().getTime() - draft.timestamp > oneDay) {
          this.clearProgress();
          return;
        }

        console.log('Restoring draft', draft);
        
        // Restore data
        if (draft.step1Data) this.step1Data = draft.step1Data;
        if (draft.createdBooking) this.createdBooking = draft.createdBooking;

        // Restore form values. Guard the reset handlers so re-populating the
        // form does not immediately wipe the createdBooking/key we just restored
        // (patchValue emits valueChanges synchronously).
        if (draft.formValue) {
          this.isRestoringDraft = true;
          this.bookingForm.patchValue(draft.formValue);
          this.isRestoringDraft = false;
        }

        // Restore selected items based on form values
        if (draft.formValue.booking_type) {
           const type = this.bookingTypes.find(t => t.code === draft.formValue.booking_type);
           this.selectedBookingType = type || null;
        }
        if (draft.formValue.mode) {
          this.selectedMode = draft.formValue.mode;
        }
        
        // Restore step
        if (draft.currentStep) {
          this.currentStep = draft.currentStep;
        }
        
        // Trigger price update if needed
        if (this.selectedBookingType && this.selectedMode) {
          this.updatePricePreview();
        }
      }
    } catch (e) {
      console.error('Error loading draft', e);
    }
  }

  clearProgress(): void {
    try {
      localStorage.removeItem(this.getDraftKey());
    } catch (e) {
      console.error('Error clearing draft', e);
    }
  }


  loadBookingTypes(): void {
    this.isLoadingTypes = true;
    this.bookingService.getBookingTypes().subscribe({
      next: (response) => {
        if (response.success && Array.isArray(response.data)) {
          // Filter out 'tour' if needed (optional as per requirements)
          this.bookingTypes = response.data.filter(type => type.code !== 'tour');
          // A restored draft may have run before the types arrived — re-derive
          // the selected type and price now so the summary never shows 0.00.
          const code = this.bookingForm.get('booking_type')?.value;
          if (code && !this.selectedBookingType) {
            this.selectedBookingType = this.bookingTypes.find(t => t.code === code) || null;
            this.updatePricePreview();
          }
        }
        this.isLoadingTypes = false;
      },
      error: (error) => {
        console.error('Error loading booking types:', error);
        this.isLoadingTypes = false;
      }
    });
  }

  updatePricePreview(): void {
    const bookingType = this.bookingForm.get('booking_type')?.value;
    const mode = this.bookingForm.get('mode')?.value;
    
    if (!bookingType || !mode) {
      this.pricePreview = null;
      return;
    }

    const type = this.bookingTypes.find(t => t.code === bookingType);
    if (!type) return;

    this.isLoadingPrice = true;
    this.bookingService.getBookingTypePrice(bookingType, mode, type.default_duration_min).subscribe({
      next: (response) => {
        if (response.success) {
          this.pricePreview = response.data;
        }
        this.isLoadingPrice = false;
      },
      error: (error) => {
        console.error('Error loading price:', error);
        this.isLoadingPrice = false;
      }
    });
  }

  selectBookingType(code: string): void {
    this.bookingForm.patchValue({ booking_type: code });
    this.selectedBookingType = this.bookingTypes.find(t => t.code === code) || null;
  }

  selectMode(mode: 'in_centre' | 'online'): void {
    this.bookingForm.patchValue({ mode });
    this.selectedMode = mode;
  }

  onBack(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  private bookingIdempotencyKey: string | null = null;
  // True only while loadProgress() patches restored form values, so the
  // valueChanges reset handlers don't wipe the draft they are restoring.
  private isRestoringDraft = false;

  // Any change to a booking-defining input (type/mode/date/time) invalidates a
  // previously-created (deferred) booking AND its idempotency key. Without this,
  // (a) the deferred-payment path could pay for a booking whose slot the user
  // has since changed, and (b) a retry after a failed create would reuse the key
  // with a changed payload and 409 forever.
  private resetBookingAttempt(): void {
    this.createdBooking = null;
    this.bookingIdempotencyKey = null;
  }

  // Stable per-attempt key so a retried / double-submitted create is de-duplicated
  // server-side. Reset via resetBookingAttempt() when inputs change or on success.
  private ensureBookingIdempotencyKey(): string {
    if (!this.bookingIdempotencyKey) {
      const c: any = (globalThis as any).crypto;
      this.bookingIdempotencyKey = (c && typeof c.randomUUID === 'function')
        ? c.randomUUID()
        : `bk-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    }
    return this.bookingIdempotencyKey as string;
  }

  createBooking(): void {
    // Re-entry guard: block a double-clicked "Create booking" before the button
    // disables, so a fast second click cannot create a duplicate booking.
    if (this.isLoadingBooking) {
      return;
    }
    if (!this.child || !this.child.id || !this.step1Data) {
      this.errorMessage = this.translationService.translate('bookingWizard.errors.childMissing');
      return;
    }

    this.isLoadingBooking = true;
    this.errorMessage = '';

    const formValue = this.bookingForm.value;
    const date = formValue.date;
    const time = formValue.time;

    // The selected date+time means CENTRE time (Asia/Kuala_Lumpur), not the
    // browser's timezone — anchor it explicitly so any visitor books correctly.
    const preferredStartAt = toCentreTimestamp(date, time);

    // Calculate end time based on duration
    const duration = this.step1Data.bookingType?.default_duration_min || 60;
    const preferredEndAt = new Date(new Date(preferredStartAt).getTime() + duration * 60000).toISOString();

    const bookingData: CreateBookingRequest = {
      child_id: this.child.id,
      booking_type: this.step1Data.booking_type,
      mode: this.step1Data.mode,
      preferred_start_at: preferredStartAt,
      preferred_end_at: preferredEndAt,
      payment_method: null, // Will be selected in step 3
      notes: formValue.notes || null
    };

    this.bookingService.createBooking(bookingData, this.ensureBookingIdempotencyKey()).subscribe({
      next: (response) => {
        this.isLoadingBooking = false;
        if (response.success) {
          // Store created booking data
          this.createdBooking = response.data.booking;
          this.bookingIdempotencyKey = null; // attempt done; next booking gets a fresh key
          // Move to step 3 (Payment)
          this.currentStep = 3;
          this.stepComplete.emit({
            step: 2,
            data: response.data
          });
        }
      },
      error: (error) => {
        console.error('Error creating booking:', error);
        this.isLoadingBooking = false;
        this.errorMessage = this.failureMessage(error, 'bookingWizard.errors.createFailed');
      }
    });
  }

  // Specific backend message for client errors (4xx explain what to fix);
  // localized fallback for network/server failures (raw 5xx bodies are
  // internal wording and must not surface). Never presents an HTTP error
  // response as a connectivity problem.
  private failureMessage(error: unknown, fallbackKey: string): string {
    const classified = classifyHttpError(error);
    if (classified.kind === 'network') {
      return this.translationService.translate('errors.networkBody');
    }
    if (classified.kind === 'server' || classified.kind === 'unknown') {
      return this.translationService.translate('errors.serverTemporaryBody');
    }
    return classified.backendMessage ?? this.translationService.translate(fallbackKey);
  }

  onContinue(): void {
    if (this.currentStep === 1) {
      // Step 1: Service + Mode selection
      if (this.bookingForm.get('booking_type')?.invalid || this.bookingForm.get('mode')?.invalid) {
        this.bookingForm.markAllAsTouched();
        return;
      }

      const formValue = this.bookingForm.value;
      this.step1Data = {
        booking_type: formValue.booking_type,
        mode: formValue.mode,
        bookingType: this.selectedBookingType,
        price: this.pricePreview
      };
      
      // Move to step 2
      this.currentStep = 2;
    } else if (this.currentStep === 2) {
      // Step 2: Time selection - Move to payment step (don't create booking yet)
      if (this.bookingForm.get('date')?.invalid || this.bookingForm.get('time')?.invalid) {
        this.bookingForm.markAllAsTouched();
        return;
      }
      
      // Just move to next step, defer booking creation to payment action
      this.currentStep = 3;
      // Save draft immediately on step change
      this.saveProgress();

    } else if (this.currentStep === 3) {
      // Step 3: Payment method selection
      if (this.bookingForm.get('payment_method')?.invalid) {
        this.bookingForm.markAllAsTouched();
        return;
      }

      this.processPayment();
    }
  }

  processPayment(): void {
    // Validate form including policy checkbox
    if (this.bookingForm.get('payment_method')?.invalid || this.bookingForm.get('agree_to_policy')?.invalid) {
      this.bookingForm.markAllAsTouched();
      return;
    }

    // Date/time must still be valid — a restored draft can have had its time
    // cleared when the slot was no longer offered. Without this guard,
    // combining an empty time throws and wedges the button on "Processing…".
    if (this.bookingForm.get('date')?.invalid || this.bookingForm.get('time')?.invalid) {
      this.currentStep = 2;
      this.bookingForm.markAllAsTouched();
      this.errorMessage = this.translationService.translate('bookingWizard.errors.selectDateTime');
      return;
    }

    // Re-entry guard: synchronously block rapid double-clicks before Angular's
    // change-detection has a chance to disable the button. Prevents creating two
    // bookings / two Stripe checkout sessions from a double-tapped "Pay".
    if (this.isLoadingPayment) {
      return;
    }
    this.isLoadingPayment = true;

    // Step 3 -> 4: First Create Booking, then Pay

    // We need to create the booking first since we deferred it from Step 2
    if (!this.createdBooking || !this.createdBooking.id) {
       this.createBookingAndPay();
       return;
    }

    // Fallback if booking already exists (e.g. from a restored session that had a booking ID)
    this.executePayment(this.createdBooking.id);
  }

  createBookingAndPay(): void {
    if (!this.child || !this.child.id || !this.step1Data) {
      this.errorMessage = this.translationService.translate('bookingWizard.errors.childMissing');
      this.isLoadingPayment = false; // release the guard set by processPayment()
      return;
    }

    this.isLoadingPayment = true; // Use payment loading state
    this.errorMessage = '';

    const formValue = this.bookingForm.value;
    const date = formValue.date;
    const time = formValue.time;

    // Selected date+time is CENTRE time (Asia/Kuala_Lumpur), not browser time.
    const preferredStartAt = toCentreTimestamp(date, time);

    // Calculate end time based on duration
    const duration = this.step1Data.bookingType?.default_duration_min || 60;
    const preferredEndAt = new Date(new Date(preferredStartAt).getTime() + duration * 60000).toISOString();

    const bookingData: CreateBookingRequest = {
      child_id: this.child.id,
      booking_type: this.step1Data.booking_type,
      mode: this.step1Data.mode,
      preferred_start_at: preferredStartAt,
      preferred_end_at: preferredEndAt,
      payment_method: null, // Will be updated by payment call
      notes: formValue.notes || null
    };

    this.bookingService.createBooking(bookingData, this.ensureBookingIdempotencyKey()).subscribe({
      next: (response) => {
        if (response.success) {
          // Store created booking data
          this.createdBooking = response.data.booking;
          this.bookingIdempotencyKey = null; // attempt done; next booking gets a fresh key
          // Save draft with booking ID in case payment fails and user reloads
          this.saveProgress();
          
          // Now proceed to payment
          this.executePayment(this.createdBooking.id);
        } else {
           this.isLoadingPayment = false;
           this.errorMessage = this.translationService.translate('bookingWizard.errors.createFailed');
        }
      },
      error: (error) => {
        console.error('Error creating booking:', error);
        this.isLoadingPayment = false;
        this.errorMessage = this.failureMessage(error, 'bookingWizard.errors.createFailed');
      }
    });
  }

  executePayment(bookingId: number): void {
    const paymentMethod = this.bookingForm.get('payment_method')?.value;
    this.isLoadingPayment = true;
    this.errorMessage = '';
    
    this.bookingService.payBooking(bookingId, paymentMethod).subscribe({
      next: (response) => {
        console.log('[BookingWizard] Payment response:', response);
        this.isLoadingPayment = false;
        if (paymentMethod === 'cash') {
          // Cash payment - show confirmation
          this.paymentConfirmationMessage = response.message || 
            'Booking reserved. Please pay at reception within 24 hours.';
          this.currentStep = 4;
          this.clearProgress(); // Clear draft on success
          this.stepComplete.emit({
            step: 3,
            data: { 
              booking: this.createdBooking, 
              payment_method: 'cash',
              message: this.paymentConfirmationMessage,
              status: response.status
            }
          });
        } else if (paymentMethod === 'card' || paymentMethod === 'online_banking') {
          // Online payment - show loading screen then redirect to Stripe checkout
          if (response.checkout_url) {
            console.log('[BookingWizard] Redirecting to Stripe:', response.checkout_url);
            // Move to step 4 (loading screen) before redirecting
            this.currentStep = 4;
            this.isLoadingPayment = true;
            this.clearProgress(); // Clear draft before redirecting
            // Redirect after a brief moment to show loading screen
            if (response.checkout_url) {
              setTimeout(() => {
                window.location.href = response.checkout_url!;
              }, 1000);
            } else {
              console.error('[BookingWizard] Checkout URL missing in response');
              this.errorMessage = this.translationService.translate('bookingWizard.errors.checkoutUnavailable');
              this.isLoadingPayment = false;
            }
          } else {
            console.error('[BookingWizard] Checkout URL missing in response');
            this.errorMessage = this.translationService.translate('bookingWizard.errors.checkoutUnavailable');
            this.isLoadingPayment = false;
          }
        }
      },
      error: (error) => {
        console.error('Error processing payment:', error);
        this.isLoadingPayment = false;
        this.errorMessage = this.failureMessage(error, 'bookingWizard.errors.paymentFailed');
      }
    });
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    // Bookings are made in centre time — display them in centre time too, so
    // the review step shows the same weekday/time in every browser timezone.
    // Locale follows the active language so BM users see BM weekday names.
    const date = new Date(dateString);
    const locale = this.translationService.getCurrentLanguage() === 'my' ? 'ms-MY' : 'en-US';
    const weekday = new Intl.DateTimeFormat(locale, { weekday: 'short', timeZone: CENTRE_TIMEZONE }).format(date);
    const time = new Intl.DateTimeFormat(locale, {
      hour: 'numeric', minute: '2-digit', hour12: true, timeZone: CENTRE_TIMEZONE,
    }).format(date);
    return `${weekday}, ${time}`;
  }

  getBookingSummary(): any {
    if (!this.createdBooking || !this.step1Data) {
      // For step 3, we might not have createdBooking yet, so use form values
      const preferredStartAt = this.bookingForm.get('date')?.value && this.bookingForm.get('time')?.value
        ? toCentreTimestamp(this.bookingForm.get('date')?.value, this.bookingForm.get('time')?.value)
        : null;
      const duration = this.step1Data.bookingType?.default_duration_min || 60;
      
      return {
        childName: this.child?.full_name || '',
        service: this.step1Data.bookingType?.name || '',
        serviceCode: this.step1Data.booking_type,
        mode: this.step1Data.mode,
        preferredTime: preferredStartAt ? this.formatDate(preferredStartAt) : '',
        duration: duration,
        // step1Data.price may be null if the user clicked Continue before the
        // async price lookup resolved — fall back to the live preview.
        price: this.step1Data.price?.price || this.pricePreview?.price || 0,
        currency: this.step1Data.price?.currency || this.pricePreview?.currency || 'MYR',
        location: this.getLocation()
      };
    }
    
    const preferredStartAt = this.createdBooking.preferred_start_at ||
                            toCentreTimestamp(this.bookingForm.get('date')?.value, this.bookingForm.get('time')?.value);
    const duration = this.step1Data.bookingType?.default_duration_min || 60;
    
    return {
      childName: this.child?.full_name || '',
      service: this.step1Data.bookingType?.name || '',
      serviceCode: this.step1Data.booking_type,
      mode: this.step1Data.mode,
      preferredTime: this.formatDate(preferredStartAt),
      duration: duration,
      price: this.createdBooking.price || this.step1Data.price?.price || this.pricePreview?.price || 0,
      currency: this.createdBooking.currency || this.step1Data.price?.currency || this.pricePreview?.currency || 'MYR',
      location: this.getLocation()
    };
  }

  generateTimeSlots(): string[] {
    const slots: string[] = [];
    for (let hour = 9; hour <= 17; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    return slots;
  }

  /**
   * Fetch backend-authoritative slots for the chosen date (centre hours aware).
   * Falls back to static slots if the request fails so the wizard stays usable.
   */
  loadAvailableSlots(date: string): void {
    this.isLoadingSlots = true;
    this.slotsMessage = '';
    const code = this.step1Data?.booking_type || this.bookingForm.get('booking_type')?.value;
    const childId = this.child?.id;

    this.bookingService.getAvailableSlots(date, code, childId).subscribe({
      next: (response) => {
        this.isLoadingSlots = false;
        if (response.success && response.data) {
          if (!response.data.is_open) {
            this.availableTimeSlots = [];
            this.slotsMessage = this.translationService.translate('bookingWizard.slots.centreClosed');
          } else {
            this.availableTimeSlots = response.data.slots || [];
            if (this.availableTimeSlots.length === 0) {
              this.slotsMessage = this.translationService.translate('bookingWizard.slots.noSlots');
            }
          }
          // Clear a previously selected time that is no longer offered.
          const currentTime = this.bookingForm.get('time')?.value;
          if (currentTime && !this.availableTimeSlots.includes(currentTime)) {
            this.bookingForm.patchValue({ time: '' });
          }
        }
      },
      error: (error) => {
        console.error('Error loading available slots:', error);
        this.isLoadingSlots = false;
        // Graceful fallback: keep the static slots so the user can still proceed;
        // the backend re-validates on create.
        this.availableTimeSlots = this.generateTimeSlots();
      }
    });
  }

  getLocation(): string {
    if (!this.step1Data) return '';
    return this.step1Data.mode === 'in_centre' 
      ? 'IOI Conezion, Putrajaya' 
      : 'Online (Google Meet)';
  }

  onClose(): void {
    this.saveProgress();
    this.close.emit();
  }

  isModeAllowed(mode: 'in_centre' | 'online'): boolean {
    if (!this.selectedBookingType) return true;
    return this.selectedBookingType.allowed_mode === 'both' || 
           this.selectedBookingType.allowed_mode === mode;
  }

  getModeLabel(mode: 'in_centre' | 'online'): string {
    return mode === 'in_centre' ? 'In-centre (Putrajaya)' : 'Online (Google Meet)';
  }

  // Calendar methods
  initCalendar(): void {
    const now = new Date();
    this.calendarMonth = now.getMonth();
    this.calendarYear = now.getFullYear();
    this.generateCalendarDays();
  }

  generateCalendarDays(): void {
    const firstDay = new Date(this.calendarYear, this.calendarMonth, 1);
    const lastDay = new Date(this.calendarYear, this.calendarMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.

    this.calendarDays = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      this.calendarDays.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      this.calendarDays.push(new Date(this.calendarYear, this.calendarMonth, day));
    }
  }

  getMonthName(): string {
    const keys = ['january', 'february', 'march', 'april', 'may', 'june',
                  'july', 'august', 'september', 'october', 'november', 'december'];
    return this.translationService.translate(`bookingWizard.calendar.months.${keys[this.calendarMonth]}`);
  }

  getWeekdayNames(): string[] {
    return ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
      .map(day => this.translationService.translate(`bookingWizard.calendar.weekdays.${day}`));
  }

  previousMonth(): void {
    if (this.calendarMonth === 0) {
      this.calendarMonth = 11;
      this.calendarYear--;
    } else {
      this.calendarMonth--;
    }
    this.generateCalendarDays();
  }

  nextMonth(): void {
    if (this.calendarMonth === 11) {
      this.calendarMonth = 0;
      this.calendarYear++;
    } else {
      this.calendarMonth++;
    }
    this.generateCalendarDays();
  }

  isDateDisabled(date: Date | null): boolean {
    if (!date) return true;
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    
    return checkDate < tomorrow;
  }

  isDateSelected(date: Date | null): boolean {
    if (!date) return false;
    const selectedDate = this.bookingForm.get('date')?.value;
    if (!selectedDate) return false;
    // Date-only comparison — parsing 'YYYY-MM-DD' with new Date() would read it
    // as UTC midnight and highlight the wrong cell in non-UTC browsers.
    return toLocalYMD(date) === selectedDate;
  }

  isToday(date: Date | null): boolean {
    if (!date) return false;
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  }

  selectDate(date: Date | null): void {
    if (!date || this.isDateDisabled(date)) return;

    // Calendar cells are LOCAL-midnight Dates; serialize the local calendar day.
    // (toISOString() shifted the day for every browser east of UTC — the
    // client-reported "22 July becomes 21 July" defect.)
    const dateString = toLocalYMD(date);
    this.bookingForm.patchValue({ date: dateString });
  }

  toggleLanguage(): void {
    const newLang = this.translationService.toggleLanguage();
    if (this.authService.isAuthenticatedUser()) {
      this.authService.updateProfile({ preferred_language: newLang }).subscribe({
        error: (err) => console.error('Failed to update language preference', err)
      });
    }
  }

  getServiceIcon(code: string): string {
    if (code === 'consultation') return '🩺';
    if (code === 'centre_session') return '🏢';
    if (code === 'online_session') return '💻';
    return '📅';
  }

  getServiceIconFromType(type: string | undefined): string {
    if (!type) return '📅';
    const lowerType = type.toLowerCase();
    if (lowerType.includes('consultation')) return '🩺';
    if (lowerType.includes('centre') || lowerType.includes('center')) return '🏢';
    if (lowerType.includes('online')) return '💻';
    return '📅';
  }
}

