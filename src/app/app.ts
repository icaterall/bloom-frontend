import { Component, signal, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { TranslationService } from './shared/services/translation.service';
import { routeFadeAnimation } from './shared/animations';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  animations: [routeFadeAnimation],
  template: `
    <!-- Route animation wrapper -->
    <div [@routeAnimation]="getRouteAnimationData(outlet)">
      <router-outlet #outlet="outlet" />
    </div>

    <!-- ngx-toastr renders its own overlay container automatically -->
  `,
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('Bloom Spectrum Centre');

  private authService = inject(AuthService);
  private translationService = inject(TranslationService);

  constructor() {
    // Sync user language preference
    this.authService.currentUser$.subscribe(user => {
      if (user && user.preferred_language) {
        const currentLang = this.translationService.getCurrentLanguage();
        if (currentLang !== user.preferred_language) {
          this.translationService.setLanguage(user.preferred_language);
        }
      }
    });
  }

  /**
   * Returns a unique value per activated route so the animation
   * trigger fires on every navigation.
   */
  getRouteAnimationData(outlet: RouterOutlet): string {
    if (!outlet?.isActivated) return '';
    return outlet.activatedRouteData?.['title'] ?? outlet.activatedRoute?.routeConfig?.path ?? '';
  }
}
