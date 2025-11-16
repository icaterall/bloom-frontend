import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, Phone, Mail, MapPin, FileText, Shield } from 'lucide-angular';
import { TranslatePipe } from '../pipes/translate.pipe';
import { TranslationService } from '../services/translation.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-footer',
  imports: [CommonModule, RouterModule, LucideAngularModule, TranslatePipe, HttpClientModule],
  templateUrl: './footer.html',
  styleUrls: ['./footer.scss'],
  standalone: true
})
export class FooterComponent {
  constructor(public translationService: TranslationService) {}
  readonly PhoneIcon = Phone;
  readonly MailIcon = Mail;
  readonly MapPinIcon = MapPin;
  readonly FileTextIcon = FileText;
  readonly ShieldIcon = Shield;

  currentYear = new Date().getFullYear();
}
