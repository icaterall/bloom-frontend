import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { classifyHttpError } from '../../core/errors/http-error';
import { LucideAngularModule, MapPin, Phone, Mail, Instagram, Send, CheckCircle, AlertCircle } from 'lucide-angular';
import { HeaderComponent } from '../../shared/header/header';
import { FooterComponent } from '../../shared/footer/footer';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { ContactEnquiriesService } from '../../core/services/contact-enquiries.service';

// Public contact email — display value shown on the site (also the enquiry
// notification recipient, configured backend-side).
export const PUBLIC_CONTACT_EMAIL = 'bloomspectrumcentre@gmail.com';

// Like Validators.minLength, but on the TRIMMED value — the backend trims
// before validating, so "   hi   " must fail here too, not 400 server-side.
// Whitespace-only input is reported as 'required' (Validators.required does
// not trim, so it would otherwise accept a string of spaces).
function minTrimmedLength(min: number) {
  return (control: AbstractControl): ValidationErrors | null => {
    const raw = control.value || '';
    const value = raw.trim();
    if (!value) {
      return raw ? { required: true } : null; // empty is left to Validators.required
    }
    return value.length >= min ? null : { minlength: { requiredLength: min, actualLength: value.length } };
  };
}

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    LucideAngularModule,
    HeaderComponent,
    FooterComponent,
    TranslatePipe,
  ],
  templateUrl: './contact.html',
  styleUrl: './contact.scss',
})
export class Contact {
  readonly MapPinIcon = MapPin;
  readonly PhoneIcon = Phone;
  readonly MailIcon = Mail;
  readonly InstagramIcon = Instagram;
  readonly SendIcon = Send;
  readonly CheckCircleIcon = CheckCircle;
  readonly AlertCircleIcon = AlertCircle;

  readonly contactEmail = PUBLIC_CONTACT_EMAIL;

  enquiryForm: FormGroup;
  isSubmitting = false;
  submitSucceeded = false;
  submitFailed = false;
  // i18n key for the failure banner — refined per error class on submit failure.
  submitErrorKey = 'contact.form.error';
  // Specific backend-provided text (e.g. exact validation reason); when set it
  // is shown instead of the generic localized banner copy.
  submitErrorText: string | null = null;

  constructor(
    private fb: FormBuilder,
    private enquiriesService: ContactEnquiriesService,
  ) {
    this.enquiryForm = this.fb.group({
      fullName: ['', [Validators.required, minTrimmedLength(1), Validators.maxLength(120)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(180)]],
      phone: ['', [Validators.required, Validators.pattern(/^[+()\-\s.0-9]{7,20}$/)]],
      subject: ['', [Validators.maxLength(180)]],
      message: ['', [Validators.required, minTrimmedLength(10), Validators.maxLength(3000)]],
      // Honeypot — hidden from real users; anything typed here marks the
      // submission as bot traffic.
      website: [''],
    });
  }

  hasError(controlName: string): boolean {
    const control = this.enquiryForm.get(controlName);
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  onSubmit(): void {
    this.submitSucceeded = false;
    this.submitFailed = false;
    this.submitErrorText = null;

    if (this.enquiryForm.invalid) {
      this.enquiryForm.markAllAsTouched();
      return;
    }
    if (this.isSubmitting) {
      return; // re-entry guard: no double submit
    }

    this.isSubmitting = true;
    const raw = this.enquiryForm.value;
    this.enquiriesService
      .submitEnquiry({
        fullName: (raw.fullName || '').trim(),
        email: (raw.email || '').trim(),
        phone: (raw.phone || '').trim(),
        subject: (raw.subject || '').trim(),
        message: (raw.message || '').trim(),
        website: raw.website || '',
      })
      .subscribe({
        next: () => {
          this.isSubmitting = false;
          this.submitSucceeded = true;
          this.enquiryForm.reset();
        },
        error: (error) => {
          this.isSubmitting = false;
          this.submitFailed = true;
          // A real HTTP response is never presented as a connectivity problem.
          const classified = classifyHttpError(error);
          switch (classified.kind) {
            case 'network':
              this.submitErrorKey = 'contact.form.errors.network';
              break;
            case 'rate_limited':
              this.submitErrorKey = 'contact.form.errors.tooMany';
              break;
            case 'validation':
              // The backend reports validation failures as a human-readable
              // message string — show it verbatim (rare: client rules mirror
              // server rules, so this only fires on genuine mismatches).
              this.submitErrorKey = 'contact.form.errors.validation';
              this.submitErrorText = classified.backendMessage;
              break;
            default:
              this.submitErrorKey = 'contact.form.error';
          }
        },
      });
  }
}
