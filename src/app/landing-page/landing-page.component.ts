import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, CheckCircle, Users, BookOpen, Heart, Calendar, Download, ArrowRight, Play, Star, Clock, Target, Quote } from 'lucide-angular';
import { HeaderComponent } from '../shared/header/header';
import { FooterComponent } from '../shared/footer/footer';
import { TranslatePipe } from '../shared/pipes/translate.pipe';
import { TranslationService } from '../shared/services/translation.service';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, HeaderComponent, FooterComponent, TranslatePipe],
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss']
})
export class LandingPageComponent {
  constructor(
    public translationService: TranslationService
  ) {}

  readonly CheckCircleIcon = CheckCircle;
  readonly UsersIcon = Users;
  readonly BookOpenIcon = BookOpen;
  readonly HeartIcon = Heart;
  readonly CalendarIcon = Calendar;
  readonly DownloadIcon = Download;
  readonly ArrowRightIcon = ArrowRight;
  readonly PlayIcon = Play;
  readonly StarIcon = Star;
  readonly ClockIcon = Clock;
  readonly TargetIcon = Target;
  readonly QuoteIcon = Quote;

  // Dynamic content from backend (with initial static fallbacks)
  heroContent: any | null = null;

  // All visible copy lives in assets/i18n/{en,my}.json (Phase 10 — the BM page
  // previously showed hardcoded English). Arrays hold translation KEYS, piped
  // through | translate in the template.
  programmes = [
    {
      titleKey: 'landing.programmes.earlyIntervention.title',
      ageRangeKey: 'landing.programmes.earlyIntervention.ageRange',
      descriptionKey: 'landing.programmes.earlyIntervention.description',
      featureKeys: [
        'landing.programmes.earlyIntervention.features.feature1',
        'landing.programmes.earlyIntervention.features.feature2',
        'landing.programmes.earlyIntervention.features.feature3',
      ],
      icon: this.HeartIcon,
      color: 'bg-primary'
    },
    {
      titleKey: 'landing.programmes.schoolReadiness.title',
      ageRangeKey: 'landing.programmes.schoolReadiness.ageRange',
      descriptionKey: 'landing.programmes.schoolReadiness.description',
      featureKeys: [
        'landing.programmes.schoolReadiness.features.feature1',
        'landing.programmes.schoolReadiness.features.feature2',
        'landing.programmes.schoolReadiness.features.feature3',
      ],
      icon: this.BookOpenIcon,
      color: 'bg-secondary'
    },
    {
      titleKey: 'landing.programmes.parentCoaching.title',
      ageRangeKey: 'landing.programmes.parentCoaching.ageRange',
      descriptionKey: 'landing.programmes.parentCoaching.description',
      featureKeys: [
        'landing.programmes.parentCoaching.features.feature1',
        'landing.programmes.parentCoaching.features.feature2',
        'landing.programmes.parentCoaching.features.feature3',
      ],
      icon: this.UsersIcon,
      color: 'bg-accent'
    }
  ];

  features = [
    { titleKey: 'landing.features.evidence.title', descriptionKey: 'landing.features.evidence.description', icon: this.CheckCircleIcon },
    { titleKey: 'landing.features.ratio.title', descriptionKey: 'landing.features.ratio.description', icon: this.UsersIcon },
    { titleKey: 'landing.features.parent.title', descriptionKey: 'landing.features.parent.description', icon: this.HeartIcon },
    { titleKey: 'landing.features.individual.title', descriptionKey: 'landing.features.individual.description', icon: this.TargetIcon },
    { titleKey: 'landing.features.progress.title', descriptionKey: 'landing.features.progress.description', icon: this.ClockIcon },
    { titleKey: 'landing.features.team.title', descriptionKey: 'landing.features.team.description', icon: this.StarIcon }
  ];

  // Professional comments / expert opinions (the centre is not yet operational,
  // so these are NOT parent testimonials). Names stay as data (identical in
  // both languages); roles and quotes are translated.
  expertOpinions = [
    { name: 'DR NF', roleKey: 'landing.experts.expert1.role', contentKey: 'landing.experts.expert1.content' },
    { name: 'Dr RY', roleKey: '', contentKey: 'landing.experts.expert2.content' },
    { name: 'FC', roleKey: 'landing.experts.expert3.role', contentKey: 'landing.experts.expert3.content' }
  ];

  // Who we support — calm, non-diagnostic chips.
  whoWeSupport = [
    'landing.whoWeSupport.item1',
    'landing.whoWeSupport.item2',
    'landing.whoWeSupport.item3',
    'landing.whoWeSupport.item4',
    'landing.whoWeSupport.item5',
    'landing.whoWeSupport.item6',
    'landing.whoWeSupport.item7',
  ];

  // How booking works — simple, reassuring 4-step flow.
  bookingSteps = [
    { titleKey: 'landing.bookingSteps.step1.title', detailKey: 'landing.bookingSteps.step1.detail' },
    { titleKey: 'landing.bookingSteps.step2.title', detailKey: 'landing.bookingSteps.step2.detail' },
    { titleKey: 'landing.bookingSteps.step3.title', detailKey: 'landing.bookingSteps.step3.detail' },
    { titleKey: 'landing.bookingSteps.step4.title', detailKey: 'landing.bookingSteps.step4.detail' },
  ];

}
