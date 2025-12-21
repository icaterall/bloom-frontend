import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideAngularModule, X, Clock, MapPin, Monitor, Calendar, FileText, ChevronLeft, ChevronRight } from 'lucide-angular';
import { Child } from '../../../../shared/models/child.model';
import { BookingService } from '../../../../core/services/booking.service';
import { BookingType } from '../../../../shared/models/booking-type.model';
import { CreateBookingRequest } from '../../../../shared/models/booking.model';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-booking-wizard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
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

  constructor(
    private fb: FormBuilder,
    private bookingService: BookingService
  ) {
    // Set min date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    this.minDate = tomorrow.toISOString().split('T')[0];
    
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
    this.loadBookingTypes();
    this.initCalendar();
    
    // Watch for booking type changes to update mode options
    this.bookingForm.get('booking_type')?.valueChanges.subscribe(code => {
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
      this.updatePricePreview();
    });
    
    // Watch for step changes to reinitialize calendar
    this.bookingForm.get('date')?.valueChanges.subscribe(date => {
      if (date) {
        const selected = new Date(date);
        this.calendarMonth = selected.getMonth();
        this.calendarYear = selected.getFullYear();
        this.generateCalendarDays();
      }
    });
  }

  loadBookingTypes(): void {
    this.isLoadingTypes = true;
    this.bookingService.getBookingTypes().subscribe({
      next: (response) => {
        if (response.success && Array.isArray(response.data)) {
          // Filter out 'tour' if needed (optional as per requirements)
          this.bookingTypes = response.data.filter(type => type.code !== 'tour');
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

  createBooking(): void {
    if (!this.child || !this.child.id || !this.step1Data) {
      this.errorMessage = 'Child information is missing. Please try again.';
      return;
    }

    this.isLoadingBooking = true;
    this.errorMessage = '';

    const formValue = this.bookingForm.value;
    const date = formValue.date;
    const time = formValue.time;
    
    // Combine date and time into ISO string
    const preferredStartAt = new Date(`${date}T${time}`).toISOString();
    
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

    this.bookingService.createBooking(bookingData).subscribe({
      next: (response) => {
        this.isLoadingBooking = false;
        if (response.success) {
          // Store created booking data
          this.createdBooking = response.data.booking;
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
        this.errorMessage = error.error?.message || 'Failed to create booking. Please try again.';
      }
    });
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
      // Step 2: Time selection - Create booking
      if (this.bookingForm.get('date')?.invalid || this.bookingForm.get('time')?.invalid) {
        this.bookingForm.markAllAsTouched();
        return;
      }

      this.createBooking();
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

    if (!this.createdBooking || !this.createdBooking.id) {
      this.errorMessage = 'Booking not found. Please try again.';
      return;
    }

    const paymentMethod = this.bookingForm.get('payment_method')?.value;
    this.isLoadingPayment = true;
    this.errorMessage = '';
    
    this.bookingService.payBooking(this.createdBooking.id, paymentMethod).subscribe({
      next: (response) => {
        console.log('[BookingWizard] Payment response:', response);
        this.isLoadingPayment = false;
        if (paymentMethod === 'cash') {
          // Cash payment - show confirmation
          this.paymentConfirmationMessage = response.message || 
            'Booking reserved. Please pay at reception within 24 hours.';
          this.currentStep = 4;
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
          // Online payment - redirect to Stripe checkout
          if (response.checkout_url) {
            console.log('[BookingWizard] Redirecting to Stripe:', response.checkout_url);
            window.location.href = response.checkout_url;
          } else {
            console.error('[BookingWizard] Checkout URL missing in response');
            this.errorMessage = 'Checkout URL not available. Please try again.';
          }
        }
      },
      error: (error) => {
        console.error('Error processing payment:', error);
        this.isLoadingPayment = false;
        this.errorMessage = error.error?.message || 'Failed to process payment. Please try again.';
      }
    });
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayName = days[date.getDay()];
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, '0');
    return `${dayName}, ${displayHours}:${displayMinutes} ${ampm}`;
  }

  getBookingSummary(): any {
    if (!this.createdBooking || !this.step1Data) return null;
    
    const preferredStartAt = this.createdBooking.preferred_start_at || 
                            new Date(`${this.bookingForm.get('date')?.value}T${this.bookingForm.get('time')?.value}`).toISOString();
    const duration = this.step1Data.bookingType?.default_duration_min || 60;
    
    return {
      childName: this.child?.full_name || '',
      service: this.step1Data.bookingType?.name || '',
      mode: this.getModeLabel(this.step1Data.mode),
      preferredTime: this.formatDate(preferredStartAt),
      duration: duration,
      price: this.createdBooking.price || this.step1Data.price?.price || 0,
      currency: this.createdBooking.currency || this.step1Data.price?.currency || 'MYR'
    };
  }

  generateTimeSlots(): string[] {
    const slots: string[] = [];
    for (let hour = 9; hour <= 17; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    return slots;
  }

  getLocation(): string {
    if (!this.step1Data) return '';
    return this.step1Data.mode === 'in_centre' 
      ? 'IOI Conezion, Putrajaya' 
      : 'Online (Google Meet)';
  }

  onClose(): void {
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
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                    'July', 'August', 'September', 'October', 'November', 'December'];
    return months[this.calendarMonth];
  }

  getWeekdayNames(): string[] {
    return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
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
    
    const checkDate = new Date(date);
    const formDate = new Date(selectedDate);
    
    return checkDate.getDate() === formDate.getDate() &&
           checkDate.getMonth() === formDate.getMonth() &&
           checkDate.getFullYear() === formDate.getFullYear();
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
    
    const dateString = date.toISOString().split('T')[0];
    this.bookingForm.patchValue({ date: dateString });
  }
}

