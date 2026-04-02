import { Injectable, computed, signal } from '@angular/core';
import { User } from '../../shared/models/user.model';
import { Notification } from '../services/socket.service';

// ──────────────────────────────────────────────
// AppState – the single source of truth for all
// global, cross-cutting application state.
// ──────────────────────────────────────────────

export interface AppState {
  /** The currently authenticated user (null when logged-out) */
  user: User | null;
  /** Shorthand role accessor kept in sync with `user` */
  role: User['role'] | null;
  /** Whether we have a valid auth session */
  isAuthenticated: boolean;
  /** Whether the parent profile is complete */
  profileComplete: boolean;
  /** In-app notification list (newest-first) */
  notifications: Notification[];
  /** Unread notification badge count */
  unreadNotificationCount: number;
  /** Real-time socket connection status */
  socketConnected: boolean;
  /** Whether the initial auth check has resolved */
  authInitialised: boolean;
}

const INITIAL_STATE: AppState = {
  user: null,
  role: null,
  isAuthenticated: false,
  profileComplete: true,
  notifications: [],
  unreadNotificationCount: 0,
  socketConnected: false,
  authInitialised: false,
};

@Injectable({ providedIn: 'root' })
export class AppStore {

  // ── Private writable signals ───────────────────────
  private readonly _user              = signal<User | null>(INITIAL_STATE.user);
  private readonly _isAuthenticated   = signal<boolean>(INITIAL_STATE.isAuthenticated);
  private readonly _profileComplete   = signal<boolean>(INITIAL_STATE.profileComplete);
  private readonly _notifications     = signal<Notification[]>(INITIAL_STATE.notifications);
  private readonly _socketConnected   = signal<boolean>(INITIAL_STATE.socketConnected);
  private readonly _authInitialised   = signal<boolean>(INITIAL_STATE.authInitialised);

  // ── Public read-only selectors ─────────────────────
  /** Current authenticated user */
  readonly user              = this._user.asReadonly();

  /** Current user role (derived) */
  readonly role              = computed(() => this._user()?.role ?? null);

  /** Is the user authenticated? */
  readonly isAuthenticated   = this._isAuthenticated.asReadonly();

  /** Is the parent profile complete? */
  readonly profileComplete   = this._profileComplete.asReadonly();

  /** All in-app notifications */
  readonly notifications     = this._notifications.asReadonly();

  /** Unread notification badge count (derived) */
  readonly unreadNotificationCount = computed(
    () => this._notifications().filter(n => !n.read).length
  );

  /** Socket connection status */
  readonly socketConnected   = this._socketConnected.asReadonly();

  /** Whether the initial auth bootstrap has completed */
  readonly authInitialised   = this._authInitialised.asReadonly();

  /** Convenience: user display name */
  readonly userName = computed(() => this._user()?.name ?? '');

  /** Convenience: user email */
  readonly userEmail = computed(() => this._user()?.email ?? '');

  // ── Mutations (commands) ───────────────────────────

  /**
   * Set the authenticated user and derive all dependent state.
   * Call after login, register, or session restore.
   */
  setUser(user: User): void {
    this._user.set(user);
    this._isAuthenticated.set(true);
    this._profileComplete.set(user.profileComplete ?? true);
  }

  /**
   * Partially update the current user object (e.g. after a profile edit).
   */
  patchUser(partial: Partial<User>): void {
    const current = this._user();
    if (!current) return;
    const updated = { ...current, ...partial };
    this._user.set(updated);
    if (partial.profileComplete !== undefined) {
      this._profileComplete.set(partial.profileComplete);
    }
  }

  /**
   * Clear all auth-related state (logout).
   */
  clearUser(): void {
    this._user.set(null);
    this._isAuthenticated.set(false);
    this._profileComplete.set(true);
    this._notifications.set([]);
  }

  /**
   * Mark the initial auth bootstrap as completed.
   */
  setAuthInitialised(): void {
    this._authInitialised.set(true);
  }

  // ── Notification mutations ─────────────────────────

  /**
   * Prepend a new notification.
   */
  addNotification(notification: Notification): void {
    this._notifications.update(list => [notification, ...list]);
  }

  /**
   * Replace the full notification list (e.g. on initial fetch from API).
   */
  setNotifications(notifications: Notification[]): void {
    this._notifications.set(notifications);
  }

  /**
   * Mark a single notification as read.
   */
  markNotificationRead(notificationId: string): void {
    this._notifications.update(list =>
      list.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  }

  /**
   * Mark every notification as read.
   */
  markAllNotificationsRead(): void {
    this._notifications.update(list =>
      list.map(n => ({ ...n, read: true }))
    );
  }

  // ── Socket status ──────────────────────────────────

  setSocketConnected(connected: boolean): void {
    this._socketConnected.set(connected);
  }

  // ── Snapshot (debugging / devtools) ────────────────

  /** Return a plain-object snapshot of the entire state tree. */
  snapshot(): AppState {
    return {
      user: this._user(),
      role: this.role(),
      isAuthenticated: this._isAuthenticated(),
      profileComplete: this._profileComplete(),
      notifications: this._notifications(),
      unreadNotificationCount: this.unreadNotificationCount(),
      socketConnected: this._socketConnected(),
      authInitialised: this._authInitialised(),
    };
  }
}
