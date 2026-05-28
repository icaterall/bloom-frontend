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

  // Professional comments / expert opinions (the centre is not yet operational,
  // so these are NOT parent testimonials). TODO(i18n): add Malay translations.
  expertOpinions = [
    {
      name: 'DR NF',
      role: 'Senior Lecturer',
      content: 'Early intervention in education is essential to improve academic outcomes, build confidence and help reduce achievement gaps by providing timely and targeted support. Ultimately, it contributes to better personal development and social opportunities.'
    },
    {
      name: 'Dr RY',
      role: '',
      content: 'Twice-exceptional (2e) children possess both high potential and hidden learning challenges. Advanced learning intervention at BSC is essential to nurture their strengths while supporting their needs—empowering them to grow into confident, future-ready global talents.'
    },
    {
      name: 'FC',
      role: 'Senior OT Peads',
      content: 'Early intervention is about neuroplasticity. The structured, evidence-based approach ensures every therapeutic milestone translates into meaningful, real-world progress.'
    }
  ];

}
