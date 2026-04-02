import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { LucideAngularModule, Eye, UserPlus, CheckCircle2, X, Mail, Phone, MessageSquare, Search, Filter } from 'lucide-angular';
import { Lead, LeadsService } from '../../../core/services/leads.service';

type StatusFilter = 'all' | 'new' | 'contacted';

@Component({
  selector: 'app-leads',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, DatePipe],
  templateUrl: './leads.component.html',
})
export class LeadsComponent implements OnInit {
  // Icons
  readonly EyeIcon = Eye;
  readonly UserPlusIcon = UserPlus;
  readonly CheckIcon = CheckCircle2;
  readonly XIcon = X;
  readonly MailIcon = Mail;
  readonly PhoneIcon = Phone;
  readonly MessageIcon = MessageSquare;
  readonly SearchIcon = Search;
  readonly FilterIcon = Filter;

  leads: Lead[] = [];
  filteredLeads: Lead[] = [];
  isLoading = true;
  error: string | null = null;

  // Filter state
  activeFilter: StatusFilter = 'all';
  searchQuery = '';

  // Slide-over state
  selectedLead: Lead | null = null;
  showPanel = false;

  // Action loading states
  markingContactedId: number | null = null;
  convertingId: number | null = null;
  actionSuccess: string | null = null;
  actionError: string | null = null;

  constructor(private leadsService: LeadsService) {}

  ngOnInit(): void {
    this.loadLeads();
  }

  loadLeads(): void {
    this.isLoading = true;
    this.error = null;

    this.leadsService.getLeads().subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success && Array.isArray(res.data)) {
          this.leads = res.data;
          this.applyFilters();
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.error = err.error?.message || 'Failed to load leads';
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
    let result = [...this.leads];

    if (this.activeFilter === 'new') {
      result = result.filter(l => !l.is_verified);
    } else if (this.activeFilter === 'contacted') {
      result = result.filter(l => l.is_verified);
    }

    if (this.searchQuery) {
      result = result.filter(l =>
        l.respondent_name.toLowerCase().includes(this.searchQuery) ||
        l.respondent_email.toLowerCase().includes(this.searchQuery) ||
        l.respondent_phone?.toLowerCase().includes(this.searchQuery)
      );
    }

    this.filteredLeads = result;
  }

  // Slide-over
  openPanel(lead: Lead): void {
    this.selectedLead = lead;
    this.showPanel = true;
    this.actionSuccess = null;
    this.actionError = null;
  }

  closePanel(): void {
    this.showPanel = false;
    setTimeout(() => { this.selectedLead = null; }, 300);
  }

  // Actions
  markContacted(lead: Lead): void {
    this.markingContactedId = lead.id;
    this.actionError = null;

    this.leadsService.markContacted(lead.id).subscribe({
      next: (res) => {
        this.markingContactedId = null;
        if (res.success) {
          lead.is_verified = true;
          this.actionSuccess = 'Lead marked as contacted';
          this.applyFilters();
          setTimeout(() => { this.actionSuccess = null; }, 3000);
        }
      },
      error: (err) => {
        this.markingContactedId = null;
        this.actionError = err.error?.message || 'Failed to mark as contacted';
        setTimeout(() => { this.actionError = null; }, 4000);
      }
    });
  }

  convertToParent(lead: Lead): void {
    this.convertingId = lead.id;
    this.actionError = null;

    this.leadsService.convertToParent(lead.id).subscribe({
      next: (res) => {
        this.convertingId = null;
        if (res.success) {
          lead.is_verified = true;
          this.actionSuccess = `${lead.respondent_name} converted to parent account`;
          this.applyFilters();
          setTimeout(() => { this.actionSuccess = null; }, 4000);
        }
      },
      error: (err) => {
        this.convertingId = null;
        this.actionError = err.error?.message || 'Failed to convert lead';
        setTimeout(() => { this.actionError = null; }, 4000);
      }
    });
  }

  truncate(text: string, max = 50): string {
    if (!text) return '';
    return text.length > max ? text.substring(0, max) + '…' : text;
  }

  get countNew(): number {
    return this.leads.filter(l => !l.is_verified).length;
  }

  get countContacted(): number {
    return this.leads.filter(l => l.is_verified).length;
  }
}
