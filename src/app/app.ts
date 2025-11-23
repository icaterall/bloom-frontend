import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { TranslationService } from './shared/services/translation.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('Bloom Spectrum Centre');

  constructor(
    private authService: AuthService,
    private translationService: TranslationService
  ) {
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
}
