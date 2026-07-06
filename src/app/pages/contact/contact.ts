import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideAngularModule, MapPin, Phone, Mail, Instagram, Send, CheckCircle, AlertCircle } from 'lucide-angular';
import { HeaderComponent } from '../../shared/header/header';
import { FooterComponent } from '../../shared/footer/footer';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { ContactEnquiriesService } from '../../core/services/contact-enquiries.service';

// Public contact email — display value shown on the site (also the enquiry
// notification recipient, configured backend-side).
export const PUBLIC_CONTACT_EMAIL = 'bloomspectrumcentre@gmail.com';

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

  constructor(
    private fb: FormBuilder,
    private enquiriesService: ContactEnquiriesService,
  ) {
    this.enquiryForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.maxLength(120)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(180)]],
      phone: ['', [Validators.required, Validators.pattern(/^[+()\-\s.0-9]{7,20}$/)]],
      subject: ['', [Validators.maxLength(180)]],
      message: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(3000)]],
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
        error: () => {
          this.isSubmitting = false;
          this.submitFailed = true;
        },
      });
  }
}
