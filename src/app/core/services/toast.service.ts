import { Injectable, inject } from '@angular/core';
import { ToastrService, IndividualConfig } from 'ngx-toastr';

// ──────────────────────────────────────────────
// Toast Notification Service
// Wraps ngx-toastr so every part of the app uses
// a single, consistent notification API.
// ──────────────────────────────────────────────

export type ToastType = 'success' | 'error' | 'warning' | 'info';

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly toastr = inject(ToastrService);

  // ── Public API (same signatures as before) ────

  success(title: string, message = '', duration = 5000): void {
    this.toastr.success(message, title, this.buildConfig(duration));
  }

  error(title: string, message = '', duration = 8000): void {
    this.toastr.error(message, title, this.buildConfig(duration));
  }

  warning(title: string, message = '', duration = 6000): void {
    this.toastr.warning(message, title, this.buildConfig(duration));
  }

  info(title: string, message = '', duration = 5000): void {
    this.toastr.info(message, title, this.buildConfig(duration));
  }

  /** Show a toast by type (handy for socket-driven notifications). */
  show(type: ToastType, title: string, message = '', duration = 5000): void {
    switch (type) {
      case 'success': this.success(title, message, duration); break;
      case 'error':   this.error(title, message, duration);   break;
      case 'warning': this.warning(title, message, duration); break;
      case 'info':    this.info(title, message, duration);    break;
    }
  }

  /** Remove all active toasts. */
  clear(): void {
    this.toastr.clear();
  }

  // ── Internal ──────────────────────────────────

  private buildConfig(timeOut: number): Partial<IndividualConfig> {
    return {
      timeOut: timeOut === 0 ? 0 : timeOut,
      disableTimeOut: timeOut === 0,    // sticky when 0
      progressBar: timeOut > 0,
      closeButton: true,
    };
  }
}
