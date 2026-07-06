import { Pipe, PipeTransform } from '@angular/core';

// ─────────────────────────────────────────────────────────────────────────────
// Phase 9 — friendly, parent-facing status labels.
// Maps raw backend booking/payment/lifecycle codes to calm, human wording, and a
// "tone" class (status-success / status-pending / status-active / status-danger /
// status-neutral — defined in styles.scss) so meaning is never colour-only.
// Source of truth for the raw codes: bookings.status / bookings.payment_status /
// cancellation_status / reschedule_status (see BLOOMSPECTRUM_PAYMENT_STATE_MACHINE.md).
// ─────────────────────────────────────────────────────────────────────────────

type Tone = 'status-success' | 'status-pending' | 'status-active' | 'status-danger' | 'status-neutral';

const LABELS: Record<string, string> = {
  // booking.status
  pending: 'Booking received',
  awaiting_payment: 'Awaiting payment',
  awaiting_cash_payment: 'Waiting for payment',
  awaiting_clinical_review: 'Being reviewed by our team',
  confirmed: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled',
  no_show: 'Missed session',
  // booking.payment_status / payments.status
  not_required: 'No payment needed',
  unpaid: 'Unpaid',
  paid: 'Payment received',
  succeeded: 'Paid',
  processing: 'Processing',
  failed: 'Payment unsuccessful',
  refunded: 'Refunded',
  // lifecycle (cancellation_status / reschedule_status), prefixed at call site if needed
  requested: 'Request submitted',
  approved: 'Approved',
  rejected: 'Not approved',
};

const TONES: Record<string, Tone> = {
  pending: 'status-pending',
  awaiting_payment: 'status-pending',
  awaiting_cash_payment: 'status-pending',
  awaiting_clinical_review: 'status-active',
  confirmed: 'status-success',
  completed: 'status-success',
  cancelled: 'status-danger',
  no_show: 'status-danger',
  not_required: 'status-neutral',
  unpaid: 'status-pending',
  paid: 'status-success',
  succeeded: 'status-success',
  processing: 'status-pending',
  failed: 'status-danger',
  refunded: 'status-neutral',
  requested: 'status-pending',
  approved: 'status-success',
  rejected: 'status-danger',
};

function normalize(value: unknown): string {
  return String(value ?? '').trim().toLowerCase();
}

function humanize(value: string): string {
  return value.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

@Pipe({ name: 'statusLabel', standalone: true, pure: true })
export class StatusLabelPipe implements PipeTransform {
  transform(value: unknown): string {
    const key = normalize(value);
    if (!key) return '—';
    return LABELS[key] || humanize(key);
  }
}

@Pipe({ name: 'statusTone', standalone: true, pure: true })
export class StatusTonePipe implements PipeTransform {
  transform(value: unknown): Tone {
    return TONES[normalize(value)] || 'status-neutral';
  }
}
