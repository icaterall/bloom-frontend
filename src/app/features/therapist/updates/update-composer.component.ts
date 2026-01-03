import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { TherapistBookingService } from '../../../core/services/therapist-booking.service';
import { ProgressUpdatesService, CreateUpdateRequest, ProgressUpdateMedia } from '../../../core/services/progress-updates.service';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { LucideAngularModule, ArrowLeft, User, FileText, Upload, X, Image, Video, File, Save, Send, AlertCircle } from 'lucide-angular';

interface ChildOption {
  id: number;
  name: string;
}

@Component({
  selector: 'app-update-composer',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, TranslatePipe, LucideAngularModule],
  templateUrl: './update-composer.component.html',
  styleUrls: ['./update-composer.component.css']
})
export class UpdateComposerComponent implements OnInit {
  updateForm: FormGroup;
  children: ChildOption[] = [];
  selectedFiles: File[] = [];
  filePreviews: Array<{ file: File; preview?: string; type: 'image' | 'video' | 'pdf' }> = [];
  isLoading = false;
  isSaving = false;
  isPublishing = false;
  error: string | null = null;
  successMessage: string | null = null;
  createdUpdateId: number | null = null;

  // Icons
  readonly ArrowLeftIcon = ArrowLeft;
  readonly UserIcon = User;
  readonly FileTextIcon = FileText;
  readonly UploadIcon = Upload;
  readonly XIcon = X;
  readonly ImageIcon = Image;
  readonly VideoIcon = Video;
  readonly FileIcon = File;
  readonly SaveIcon = Save;
  readonly SendIcon = Send;
  readonly AlertCircleIcon = AlertCircle;

  // Update type options
  updateTypeOptions = [
    { value: 'session_summary', labelKey: 'updateComposer.updateType.sessionSummary' },
    { value: 'weekly_note', labelKey: 'updateComposer.updateType.weeklyNote' },
    { value: 'milestone', labelKey: 'updateComposer.updateType.milestone' },
    { value: 'home_activity', labelKey: 'updateComposer.updateType.homeActivity' },
    { value: 'incident', labelKey: 'updateComposer.updateType.incident' }
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private bookingService: TherapistBookingService,
    private updatesService: ProgressUpdatesService
  ) {
    this.updateForm = this.fb.group({
      childId: ['', [Validators.required]],
      updateType: ['session_summary', [Validators.required]],
      title: [''],
      body: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.loadChildren();
    
    // Check for query parameters
    this.route.queryParams.subscribe(params => {
      if (params['childId']) {
        this.updateForm.patchValue({ childId: parseInt(params['childId'], 10) });
      }
      if (params['bookingId']) {
        // Store bookingId for later use
        this.updateForm.addControl('bookingId', this.fb.control(params['bookingId']));
      }
    });
  }

  loadChildren(): void {
    this.bookingService.getMyChildren().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.children = response.data.map((child: any) => ({
            id: child.id,
            name: child.name || child.full_name
          }));
        }
      },
      error: (error) => {
        console.error('Error loading children:', error);
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      Array.from(input.files).forEach(file => {
        // Validate file type
        const fileType = this.getFileType(file);
        if (!fileType) {
          this.error = `File ${file.name} is not allowed. Allowed types: JPG, PNG, WebP images, MP4 videos, PDF documents`;
          return;
        }

        // Validate file size (50MB max)
        if (file.size > 50 * 1024 * 1024) {
          this.error = `File ${file.name} is too large. Maximum size is 50MB`;
          return;
        }

        this.selectedFiles.push(file);
        
        // Create preview for images
        if (fileType === 'image') {
          const reader = new FileReader();
          reader.onload = (e: any) => {
            this.filePreviews.push({
              file,
              preview: e.target.result,
              type: 'image'
            });
          };
          reader.readAsDataURL(file);
        } else {
          this.filePreviews.push({
            file,
            type: fileType
          });
        }
      });
    }
  }

  removeFile(index: number): void {
    this.selectedFiles.splice(index, 1);
    this.filePreviews.splice(index, 1);
  }

  getFileType(file: File): 'image' | 'video' | 'pdf' | null {
    if (file.type.startsWith('image/')) {
      const allowedImages = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      return allowedImages.includes(file.type) ? 'image' : null;
    }
    if (file.type === 'video/mp4') {
      return 'video';
    }
    if (file.type === 'application/pdf') {
      return 'pdf';
    }
    return null;
  }

  getFileIcon(type: string): any {
    switch (type) {
      case 'image':
        return this.ImageIcon;
      case 'video':
        return this.VideoIcon;
      case 'pdf':
        return this.FileIcon;
      default:
        return this.FileIcon;
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  saveDraft(): void {
    if (this.updateForm.invalid) {
      this.updateForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    this.error = null;

    const formValue = this.updateForm.value;
    const updateData: CreateUpdateRequest = {
      childId: formValue.childId,
      bookingId: formValue.bookingId ? parseInt(formValue.bookingId, 10) : undefined,
      updateType: formValue.updateType,
      title: formValue.title || undefined,
      body: formValue.body
    };

    this.updatesService.createUpdate(updateData).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.createdUpdateId = response.data.id!;
          
          // Upload media if files are selected
          if (this.selectedFiles.length > 0 && this.createdUpdateId) {
            this.uploadMedia();
          } else {
            this.isSaving = false;
            this.successMessage = 'Draft saved successfully';
            setTimeout(() => this.successMessage = null, 3000);
          }
        } else {
          this.error = 'Failed to save draft';
          this.isSaving = false;
        }
      },
      error: (error) => {
        console.error('Error saving draft:', error);
        this.error = error.error?.message || 'Failed to save draft. Please try again.';
        this.isSaving = false;
      }
    });
  }

  uploadMedia(): void {
    if (!this.createdUpdateId || this.selectedFiles.length === 0) {
      this.isSaving = false;
      return;
    }

    this.updatesService.uploadMedia(this.createdUpdateId, this.selectedFiles).subscribe({
      next: (response) => {
        this.isSaving = false;
        this.successMessage = 'Draft saved successfully';
        setTimeout(() => this.successMessage = null, 3000);
      },
      error: (error) => {
        console.error('Error uploading media:', error);
        this.error = 'Draft saved but media upload failed. You can add media later.';
        this.isSaving = false;
        setTimeout(() => this.error = null, 5000);
      }
    });
  }

  publishToParent(): void {
    if (this.updateForm.invalid) {
      this.updateForm.markAllAsTouched();
      return;
    }

    this.isPublishing = true;
    this.error = null;

    const formValue = this.updateForm.value;
    const updateData: CreateUpdateRequest = {
      childId: formValue.childId,
      bookingId: formValue.bookingId ? parseInt(formValue.bookingId, 10) : undefined,
      updateType: formValue.updateType,
      title: formValue.title || undefined,
      body: formValue.body
    };

    // First create the update
    this.updatesService.createUpdate(updateData).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.createdUpdateId = response.data.id!;
          
          // Upload media if files are selected
          if (this.selectedFiles.length > 0) {
            this.uploadMediaAndPublish();
          } else {
            // Publish directly
            this.publishUpdate();
          }
        } else {
          this.error = 'Failed to create update';
          this.isPublishing = false;
        }
      },
      error: (error) => {
        console.error('Error creating update:', error);
        this.error = error.error?.message || 'Failed to create update. Please try again.';
        this.isPublishing = false;
      }
    });
  }

  uploadMediaAndPublish(): void {
    if (!this.createdUpdateId || this.selectedFiles.length === 0) {
      this.publishUpdate();
      return;
    }

    this.updatesService.uploadMedia(this.createdUpdateId, this.selectedFiles).subscribe({
      next: () => {
        this.publishUpdate();
      },
      error: (error) => {
        console.error('Error uploading media:', error);
        // Still try to publish even if media upload fails
        this.publishUpdate();
      }
    });
  }

  publishUpdate(): void {
    if (!this.createdUpdateId) {
      this.error = 'Update ID not found';
      this.isPublishing = false;
      return;
    }

    this.updatesService.publishUpdate(this.createdUpdateId).subscribe({
      next: (response) => {
        if (response.success) {
          this.successMessage = 'Update published successfully! Parent will be notified.';
          setTimeout(() => {
            // Navigate back or to child updates page
            const childId = this.updateForm.value.childId;
            if (childId) {
              this.router.navigate(['/therapist/children', childId, 'case-updates']);
            } else {
              this.router.navigate(['/therapist/sessions']);
            }
          }, 2000);
        } else {
          this.error = 'Failed to publish update';
          this.isPublishing = false;
        }
      },
      error: (error) => {
        console.error('Error publishing update:', error);
        this.error = error.error?.message || 'Failed to publish update. Please try again.';
        this.isPublishing = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/therapist/sessions']);
  }
}

