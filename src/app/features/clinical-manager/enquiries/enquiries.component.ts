import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { LucideAngularModule, Mail, Phone, CheckCircle2, Search, Eye, X } from 'lucide-angular';
import { ContactEnquiriesService, ContactEnquiry } from '../../../core/services/contact-enquiries.service';

type StatusFilter = 'all' | 'new' | 'reviewed';

// Website contact enquiries — read-only list + "mark reviewed" for
// admin & clinical_manager (Phase 10). Shared by both portals, mirroring
// how ToursComponent is shared.
@Component({
  selector: 'app-contact-enquiries',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, DatePipe],
  templateUrl: './enquiries.component.html',
})
export class EnquiriesComponent implements OnInit {
  readonly MailIcon = Mail;
  readonly PhoneIcon = Phone;
  readonly CheckIcon = CheckCircle2;
  readonly SearchIcon = Search;
  readonly EyeIcon = Eye;
  readonly XIcon = X;

  enquiries: ContactEnquiry[] = [];
  filteredEnquiries: ContactEnquiry[] = [];
  isLoading = true;
  error: string | null = null;

  // Accurate totals from the backend (GROUP BY over the whole table), not the
  // returned page — so the tab counts stay correct even past the fetch cap.
  totalCount = 0;
  statusCounts: { new?: number; reviewed?: number } = {};

  activeFilter: StatusFilter = 'all';
  searchQuery = '';

  selectedEnquiry: ContactEnquiry | null = null;
  showPanel = false;

  markingReviewedId: number | null = null;
  actionSuccess: string | null = null;
  actionError: string | null = null;

  constructor(private enquiriesService: ContactEnquiriesService) {}

  ngOnInit(): void {
    this.loadEnquiries();
  }

  loadEnquiries(): void {
    this.isLoading = true;
    this.error = null;

    this.enquiriesService.getEnquiries({ limit: 100 }).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success && Array.isArray(res.data?.enquiries)) {
          this.enquiries = res.data.enquiries;
          this.statusCounts = res.data.statusCounts || {};
          this.totalCount = res.data.pagination?.total ?? this.enquiries.length;
          this.applyFilters();
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.error = err.error?.message || 'Failed to load enquiries';
      }
    });
  }

  setFilter(filter: StatusFilter): void {
    this.activeFilter = filter;
    this.applyFilters();
  }

  onSearch(event: Event): void {
    this.searchQuery = (event.target as HTMLInputElement).value.toLowerCase();
    this.applyFilters();
  }

  applyFilters(): void {
    let result = [...this.enquiries];

    if (this.activeFilter === 'new') {
      result = result.filter(e => e.status === 'new');
    } else if (this.activeFilter === 'reviewed') {
      result = result.filter(e => e.status === 'reviewed');
    }

    if (this.searchQuery) {
      result = result.filter(e =>
        e.full_name.toLowerCase().includes(this.searchQuery) ||
        e.email.toLowerCase().includes(this.searchQuery) ||
        (e.phone || '').toLowerCase().includes(this.searchQuery) ||
        (e.subject || '').toLowerCase().includes(this.searchQuery)
      );
    }

    this.filteredEnquiries = result;
  }

  openPanel(enquiry: ContactEnquiry): void {
    this.selectedEnquiry = enquiry;
    this.showPanel = true;
    this.actionSuccess = null;
    this.actionError = null;
  }

  closePanel(): void {
    this.showPanel = false;
    setTimeout(() => { this.selectedEnquiry = null; }, 300);
  }

  markReviewed(enquiry: ContactEnquiry): void {
    if (enquiry.status === 'reviewed' || this.markingReviewedId) return;
    this.markingReviewedId = enquiry.id;
    this.actionError = null;

    this.enquiriesService.markReviewed(enquiry.id).subscribe({
      next: (res) => {
        this.markingReviewedId = null;
        if (res.success) {
          enquiry.status = 'reviewed';
          enquiry.reviewed_at = (res.data?.reviewed_at as string) || new Date().toISOString();
          this.actionSuccess = 'Enquiry marked as reviewed';
          this.applyFilters();
          setTimeout(() => { this.actionSuccess = null; }, 3000);
        }
      },
      error: (err) => {
        this.markingReviewedId = null;
        this.actionError = err.error?.message || 'Failed to mark as reviewed';
        setTimeout(() => { this.actionError = null; }, 4000);
      }
    });
  }

  truncate(text: string, max = 60): string {
    if (!text) return '';
    return text.length > max ? text.substring(0, max) + '…' : text;
  }

  get countNew(): number {
    return this.statusCounts.new ?? this.enquiries.filter(e => e.status === 'new').length;
  }

  get countReviewed(): number {
    return this.statusCounts.reviewed ?? this.enquiries.filter(e => e.status === 'reviewed').length;
  }
}
