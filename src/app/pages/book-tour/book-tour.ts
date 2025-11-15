import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, Calendar, Clock, MapPin, User, Phone, Mail, Users, CheckCircle, Info } from 'lucide-angular';
import { HeaderComponent } from '../../shared/header/header';
import { FooterComponent } from '../../shared/footer/footer';

@Component({
  selector: 'app-book-tour',
  imports: [CommonModule, FormsModule, RouterModule, LucideAngularModule, HeaderComponent, FooterComponent],
  templateUrl: './book-tour.html',
  styleUrls: ['./book-tour.scss'],
  standalone: true
})
export class BookTourComponent {
  readonly CalendarIcon = Calendar;
  readonly ClockIcon = Clock;
  readonly MapPinIcon = MapPin;
  readonly UserIcon = User;
  readonly PhoneIcon = Phone;
  readonly MailIcon = Mail;
  readonly UsersIcon = Users;
  readonly CheckCircleIcon = CheckCircle;
  readonly InfoIcon = Info;

  booking = {
    date: '',
    time: '',
    parentName: '',
    phoneNumber: '',
    email: '',
    childName: '',
    childAge: '',
    concerns: '',
    howHeard: '',
    preferredLanguage: 'english'
  };

  availableSlots = [
    '9:00 AM',
    '10:00 AM',
    '11:00 AM',
    '2:00 PM',
    '3:00 PM',
    '4:00 PM'
  ];

  submitted = false;
  minDate = new Date().toISOString().split('T')[0];
  maxDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  onSubmit() {
    if (this.isFormValid()) {
      console.log('Booking submitted:', this.booking);
      this.submitted = true;
      // In production, this would send to backend API
      // and send confirmation email/SMS
    }
  }

  isFormValid(): boolean {
    return !!(this.booking.date && 
             this.booking.time && 
             this.booking.parentName && 
             this.booking.phoneNumber && 
             this.booking.email);
  }

  resetForm() {
    this.booking = {
      date: '',
      time: '',
      parentName: '',
      phoneNumber: '',
      email: '',
      childName: '',
      childAge: '',
      concerns: '',
      howHeard: '',
      preferredLanguage: 'english'
    };
    this.submitted = false;
  }
}
