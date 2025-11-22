import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, CheckCircle, Users, BookOpen, Heart, Calendar, Download, ArrowRight, Play, Star, Clock, Target } from 'lucide-angular';
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

  // Dynamic content from backend (with initial static fallbacks)
  heroContent: any | null = null;

  programmes = [
    {
      title: 'Early Intervention',
      ageRange: '3-8 years',
      description: 'Evidence-based intervention using PRT, EMT, and JASPER methodologies',
      features: ['Individual plans', '1:1 to 1:3 ratio', 'Parent coaching'],
      icon: this.HeartIcon,
      color: 'bg-primary'
    },
    {
      title: 'School Readiness',
      ageRange: '5-7 years',
      description: 'Prepare your child for mainstream education with essential skills',
      features: ['Academic foundations', 'Social skills', 'Self-regulation'],
      icon: this.BookOpenIcon,
      color: 'bg-secondary'
    },
    {
      title: 'Parent Coaching',
      ageRange: 'All ages',
      description: 'Empower parents with strategies to support their child at home',
      features: ['Weekly sessions', 'Home strategies', 'Progress tracking'],
      icon: this.UsersIcon,
      color: 'bg-accent'
    }
  ];

  features = [
    {
      title: 'Evidence-Based Methods',
      description: 'PRT, EMT, and JASPER approaches proven to help children with autism',
      icon: this.CheckCircleIcon
    },
    {
      title: 'Small Ratios',
      description: '1:1 to 1:3 educator-to-child ratio for personalized attention',
      icon: this.UsersIcon
    },
    {
      title: 'Parent Involvement',
      description: 'Active parent participation and coaching for home continuity',
      icon: this.HeartIcon
    },
    {
      title: 'Individual Plans',
      description: 'Customized ISPs based on each child\'s unique needs and goals',
      icon: this.TargetIcon
    },
    {
      title: 'Progress Tracking',
      description: 'Regular assessments and detailed progress reports',
      icon: this.ClockIcon
    },
    {
      title: 'Experienced Team',
      description: 'Qualified therapists and educators specialized in autism',
      icon: this.StarIcon
    }
  ];

  testimonials = [
    {
      name: 'Sarah L.',
      role: 'Parent',
      content: 'The progress we\'ve seen in just 6 months has been remarkable. The team truly cares about each child.',
      rating: 5
    },
    {
      name: 'Ahmad K.',
      role: 'Parent',
      content: 'The parent coaching sessions have given us tools to support our son at home. Highly recommended!',
      rating: 5
    },
    {
      name: 'Mei Ling T.',
      role: 'Parent',
      content: 'Professional, caring, and evidence-based approach. Our daughter loves going to the centre!',
      rating: 5
    }
  ];

}
