import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Globe2, Save } from 'lucide-angular';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-admin-landing-content',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, LucideAngularModule],
  templateUrl: './admin-landing-content.component.html',
  styleUrls: ['./admin-landing-content.component.css']
})
export class AdminLandingContentComponent implements OnInit {
  private readonly apiUrl = environment.apiUrl;

  GlobeIcon = Globe2;
  SaveIcon = Save;

  heroFormEn: FormGroup;
  heroFormMy: FormGroup;

  loading = false;
  saving = false;
  saveMessage = '';
  saveError = '';
  heroImageUrl: string | null = null;
  uploadingImage = false;
  imageUploadError = '';

  // Features section (Why choose Bloom Spectrum?)
  features: {
    key: string;
    iconKey: string;
    sortOrder: number;
    enTitle: string;
    enBody: string;
    myTitle: string;
    myBody: string;
  }[] = [];
  featuresLoading = false;
  featuresSaving = false;
  featuresSaveMessage = '';
  featuresSaveError = '';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient
  ) {
    this.heroFormEn = this.fb.group({
      title: [''],
      subtitle: [''],
      body: [''],
      badge: ['']
    });

    this.heroFormMy = this.fb.group({
      title: [''],
      subtitle: [''],
      body: [''],
      badge: ['']
    });
  }

  ngOnInit(): void {
    this.loadHeroContent();
    this.loadFeaturesContent();
  }

  loadHeroContent(): void {
    this.loading = true;
    this.saveMessage = '';
    this.saveError = '';

    this.http
      .get<{ success: boolean; data?: any }>(`${this.apiUrl}/content/admin/landing/hero`)
      .subscribe({
        next: (res) => {
          this.loading = false;
          if (!res.success || !res.data) {
            return;
          }

          const { en, my } = res.data;

          if (en) {
            this.heroFormEn.patchValue({
              title: en.title || '',
              subtitle: en.subtitle || '',
              body: en.body || '',
              badge: en.badge || ''
            });
          }

          if (my) {
            this.heroFormMy.patchValue({
              title: my.title || '',
              subtitle: my.subtitle || '',
              body: my.body || '',
              badge: my.badge || ''
            });
          }

          // Prefer English image URL, fall back to BM
          if (en?.imageUrl) {
            this.heroImageUrl = en.imageUrl;
          } else if (my?.imageUrl) {
            this.heroImageUrl = my.imageUrl;
          } else {
            this.heroImageUrl = null;
          }
        },
        error: (err) => {
          this.loading = false;
          console.error('Failed to load hero content', err);
          this.saveError = 'Failed to load hero content.';
        }
      });
  }

  saveHeroContent(): void {
    this.saving = true;
    this.saveMessage = '';
    this.saveError = '';

    const payload = {
      entries: {
        en: this.heroFormEn.value,
        my: this.heroFormMy.value
      }
    };

    this.http
      .put<{ success: boolean; message?: string }>(`${this.apiUrl}/content/admin/landing/hero`, payload)
      .subscribe({
        next: (res) => {
          this.saving = false;
          if (res.success) {
            this.saveMessage = res.message || 'Hero content saved successfully.';
          } else {
            this.saveError = res.message || 'Failed to save hero content.';
          }
        },
        error: (err) => {
          this.saving = false;
          console.error('Failed to save hero content', err);
          this.saveError = 'Failed to save hero content.';
        }
      });
  }

  loadFeaturesContent(): void {
    this.featuresLoading = true;
    this.featuresSaveMessage = '';
    this.featuresSaveError = '';

    this.http
      .get<{ success: boolean; data?: any }>(`${this.apiUrl}/content/admin/landing/features`)
      .subscribe({
        next: (res) => {
          this.featuresLoading = false;
          if (!res.success || !res.data) {
            return;
          }

          const en = res.data.en || [];
          const my = res.data.my || [];

          this.features = en.map((enItem: any, index: number) => {
            const myItem = my[index] || {};
            return {
              key: enItem.key,
              iconKey: enItem.iconKey,
              sortOrder: typeof enItem.sortOrder === 'number' ? enItem.sortOrder : index,
              enTitle: enItem.title || '',
              enBody: enItem.body || '',
              myTitle: myItem.title || '',
              myBody: myItem.body || ''
            };
          });
        },
        error: (err) => {
          this.featuresLoading = false;
          console.error('Failed to load features content', err);
          this.featuresSaveError = 'Failed to load features content.';
        }
      });
  }

  saveFeaturesContent(): void {
    this.featuresSaving = true;
    this.featuresSaveMessage = '';
    this.featuresSaveError = '';

    const payload = {
      entries: {
        en: this.features.map((f, index) => ({
          key: f.key,
          title: f.enTitle,
          body: f.enBody,
          iconKey: f.iconKey,
          sortOrder: index
        })),
        my: this.features.map((f, index) => ({
          key: f.key,
          title: f.myTitle,
          body: f.myBody,
          iconKey: f.iconKey,
          sortOrder: index
        }))
      }
    };

    this.http
      .put<{ success: boolean; message?: string }>(`${this.apiUrl}/content/admin/landing/features`, payload)
      .subscribe({
        next: (res) => {
          this.featuresSaving = false;
          if (res.success) {
            this.featuresSaveMessage = res.message || 'Features content saved successfully.';
          } else {
            this.featuresSaveError = res.message || 'Failed to save features content.';
          }
        },
        error: (err) => {
          this.featuresSaving = false;
          console.error('Failed to save features content', err);
          this.featuresSaveError = 'Failed to save features content.';
        }
      });
  }

  onHeroImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      return;
    }

    const file = input.files[0];
    const formData = new FormData();
    formData.append('image', file);

    this.uploadingImage = true;
    this.imageUploadError = '';

    this.http
      .post<{ success: boolean; url?: string; message?: string }>(
        `${this.apiUrl}/content/admin/landing/hero-image`,
        formData
      )
      .subscribe({
        next: (res) => {
          this.uploadingImage = false;
          if (res.success && res.url) {
            this.heroImageUrl = res.url;
          } else {
            this.imageUploadError = res.message || 'Failed to upload hero image.';
          }
        },
        error: (err) => {
          this.uploadingImage = false;
          console.error('Failed to upload hero image', err);
          this.imageUploadError = 'Failed to upload hero image.';
        }
      });
  }
}
