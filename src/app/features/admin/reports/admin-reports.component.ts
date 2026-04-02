import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import {
  LucideAngularModule, DollarSign, TrendingUp, Clock, Users,
  Shield, ChevronLeft, ChevronRight
} from 'lucide-angular';
import {
  ReportsService, FinanceResponse, ClinicalResponse, AuditLog
} from '../../../core/services/reports.service';

type Tab = 'finance' | 'clinical' | 'audit';

@Component({
  selector: 'app-admin-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, BaseChartDirective, DatePipe, TitleCasePipe],
  templateUrl: './admin-reports.component.html',
})
export class AdminReportsComponent implements OnInit {
  readonly DollarIcon = DollarSign;
  readonly TrendIcon = TrendingUp;
  readonly ClockIcon = Clock;
  readonly UsersIcon = Users;
  readonly ShieldIcon = Shield;
  readonly ChevronLeftIcon = ChevronLeft;
  readonly ChevronRightIcon = ChevronRight;

  activeTab: Tab = 'finance';

  // ── Finance ──
  financeLoading = false;
  financeKpis = { totalRevenue: 0, revenueThisMonth: 0, pendingRevenue: 0, transactions: 0 };

  trendChartData: ChartConfiguration<'bar'>['data'] = { labels: [], datasets: [] };
  trendChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, ticks: { callback: (v) => 'RM ' + v } },
      x: { grid: { display: false } }
    }
  };

  methodChartData: ChartConfiguration<'doughnut'>['data'] = { labels: [], datasets: [] };
  methodChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { padding: 16, usePointStyle: true } }
    }
  };

  // ── Clinical ──
  clinicalLoading = false;
  clinicalLoaded = false;
  clinicalKpis = { totalSessions: 0, completed: 0, noShow: 0, cancelled: 0, noShowRate: 0, hoursDelivered: 0 };
  statusBreakdown: { status: string; count: number }[] = [];
  therapists: any[] = [];
  clinicalStart = '';
  clinicalEnd = '';

  // ── Audit ──
  auditLoading = false;
  auditLogs: AuditLog[] = [];
  auditPage = 1;
  auditTotalPages = 1;
  auditTotalRows = 0;
  auditStartDate = '';
  auditEndDate = '';
  auditRole = '';
  auditActionType = '';

  constructor(private reportsService: ReportsService) {}

  ngOnInit(): void {
    const now = new Date();
    this.clinicalStart = `${now.getFullYear()}-01-01`;
    this.clinicalEnd = now.toISOString().slice(0, 10);
    this.loadFinance();
  }

  setTab(tab: Tab): void {
    this.activeTab = tab;
    if (tab === 'finance' && !this.financeKpis.transactions) this.loadFinance();
    if (tab === 'clinical' && !this.clinicalLoaded) this.loadClinical();
    if (tab === 'audit' && this.auditLogs.length === 0) this.loadAudit();
  }

  // ══════════════ FINANCE ══════════════
  loadFinance(): void {
    this.financeLoading = true;
    this.reportsService.getFinance().subscribe({
      next: (res) => {
        this.financeLoading = false;
        this.financeKpis = res.kpis;

        this.trendChartData = {
          labels: res.charts.trendLabels,
          datasets: [{
            data: res.charts.trendData,
            label: 'Revenue (RM)',
            backgroundColor: '#2663eb',
            borderRadius: 4,
            barThickness: 28,
          }]
        };

        this.methodChartData = {
          labels: res.charts.methodLabels,
          datasets: [{
            data: res.charts.methodData,
            backgroundColor: ['#2663eb', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444'],
            borderWidth: 0,
          }]
        };
      },
      error: () => { this.financeLoading = false; }
    });
  }

  // ══════════════ CLINICAL ══════════════
  loadClinical(): void {
    if (!this.clinicalStart || !this.clinicalEnd) return;
    this.clinicalLoading = true;
    this.reportsService.getClinical(this.clinicalStart, this.clinicalEnd).subscribe({
      next: (res) => {
        this.clinicalLoading = false;
        this.clinicalLoaded = true;
        this.clinicalKpis = res.kpis;
        this.statusBreakdown = res.statusBreakdown;
        this.therapists = res.therapists;
      },
      error: () => { this.clinicalLoading = false; }
    });
  }

  // ══════════════ AUDIT ══════════════
  loadAudit(): void {
    this.auditLoading = true;
    this.reportsService.getAudit({
      page: this.auditPage, limit: 20,
      start_date: this.auditStartDate || undefined,
      end_date: this.auditEndDate || undefined,
      user_role: this.auditRole || undefined,
      action_type: this.auditActionType || undefined,
    }).subscribe({
      next: (res) => {
        this.auditLoading = false;
        this.auditLogs = res.logs;
        this.auditTotalPages = res.pagination.totalPages;
        this.auditTotalRows = res.pagination.totalRows;
      },
      error: () => { this.auditLoading = false; }
    });
  }

  applyAuditFilters(): void { this.auditPage = 1; this.loadAudit(); }
  auditPrev(): void { if (this.auditPage > 1) { this.auditPage--; this.loadAudit(); } }
  auditNext(): void { if (this.auditPage < this.auditTotalPages) { this.auditPage++; this.loadAudit(); } }

  // ── Helpers ──
  roleBadgeClass(role: string): string {
    switch (role) {
      case 'admin':            return 'bg-purple-50 text-purple-700';
      case 'parent':           return 'bg-blue-50 text-blue-700';
      case 'therapist':        return 'bg-emerald-50 text-emerald-700';
      case 'clinical_manager': return 'bg-indigo-50 text-indigo-700';
      case 'finance':          return 'bg-amber-50 text-amber-700';
      default:                 return 'bg-slate-100 text-slate-500';
    }
  }

  fmt(val: number): string {
    return 'RM ' + (val || 0).toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
}
