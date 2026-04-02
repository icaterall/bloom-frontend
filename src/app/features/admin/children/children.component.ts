import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import {
  LucideAngularModule, Search, Eye, X, User, Phone, Mail,
  FileText, Activity, ChevronRight, Baby
} from 'lucide-angular';
import {
  ChildListItem, ChildFullProfile, ClinicalUpdate,
  ChildrenService
} from '../../../core/services/children.service';

type ProfileTab = 'demographics' | 'clinical';

@Component({
  selector: 'app-admin-children',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, DatePipe],
  templateUrl: './children.component.html',
})
export class AdminChildrenComponent implements OnInit {
  // Icons
  readonly SearchIcon = Search;
  readonly EyeIcon = Eye;
  readonly XIcon = X;
  readonly UserIcon = User;
  readonly PhoneIcon = Phone;
  readonly MailIcon = Mail;
  readonly FileTextIcon = FileText;
  readonly ActivityIcon = Activity;
  readonly ChevronRightIcon = ChevronRight;
  readonly BabyIcon = Baby;

  // List state
  children: ChildListItem[] = [];
  isLoading = true;
  error: string | null = null;
  searchQuery = '';

  // Slide-over state
  showPanel = false;
  profileLoading = false;
  profile: ChildFullProfile | null = null;
  activeTab: ProfileTab = 'demographics';

  constructor(private childrenService: ChildrenService) {}

  ngOnInit(): void {
    this.loadChildren();
  }

  loadChildren(): void {
    this.isLoading = true;
    this.error = null;

    this.childrenService.getChildren(1, 200, this.searchQuery).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success) {
          this.children = res.data;
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.error = err.error?.message || 'Failed to load children';
      }
    });
  }

  onSearch(event: Event): void {
    this.searchQuery = (event.target as HTMLInputElement).value;
    this.loadChildren();
  }

  // ── Age calculation ──
  calcAge(dob: string): string {
    if (!dob) return '–';
    const birth = new Date(dob);
    const now = new Date();
    let years = now.getFullYear() - birth.getFullYear();
    let months = now.getMonth() - birth.getMonth();
    if (months < 0) { years--; months += 12; }
    if (years > 0) return `${years}y ${months}m`;
    return `${months}m`;
  }

  // ── Diagnosis badge helpers ──
  diagnosisBadgeClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'diagnosed':
      case 'autism':
      case 'adhd':        return 'bg-blue-50 text-blue-700';
      case 'in_progress': return 'bg-amber-50 text-amber-700';
      case 'suspected':   return 'bg-orange-50 text-orange-700';
      default:            return 'bg-slate-100 text-slate-500';
    }
  }

  diagnosisLabel(status: string): string {
    if (!status) return 'Unknown';
    return status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }

  // ── Clinical status badge ──
  clinicalStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'improving':       return 'bg-emerald-50 text-emerald-700';
      case 'progressing':     return 'bg-blue-50 text-blue-700';
      case 'stable':          return 'bg-slate-100 text-slate-600';
      case 'needs_attention': return 'bg-red-50 text-red-700';
      default:                return 'bg-slate-100 text-slate-500';
    }
  }

  clinicalStatusLabel(status: string): string {
    return (status || 'unknown').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }

  // ── Slide-over ──
  openProfile(child: ChildListItem): void {
    this.showPanel = true;
    this.activeTab = 'demographics';
    this.profile = null;
    this.profileLoading = true;

    this.childrenService.getChildProfile(child.id).subscribe({
      next: (res) => {
        this.profileLoading = false;
        if (res.success) {
          this.profile = res.data;
        }
      },
      error: () => {
        this.profileLoading = false;
      }
    });
  }

  closePanel(): void {
    this.showPanel = false;
    setTimeout(() => { this.profile = null; }, 300);
  }

  setTab(tab: ProfileTab): void {
    this.activeTab = tab;
  }
}
