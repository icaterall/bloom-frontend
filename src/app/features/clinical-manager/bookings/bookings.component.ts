import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  LucideAngularModule,
  Calendar,
  Clock,
  MapPin,
  User,
  Video,
  CheckCircle,
  AlertCircle,
  Mail,
  Phone,
  Search,
  Filter,
  Download,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
  Eye,
  Edit,
  X,
  RefreshCw,
  Building,
  ArrowUpDown,
  FileText,
  Users,
  CalendarDays,
  TrendingUp,
  Loader2,
  ExternalLink
} from 'lucide-angular';
import { ClinicalManagerBookingsService, BookingsQueryParams, BookingStats } from '../../../core/services/clinical-manager-bookings.service';
import { Booking } from '../../../shared/models/booking.model';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

type SortField = 'id' | 'child_name' | 'parent_name' | 'booking_type' | 'confirmed_start_at' | 'status' | 'therapist_name';

@Component({
  selector: 'app-bookings',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    LucideAngularModule
  ],
  templateUrl: './bookings.component.html',
  styleUrls: ['./bookings.component.css']
})
export class BookingsComponent implements OnInit, OnDestroy {
  bookings: Booking[] = [];
  isLoading = false;
  error: string | null = null;

  // Stats
  stats: BookingStats | null = null;
  statsLoading = false;

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  totalPages = 0;
  pageSizeOptions = [10, 25, 50, 100];

  // Search & Filters
  searchTerm = '';
  searchSubject = new Subject<string>();
  selectedStatus = '';
  selectedType = '';
  selectedMode = '';
  dateFrom = '';
  dateTo = '';
  showFilters = false;

  // Sorting
  sortField: SortField = 'confirmed_start_at';
  sortOrder: 'asc' | 'desc' = 'asc';

  // Row expansion
  expandedRowId: number | null = null;

  // Action menu
  activeActionMenu: number | null = null;

  // Detail modal
  showDetailModal = false;
  selectedBooking: Booking | null = null;

  // Destroy subject
  private destroy$ = new Subject<void>();

  // Status options
  statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'awaiting_payment', label: 'Awaiting Payment' },
    { value: 'awaiting_cash_payment', label: 'Awaiting Cash' },
    { value: 'awaiting_clinical_review', label: 'Clinical Review' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'no_show', label: 'No Show' }
  ];

  // Type options
  typeOptions = [
    { value: '', label: 'All Types' },
    { value: 'tour', label: 'Tour' },
    { value: 'consultation', label: 'Consultation' },
    { value: 'centre_session', label: 'Centre Session' },
    { value: 'online_session', label: 'Online Session' }
  ];

  // Mode options
  modeOptions = [
    { value: '', label: 'All Modes' },
    { value: 'in_centre', label: 'In Centre' },
    { value: 'online', label: 'Online' }
  ];

  // Icons
  readonly CalendarIcon = Calendar;
  readonly ClockIcon = Clock;
  readonly MapPinIcon = MapPin;
  readonly UserIcon = User;
  readonly VideoIcon = Video;
  readonly CheckCircleIcon = CheckCircle;
  readonly AlertCircleIcon = AlertCircle;
  readonly MailIcon = Mail;
  readonly PhoneIcon = Phone;
  readonly SearchIcon = Search;
  readonly FilterIcon = Filter;
  readonly DownloadIcon = Download;
  readonly ChevronDownIcon = ChevronDown;
  readonly ChevronUpIcon = ChevronUp;
  readonly ChevronLeftIcon = ChevronLeft;
  readonly ChevronRightIcon = ChevronRight;
  readonly ChevronsLeftIcon = ChevronsLeft;
  readonly ChevronsRightIcon = ChevronsRight;
  readonly MoreHorizontalIcon = MoreHorizontal;
  readonly EyeIcon = Eye;
  readonly EditIcon = Edit;
  readonly XIcon = X;
  readonly RefreshIcon = RefreshCw;
  readonly BuildingIcon = Building;
  readonly ArrowUpDownIcon = ArrowUpDown;
  readonly FileTextIcon = FileText;
  readonly UsersIcon = Users;
  readonly CalendarDaysIcon = CalendarDays;
  readonly TrendingUpIcon = TrendingUp;
  readonly LoaderIcon = Loader2;
  readonly ExternalLinkIcon = ExternalLink;

  constructor(
    private bookingsService: ClinicalManagerBookingsService
  ) {}

  ngOnInit(): void {
    this.loadBookings();
    this.loadStats();
    this.setupSearch();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setupSearch(): void {
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.currentPage = 1;
      this.loadBookings();
    });
  }

  onSearchInput(): void {
    this.searchSubject.next(this.searchTerm);
  }

  loadBookings(): void {
    this.isLoading = true;
    this.error = null;

    const params: BookingsQueryParams = {
      page: this.currentPage,
      limit: this.pageSize,
      sort_by: this.sortField,
      sort_order: this.sortOrder
    };

    if (this.searchTerm) params.search = this.searchTerm;
    if (this.selectedStatus) params.status = this.selectedStatus;
    if (this.selectedType) params.booking_type = this.selectedType;
    if (this.selectedMode) params.mode = this.selectedMode;
    if (this.dateFrom) params.date_from = this.dateFrom;
    if (this.dateTo) params.date_to = this.dateTo;

    this.bookingsService.getBookings(params).subscribe({
      next: (response) => {
        if (response.success) {
          this.bookings = response.data || [];
          if (response.pagination) {
            this.totalItems = response.pagination.total;
            this.totalPages = response.pagination.totalPages;
          }
        } else {
          this.bookings = [];
          this.totalItems = 0;
          this.totalPages = 0;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading bookings:', error);
        // Fallback to confirmed bookings endpoint if paginated fails
        this.loadConfirmedBookings();
      }
    });
  }

  loadConfirmedBookings(): void {
    this.bookingsService.getConfirmedBookings().subscribe({
      next: (response) => {
        if (response.success) {
          let data = response.data || [];

          // Client-side filtering
          if (this.searchTerm) {
            const search = this.searchTerm.toLowerCase();
            data = data.filter(b =>
              b.child_name?.toLowerCase().includes(search) ||
              b.parent_name?.toLowerCase().includes(search) ||
              b.therapist_name?.toLowerCase().includes(search) ||
              b.id?.toString().includes(search)
            );
          }
          if (this.selectedStatus) {
            data = data.filter(b => b.status === this.selectedStatus);
          }
          if (this.selectedType) {
            data = data.filter(b => b.booking_type === this.selectedType);
          }
          if (this.selectedMode) {
            data = data.filter(b => b.mode === this.selectedMode);
          }

          // Client-side sorting
          data.sort((a, b) => {
            let aVal: string | number | undefined;
            let bVal: string | number | undefined;

            switch (this.sortField) {
              case 'id':
                aVal = a.id;
                bVal = b.id;
                break;
              case 'child_name':
                aVal = a.child_name?.toLowerCase();
                bVal = b.child_name?.toLowerCase();
                break;
              case 'parent_name':
                aVal = a.parent_name?.toLowerCase();
                bVal = b.parent_name?.toLowerCase();
                break;
              case 'booking_type':
                aVal = a.booking_type;
                bVal = b.booking_type;
                break;
              case 'confirmed_start_at':
                aVal = a.confirmed_start_at || a.preferred_start_at;
                bVal = b.confirmed_start_at || b.preferred_start_at;
                break;
              case 'status':
                aVal = a.status;
                bVal = b.status;
                break;
              case 'therapist_name':
                aVal = a.therapist_name?.toLowerCase();
                bVal = b.therapist_name?.toLowerCase();
                break;
            }

            if (aVal === undefined) return 1;
            if (bVal === undefined) return -1;
            if (aVal < bVal) return this.sortOrder === 'asc' ? -1 : 1;
            if (aVal > bVal) return this.sortOrder === 'asc' ? 1 : -1;
            return 0;
          });

          this.totalItems = data.length;
          this.totalPages = Math.ceil(data.length / this.pageSize);

          // Client-side pagination
          const start = (this.currentPage - 1) * this.pageSize;
          this.bookings = data.slice(start, start + this.pageSize);
        } else {
          this.error = 'Failed to load bookings';
          this.bookings = [];
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading bookings:', error);
        this.error = error.error?.message || 'Error loading bookings. Please try again.';
        this.bookings = [];
        this.isLoading = false;
      }
    });
  }

  loadStats(): void {
    this.statsLoading = true;
    this.bookingsService.getBookingStats().subscribe({
      next: (response) => {
        if (response.success) {
          this.stats = response.data;
        }
        this.statsLoading = false;
      },
      error: () => {
        this.statsLoading = false;
      }
    });
  }

  // Sorting
  sortBy(field: SortField): void {
    if (this.sortField === field) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortOrder = 'asc';
    }
    this.loadBookings();
  }

  getSortIcon(field: SortField): typeof ChevronUp | typeof ChevronDown | typeof ArrowUpDown {
    if (this.sortField !== field) return this.ArrowUpDownIcon;
    return this.sortOrder === 'asc' ? this.ChevronUpIcon : this.ChevronDownIcon;
  }

  // Pagination
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.loadBookings();
    }
  }

  onPageSizeChange(): void {
    this.currentPage = 1;
    this.loadBookings();
  }

  getVisiblePages(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;

    let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }

  get startItem(): number {
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get endItem(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalItems);
  }

  // Filters
  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.loadBookings();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = '';
    this.selectedType = '';
    this.selectedMode = '';
    this.dateFrom = '';
    this.dateTo = '';
    this.currentPage = 1;
    this.loadBookings();
  }

  get hasActiveFilters(): boolean {
    return !!(this.selectedStatus || this.selectedType || this.selectedMode || this.dateFrom || this.dateTo);
  }

  // Row expansion
  toggleRowExpansion(bookingId: number): void {
    this.expandedRowId = this.expandedRowId === bookingId ? null : bookingId;
  }

  // Action menu
  toggleActionMenu(bookingId: number, event: Event): void {
    event.stopPropagation();
    this.activeActionMenu = this.activeActionMenu === bookingId ? null : bookingId;
  }

  closeActionMenu(): void {
    this.activeActionMenu = null;
  }

  // View details
  viewDetails(booking: Booking): void {
    this.selectedBooking = booking;
    this.showDetailModal = true;
    this.closeActionMenu();
  }

  closeDetailModal(): void {
    this.showDetailModal = false;
    this.selectedBooking = null;
  }

  // Export
  exportData(): void {
    const params: BookingsQueryParams = {};
    if (this.selectedStatus) params.status = this.selectedStatus;
    if (this.selectedType) params.booking_type = this.selectedType;
    if (this.dateFrom) params.date_from = this.dateFrom;
    if (this.dateTo) params.date_to = this.dateTo;

    this.bookingsService.exportBookings(params).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bookings-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Export failed:', error);
      }
    });
  }

  // Formatting helpers
  formatDate(dateString: string | undefined): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-MY', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  formatTime(dateString: string | undefined): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-MY', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }

  formatDateTime(dateString: string | undefined): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('en-MY', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }

  formatCurrency(amount: number | undefined, currency: string = 'MYR'): string {
    if (amount === undefined) return '-';
    return new Intl.NumberFormat('en-MY', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  // Status helpers
  getStatusConfig(status: string | undefined): { label: string; class: string } {
    const configs: Record<string, { label: string; class: string }> = {
      pending: { label: 'Pending', class: 'status-pending' },
      awaiting_payment: { label: 'Awaiting Payment', class: 'status-awaiting' },
      awaiting_cash_payment: { label: 'Awaiting Cash', class: 'status-awaiting' },
      awaiting_clinical_review: { label: 'Clinical Review', class: 'status-review' },
      confirmed: { label: 'Confirmed', class: 'status-confirmed' },
      completed: { label: 'Completed', class: 'status-completed' },
      cancelled: { label: 'Cancelled', class: 'status-cancelled' },
      no_show: { label: 'No Show', class: 'status-noshow' }
    };
    return configs[status || ''] || { label: status || 'Unknown', class: 'status-default' };
  }

  getPaymentStatusConfig(status: string | undefined): { label: string; class: string } {
    const configs: Record<string, { label: string; class: string }> = {
      not_required: { label: 'Not Required', class: 'payment-neutral' },
      unpaid: { label: 'Unpaid', class: 'payment-unpaid' },
      pending: { label: 'Pending', class: 'payment-pending' },
      paid: { label: 'Paid', class: 'payment-paid' },
      failed: { label: 'Failed', class: 'payment-failed' },
      refunded: { label: 'Refunded', class: 'payment-refunded' }
    };
    return configs[status || ''] || { label: status || 'Unknown', class: 'payment-neutral' };
  }

  getTypeConfig(type: string | undefined): { label: string; icon: typeof Calendar } {
    const configs: Record<string, { label: string; icon: typeof Calendar }> = {
      tour: { label: 'Tour', icon: this.BuildingIcon },
      consultation: { label: 'Consultation', icon: this.UsersIcon },
      centre_session: { label: 'Centre Session', icon: this.BuildingIcon },
      online_session: { label: 'Online Session', icon: this.VideoIcon }
    };
    return configs[type || ''] || { label: type || 'Unknown', icon: this.CalendarIcon };
  }

  getModeConfig(mode: string | undefined): { label: string; icon: typeof MapPin | typeof Video } {
    if (mode === 'online') {
      return { label: 'Online', icon: this.VideoIcon };
    }
    return { label: 'In Centre', icon: this.MapPinIcon };
  }

  getTherapistResponseConfig(response: string | null | undefined): { label: string; class: string } {
    if (response === 'accepted') {
      return { label: 'Accepted', class: 'response-accepted' };
    }
    if (response === 'rejected') {
      return { label: 'Rejected', class: 'response-rejected' };
    }
    return { label: 'Pending', class: 'response-pending' };
  }

  isUpcoming(dateString: string | undefined): boolean {
    if (!dateString) return false;
    const date = new Date(dateString);
    return date >= new Date();
  }

  isToday(dateString: string | undefined): boolean {
    if (!dateString) return false;
    const date = new Date(dateString);
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  getDaysUntil(dateString: string | undefined): number {
    if (!dateString) return 0;
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    const diffTime = date.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getTimeBadgeClass(dateString: string | undefined): string {
    if (!dateString) return 'time-neutral';
    if (this.isToday(dateString)) return 'time-today';
    const days = this.getDaysUntil(dateString);
    if (days < 0) return 'time-past';
    if (days <= 3) return 'time-soon';
    if (days <= 7) return 'time-upcoming';
    return 'time-future';
  }

  getTimeBadgeText(dateString: string | undefined): string {
    if (!dateString) return '-';
    if (this.isToday(dateString)) return 'Today';
    const days = this.getDaysUntil(dateString);
    if (days < 0) return `${Math.abs(days)}d ago`;
    if (days === 1) return 'Tomorrow';
    if (days <= 7) return `In ${days}d`;
    return this.formatDate(dateString);
  }
}
