import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ChildCaseService, ChildCaseUpdate, Attachment } from '../../../core/services/child-case.service';
import { TherapistBookingService } from '../../../core/services/therapist-booking.service';
import { LucideAngularModule, ArrowLeft, FileText, Upload, Image, Video, File, X, Trash2, Save, Plus } from 'lucide-angular';

@Component({
  selector: 'app-child-case-updates',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LucideAngularModule],
  templateUrl: './child-case-updates.component.html',
  styleUrls: ['./child-case-updates.component.css']
})
export class ChildCaseUpdatesComponent implements OnInit {
  childId: number | null = null;
  childInfo: any = null;
  caseUpdates: ChildCaseUpdate[] = [];
  isLoading = false;
  error: string | null = null;
  
  // Form data
  showUpdateForm = false;
  updateForm = {
    status: '',
    caseNotes: '',
    progressSummary: '',
    goals: [] as string[],
    newGoal: '',
    nextSteps: '',
    bookingId: null as number | null
  };
  
  // File upload
  selectedFiles: File[] = [];
  filePreview: { file: File; preview?: string }[] = [];
  isUploading = false;
  
  // Status values
  statusValues = [
    { value: 'progressing', label: 'Progressing', color: 'blue' },
    { value: 'stable', label: 'Stable', color: 'green' },
    { value: 'improving', label: 'Improving', color: 'emerald' },
    { value: 'needs_attention', label: 'Needs Attention', color: 'orange' }
  ];

  // Icons
  readonly ArrowLeftIcon = ArrowLeft;
  readonly FileTextIcon = FileText;
  readonly UploadIcon = Upload;
  readonly ImageIcon = Image;
  readonly VideoIcon = Video;
  readonly FileIcon = File;
  readonly XIcon = X;
  readonly Trash2Icon = Trash2;
  readonly SaveIcon = Save;
  readonly PlusIcon = Plus;

  constructor(
    private route: ActivatedRoute,
    private childCaseService: ChildCaseService,
    private bookingService: TherapistBookingService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.childId = +params['childId'];
      if (this.childId) {
        this.loadChildInfo();
        this.loadCaseUpdates();
      }
    });
  }

  loadChildInfo(): void {
    if (!this.childId) return;
    
    this.bookingService.getMyChildren().subscribe({
      next: (response) => {
        if (response.success) {
          this.childInfo = response.data.find((c: any) => c.id === this.childId);
        }
      },
      error: (error) => {
        console.error('Error loading child info:', error);
      }
    });
  }

  loadCaseUpdates(): void {
    if (!this.childId) return;
    
    this.isLoading = true;
    this.error = null;

    this.childCaseService.getCaseUpdates(this.childId).subscribe({
      next: (response) => {
        if (response.success) {
          this.caseUpdates = response.data;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading case updates:', error);
        this.error = error.error?.message || 'Error loading case updates';
        this.isLoading = false;
      }
    });
  }

  onFileSelected(event: any): void {
    const files = Array.from(event.target.files) as File[];
    files.forEach(file => {
      if (!this.selectedFiles.find(f => f.name === file.name && f.size === file.size)) {
        this.selectedFiles.push(file);
        
        // Create preview for images
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (e: any) => {
            this.filePreview.push({ file, preview: e.target.result });
          };
          reader.readAsDataURL(file);
        } else {
          this.filePreview.push({ file });
        }
      }
    });
    
    // Reset input
    event.target.value = '';
  }

  removeFile(index: number): void {
    this.selectedFiles.splice(index, 1);
    this.filePreview.splice(index, 1);
  }

  addGoal(): void {
    if (this.updateForm.newGoal.trim()) {
      this.updateForm.goals.push(this.updateForm.newGoal.trim());
      this.updateForm.newGoal = '';
    }
  }

  removeGoal(index: number): void {
    this.updateForm.goals.splice(index, 1);
  }

  openUpdateForm(): void {
    this.showUpdateForm = true;
  }

  closeUpdateForm(): void {
    this.showUpdateForm = false;
    this.resetForm();
  }

  resetForm(): void {
    this.updateForm = {
      status: '',
      caseNotes: '',
      progressSummary: '',
      goals: [],
      newGoal: '',
      nextSteps: '',
      bookingId: null
    };
    this.selectedFiles = [];
    this.filePreview = [];
  }

  submitCaseUpdate(): void {
    if (!this.childId) return;

    // Validate at least one field is filled
    if (!this.updateForm.status && 
        !this.updateForm.caseNotes?.trim() && 
        !this.updateForm.progressSummary?.trim() && 
        this.updateForm.goals.length === 0 && 
        !this.updateForm.nextSteps?.trim() && 
        this.selectedFiles.length === 0) {
      alert('Please fill at least one field or upload a file');
      return;
    }

    this.isUploading = true;

    const updateData: Partial<ChildCaseUpdate> = {
      status: this.updateForm.status || undefined,
      case_notes: this.updateForm.caseNotes?.trim() || undefined,
      progress_summary: this.updateForm.progressSummary?.trim() || undefined,
      goals: this.updateForm.goals.length > 0 ? this.updateForm.goals : undefined,
      next_steps: this.updateForm.nextSteps?.trim() || undefined,
      booking_id: this.updateForm.bookingId || undefined
    };

    this.childCaseService.createOrUpdateCaseUpdate(
      this.childId,
      updateData,
      this.selectedFiles.length > 0 ? this.selectedFiles : undefined
    ).subscribe({
      next: (response) => {
        if (response.success) {
          alert('Case update created successfully!');
          this.closeUpdateForm();
          this.loadCaseUpdates();
        } else {
          alert(response.message || 'Failed to create case update');
          this.isUploading = false;
        }
      },
      error: (error) => {
        console.error('Error creating case update:', error);
        const errorMessage = error.error?.message || error.message || 'Error creating case update. Please try again.';
        alert(errorMessage);
        this.isUploading = false;
      }
    });
  }

  deleteAttachment(updateId: number, fileUrl: string): void {
    if (!confirm('Are you sure you want to delete this file?')) {
      return;
    }

    this.childCaseService.deleteAttachment(updateId, fileUrl).subscribe({
      next: (response) => {
        if (response.success) {
          this.loadCaseUpdates();
        }
      },
      error: (error) => {
        console.error('Error deleting attachment:', error);
        alert(error.error?.message || 'Error deleting attachment');
      }
    });
  }

  getFileIcon(type: string | undefined): any {
    if (!type) return this.FileIcon;
    // Handle attachment type (from API: 'photo', 'video', 'document')
    if (type === 'photo' || type === 'image') return this.ImageIcon;
    if (type === 'video') return this.VideoIcon;
    // Handle MIME type (from File object)
    if (typeof type === 'string' && type.startsWith('image/')) return this.ImageIcon;
    if (typeof type === 'string' && type.startsWith('video/')) return this.VideoIcon;
    return this.FileIcon;
  }

  getStatusColor(status: string | undefined): string {
    if (!status) return 'gray';
    const statusObj = this.statusValues.find(s => s.value === status);
    return statusObj?.color || 'gray';
  }

  getStatusLabel(status: string | undefined): string {
    if (!status) return 'No Status';
    const statusObj = this.statusValues.find(s => s.value === status);
    return statusObj?.label || status;
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatFileSize(size: number | undefined): string {
    if (!size) return 'N/A';
    if (size < 1) return `${(size * 1024).toFixed(0)} KB`;
    return `${size.toFixed(2)} MB`;
  }

  isArray(value: any): boolean {
    return Array.isArray(value);
  }

  /**
   * Safely normalize goals to a string array for template usage
   */
  getGoalsArray(goals: string[] | string | undefined): string[] {
    if (!goals) {
      return [];
    }
    return Array.isArray(goals) ? goals : [goals];
  }
}
