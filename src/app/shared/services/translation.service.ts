import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private translations: { [key: string]: any } = {};
  private currentLangSubject = new BehaviorSubject<string>('my'); // Default to Malay
  public currentLang$ = this.currentLangSubject.asObservable();
  private isBrowser: boolean;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.initLanguage();
  }

  private initLanguage(): void {
    let defaultLang = 'my';
    if (this.isBrowser) {
      const savedLang = localStorage.getItem('selectedLanguage');
      defaultLang = savedLang || 'my';
    }
    this.setLanguage(defaultLang);
  }

  setLanguage(lang: string): void {
    // Load translation file
    this.http.get(`/assets/i18n/${lang}.json`).subscribe(
      (translations) => {
        this.translations[lang] = translations;
        this.currentLangSubject.next(lang);
        if (this.isBrowser) {
          localStorage.setItem('selectedLanguage', lang);
        }
      },
      (error) => {
        console.error(`Failed to load translation file for ${lang}`, error);
        // Fallback to Malay if loading fails
        if (lang !== 'my') {
          this.setLanguage('my');
        }
      }
    );
  }

  getCurrentLanguage(): string {
    return this.currentLangSubject.value;
  }

  translate(key: string): string {
    const lang = this.currentLangSubject.value;
    const translations = this.translations[lang];
    
    if (!translations) {
      return key;
    }

    // Navigate through nested keys (e.g., 'header.nav.programmes')
    const keys = key.split('.');
    let value = translations;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key; // Return key if translation not found
      }
    }
    
    return typeof value === 'string' ? value : key;
  }

  // Helper method for reactive translations
  getTranslation(key: string): Observable<string> {
    return new Observable(observer => {
      // Subscribe to language changes
      const subscription = this.currentLang$.subscribe(() => {
        observer.next(this.translate(key));
      });
      
      // Return cleanup function
      return () => subscription.unsubscribe();
    });
  }

  toggleLanguage(): void {
    const currentLang = this.getCurrentLanguage();
    const newLang = currentLang === 'en' ? 'my' : 'en';
    this.setLanguage(newLang);
  }
}
