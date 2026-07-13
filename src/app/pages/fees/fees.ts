import { Component, DestroyRef, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LucideAngularModule, AlertCircle } from 'lucide-angular';
import { Observable, Subscription, forkJoin, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { HeaderComponent } from '../../shared/header/header';
import { FooterComponent } from '../../shared/footer/footer';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { TranslationService } from '../../shared/services/translation.service';
import { BookingService } from '../../core/services/booking.service';
import { BookingType, BookingTypePrice } from '../../shared/models/booking-type.model';

type SessionMode = 'in_centre' | 'online';
type PageState = 'loading' | 'error' | 'empty' | 'loaded';

interface FeePrice {
  mode: SessionMode;
  price: number;
  currency: string;
}

interface FeeRow {
  code: string;
  /** Name from the API — fallback when no fees.services.<code> translation exists. */
  apiName: string;
  durationMin: number;
  modes: SessionMode[];
  paymentRequired: boolean;
  /** Successfully fetched prices (one per mode). */
  prices: FeePrice[];
  /** Lowest fetched price; null when payment is required but no price loaded. */
  minPrice: number | null;
  currency: string;
  /** True when fetched prices differ → show the "From" prefix + breakdown. */
  showFrom: boolean;
  isTour: boolean;
}

@Component({
  selector: 'app-fees',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LucideAngularModule,
    HeaderComponent,
    FooterComponent,
    TranslatePipe,
  ],
  templateUrl: './fees.html',
  styleUrl: './fees.scss',
})
export class Fees implements OnInit {
  readonly AlertCircleIcon = AlertCircle;

  state: PageState = 'loading';
  rows: FeeRow[] = [];

  /** Placeholder items for the loading skeleton. */
  readonly skeletonItems = [0, 1, 2];

  private readonly isBrowser: boolean;
  private loadSub?: Subscription;

  constructor(
    private bookingService: BookingService,
    private translationService: TranslationService,
    private destroyRef: DestroyRef,
    @Inject(PLATFORM_ID) platformId: Object,
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    // Fees load on the client only — the prerendered (SSR) page shows the
    // loading skeleton, and no HTTP call is attempted on the server.
    if (this.isBrowser) {
      this.load();
    }
  }

  load(): void {
    this.loadSub?.unsubscribe(); // Retry cancels any in-flight load first.
    this.state = 'loading';

    this.loadSub = this.bookingService
      .getBookingTypes()
      .pipe(
        switchMap(res => {
          const types = res?.data ?? [];
          return this.loadPrices(types).pipe(map(prices => ({ types, prices })));
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: ({ types, prices }) => {
          this.rows = types.map(type => this.buildRow(type, prices));
          this.state = this.rows.length ? 'loaded' : 'empty';
        },
        error: () => {
          this.rows = [];
          this.state = 'error';
        },
      });
  }

  /**
   * Display name for a service: prefer the fees.services.<code> translation;
   * TranslationService.translate() returns the raw key when it is missing,
   * in which case we fall back to the API-provided name.
   */
  serviceName(row: FeeRow): string {
    const key = `fees.services.${row.code}`;
    const translated = this.translationService.translate(key);
    return translated === key ? row.apiName : translated;
  }

  modeLabelKey(mode: SessionMode): string {
    return mode === 'in_centre' ? 'fees.inCentre' : 'fees.online';
  }

  trackByCode(_index: number, row: FeeRow): string {
    return row.code;
  }

  /**
   * Fetch prices for every paid type/mode combination ('both' → in_centre AND
   * online, via forkJoin). Free services never charge, so no price is fetched
   * for them (deliberate — a stale pricing row must not surface here).
   * An individual price failure resolves to null (that row falls back to a
   * "contact us" link) instead of failing the whole page.
   */
  private loadPrices(
    types: BookingType[],
  ): Observable<Record<string, BookingTypePrice | null>> {
    const requests: Record<string, Observable<BookingTypePrice | null>> = {};

    for (const type of types) {
      if (!type.payment_required) continue;
      for (const mode of this.modesOf(type)) {
        requests[this.priceKey(type.code, mode)] = this.bookingService
          .getBookingTypePrice(type.code, mode, type.default_duration_min)
          .pipe(
            map(res => res?.data ?? null),
            catchError(() => of(null)),
          );
      }
    }

    // forkJoin on an empty map completes without emitting — short-circuit.
    return Object.keys(requests).length
      ? forkJoin(requests)
      : of({} as Record<string, BookingTypePrice | null>);
  }

  private modesOf(type: BookingType): SessionMode[] {
    return type.allowed_mode === 'both' ? ['in_centre', 'online'] : [type.allowed_mode];
  }

  private priceKey(code: string, mode: SessionMode): string {
    return `${code}|${mode}`;
  }

  private buildRow(
    type: BookingType,
    priceMap: Record<string, BookingTypePrice | null>,
  ): FeeRow {
    const modes = this.modesOf(type);
    const prices: FeePrice[] = [];

    if (type.payment_required) {
      for (const mode of modes) {
        const result = priceMap[this.priceKey(type.code, mode)];
        // Postgres numerics can arrive as strings — coerce before comparing.
        const value = result ? Number(result.price) : NaN;
        if (result && Number.isFinite(value)) {
          prices.push({ mode, price: value, currency: result.currency });
        }
      }
    }

    const values = prices.map(p => p.price);
    return {
      code: type.code,
      apiName: type.name,
      durationMin: type.default_duration_min,
      modes,
      paymentRequired: type.payment_required,
      prices,
      minPrice: values.length ? Math.min(...values) : null,
      currency: prices[0]?.currency ?? 'MYR',
      showFrom: values.length > 1 && values.some(v => v !== values[0]),
      isTour: type.code === 'tour',
    };
  }
}
