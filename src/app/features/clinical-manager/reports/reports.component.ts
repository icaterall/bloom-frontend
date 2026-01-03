import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, TrendingUp, Calendar, DollarSign, Users, Baby, Clock, BarChart3, PieChart, Activity, Download, Filter } from 'lucide-angular';
import { ClinicalManagerReportsService, ReportsData } from '../../../core/services/clinical-manager-reports.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule
  ],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit {
  reports: ReportsData | null = null;
  isLoading = false;
  error: string | null = null;
  
  // Date filters
  startDate: string = '';
  endDate: string = '';
  showDateFilter = false;
  
  // Icons
  readonly TrendingUpIcon = TrendingUp;
  readonly CalendarIcon = Calendar;
  readonly DollarSignIcon = DollarSign;
  readonly UsersIcon = Users;
  readonly BabyIcon = Baby;
  readonly ClockIcon = Clock;
  readonly BarChart3Icon = BarChart3;
  readonly PieChartIcon = PieChart;
  readonly ActivityIcon = Activity;
  readonly DownloadIcon = Download;
  readonly FilterIcon = Filter;

  constructor(
    private reportsService: ClinicalManagerReportsService
  ) {
    // Set default date range (last 30 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    
    this.endDate = endDate.toISOString().split('T')[0];
    this.startDate = startDate.toISOString().split('T')[0];
  }

  ngOnInit(): void {
    this.loadReports();
  }

  loadReports(): void {
    this.isLoading = true;
    this.error = null;
    
    this.reportsService.getReports(this.startDate, this.endDate).subscribe({
      next: (response) => {
        if (response.success) {
          this.reports = response.data;
        } else {
          this.error = 'Failed to load reports';
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading reports:', error);
        this.error = error.error?.message || 'Error loading reports. Please try again.';
        this.isLoading = false;
      }
    });
  }

  applyDateFilter(): void {
    if (this.startDate && this.endDate) {
      const start = new Date(this.startDate);
      const end = new Date(this.endDate);
      
      if (start > end) {
        alert('Start date must be before end date');
        return;
      }
      
      this.loadReports();
      this.showDateFilter = false;
    }
  }

  resetDateFilter(): void {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    
    this.endDate = endDate.toISOString().split('T')[0];
    this.startDate = startDate.toISOString().split('T')[0];
    this.loadReports();
    this.showDateFilter = false;
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-MY', {
      style: 'currency',
      currency: 'MYR',
      minimumFractionDigits: 2
    }).format(amount);
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  formatMonth(monthString: string | undefined): string {
    if (!monthString) return 'N/A';
    const date = new Date(monthString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short'
    });
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'confirmed': 'bg-blue-100 text-blue-800',
      'completed': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800',
      'no_show': 'bg-gray-100 text-gray-800',
      'awaiting_clinical_review': 'bg-yellow-100 text-yellow-800',
      'pending': 'bg-orange-100 text-orange-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }

  exportReports(): void {
    // TODO: Implement export functionality
    alert('Export functionality coming soon!');
  }

  parseFloat(value: string): number {
    return parseFloat(value);
  }
}

