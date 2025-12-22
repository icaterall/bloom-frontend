import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LucideAngularModule, Mail, Phone, User, Send, X, CheckCircle, AlertCircle } from 'lucide-angular';
import { ContactService, ContactParentRequest } from '../../../core/services/contact.service';
import { ParentService } from '../../../core/services/parent.service';

@Component({
  selector: 'app-contact-parent',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule
  ],
  templateUrl: './contact-parent.component.html',
  styleUrls: ['./contact-parent.component.css']
})
export class ContactParentComponent implements OnInit {
  parentId: number | null = null;
  parentInfo: any = null;
  isLoading = false;
  isLoadingParent = false;
  isSending = false;
  showSuccess = false;
  error: string | null = null;

  // Form data
  subject = '';
  message = '';
  sendEmail = true;
  sendNotification = true;

  // Icons
  readonly MailIcon = Mail;
  readonly PhoneIcon = Phone;
  readonly UserIcon = User;
  readonly SendIcon = Send;
  readonly XIcon = X;
  readonly CheckCircleIcon = CheckCircle;
  readonly AlertCircleIcon = AlertCircle;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private contactService: ContactService,
    private parentService: ParentService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.parentId = parseInt(id, 10);
        this.loadParentInfo();
      } else {
        this.error = 'Parent ID is required';
      }
    });
  }

  loadParentInfo(): void {
    if (!this.parentId) return;

    this.isLoadingParent = true;
    this.contactService.getParentContactInfo(this.parentId).subscribe({
      next: (response) => {
        if (response.success) {
          this.parentInfo = response.data;
        }
        this.isLoadingParent = false;
      },
      error: (error) => {
        console.error('Error loading parent info:', error);
        this.error = 'Failed to load parent information';
        this.isLoadingParent = false;
      }
    });
  }

  onSubmit(): void {
    if (!this.parentId) return;

    // Validation
    if (!this.subject.trim()) {
      this.error = 'Subject is required';
      return;
    }

    if (!this.message.trim()) {
      this.error = 'Message is required';
      return;
    }

    if (this.subject.length > 255) {
      this.error = 'Subject must be 255 characters or less';
      return;
    }

    if (this.message.length > 5000) {
      this.error = 'Message must be 5000 characters or less';
      return;
    }

    this.error = null;
    this.isSending = true;

    const request: ContactParentRequest = {
      subject: this.subject.trim(),
      message: this.message.trim(),
      sendEmail: this.sendEmail,
      sendNotification: this.sendNotification
    };

    this.contactService.contactParent(this.parentId, request).subscribe({
      next: (response) => {
        if (response.success) {
          this.showSuccess = true;
          // Reset form
          this.subject = '';
          this.message = '';
          // Hide success message after 5 seconds
          setTimeout(() => {
            this.showSuccess = false;
          }, 5000);
        }
        this.isSending = false;
      },
      error: (error) => {
        console.error('Error sending message:', error);
        this.error = error.error?.message || 'Failed to send message. Please try again.';
        this.isSending = false;
      }
    });
  }

  getCharacterCount(): number {
    return this.message.length;
  }

  getMaxCharacterCount(): number {
    return 5000;
  }

  goBack(): void {
    this.router.navigate(['/clinical-manager/parents']);
  }
}

