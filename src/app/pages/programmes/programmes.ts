import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, CheckCircle, Clock, Users, Target, BookOpen, Heart, Star, Calendar, ArrowRight } from 'lucide-angular';
import { HeaderComponent } from '../../shared/header/header';
import { FooterComponent } from '../../shared/footer/footer';

@Component({
  selector: 'app-programmes',
  imports: [CommonModule, RouterModule, LucideAngularModule, HeaderComponent, FooterComponent],
  templateUrl: './programmes.html',
  styleUrl: './programmes.scss',
  standalone: true
})
export class ProgrammesComponent {
  readonly CheckCircleIcon = CheckCircle;
  readonly ClockIcon = Clock;
  readonly UsersIcon = Users;
  readonly TargetIcon = Target;
  readonly BookOpenIcon = BookOpen;
  readonly HeartIcon = Heart;
  readonly StarIcon = Star;
  readonly CalendarIcon = Calendar;
  readonly ArrowRightIcon = ArrowRight;

  programmes = [
    {
      id: 'early-intervention',
      title: 'Early Intervention Programme',
      ageRange: '3-8 years',
      duration: '2-3 hours/day',
      ratio: '1:1 to 1:3',
      description: 'Our comprehensive early intervention programme uses evidence-based approaches to support your child\'s development during the critical early years.',
      methodologies: [
        { name: 'PRT (Pivotal Response Treatment)', desc: 'Child-led approach focusing on motivation' },
        { name: 'EMT (Enhanced Milieu Teaching)', desc: 'Natural language intervention strategies' },
        { name: 'JASPER', desc: 'Joint attention, symbolic play, engagement & regulation' }
      ],
      curriculum: [
        'Communication & Language',
        'Social Skills Development',
        'Play & Imagination',
        'Self-Help Skills',
        'Pre-Academic Skills',
        'Sensory Integration'
      ],
      dailyFlow: [
        { time: '9:00-9:30', activity: 'Circle Time & Morning Routine' },
        { time: '9:30-10:30', activity: 'Individual Therapy Sessions' },
        { time: '10:30-11:00', activity: 'Snack & Social Time' },
        { time: '11:00-12:00', activity: 'Group Activities & Play' }
      ],
      fee: 'RM 2,500 - 3,500/month'
    },
    {
      id: 'school-readiness',
      title: 'School Readiness Programme',
      ageRange: '5-7 years',
      duration: '3-4 hours/day',
      ratio: '1:2 to 1:4',
      description: 'Preparing children for mainstream education by developing essential academic and social skills needed for school success.',
      methodologies: [
        { name: 'Structured Teaching', desc: 'Visual supports and predictable routines' },
        { name: 'Social Stories', desc: 'Understanding social situations and expectations' },
        { name: 'Executive Function Training', desc: 'Planning, organization, and self-regulation' }
      ],
      curriculum: [
        'Pre-Reading & Writing',
        'Math Concepts',
        'Following Instructions',
        'Classroom Behavior',
        'Peer Interaction',
        'Independence Skills'
      ],
      dailyFlow: [
        { time: '9:00-9:30', activity: 'Morning Assembly & Calendar' },
        { time: '9:30-10:30', activity: 'Academic Learning Time' },
        { time: '10:30-11:00', activity: 'Break & Outdoor Play' },
        { time: '11:00-12:00', activity: 'Art, Music & Movement' },
        { time: '12:00-1:00', activity: 'Lunch & Social Skills' }
      ],
      fee: 'RM 2,800 - 3,800/month'
    },
    {
      id: 'parent-coaching',
      title: 'Parent Coaching Programme',
      ageRange: 'All ages',
      duration: '1-2 hours/week',
      ratio: '1:1 or Group',
      description: 'Empowering parents with strategies and techniques to support their child\'s development at home and in the community.',
      methodologies: [
        { name: 'Family-Centered Practice', desc: 'Collaborative approach with families' },
        { name: 'Coaching Model', desc: 'Building parent confidence and competence' },
        { name: 'Video Feedback', desc: 'Review and refine interaction strategies' }
      ],
      curriculum: [
        'Understanding Autism',
        'Communication Strategies',
        'Behavior Management',
        'Play-Based Learning',
        'Daily Routines',
        'Community Integration'
      ],
      dailyFlow: [
        { time: 'Flexible', activity: 'Individual or group sessions' },
        { time: 'Weekly', activity: 'Practice assignments' },
        { time: 'Monthly', activity: 'Progress review' }
      ],
      fee: 'RM 200 - 400/session'
    }
  ];
}
