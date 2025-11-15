import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, Phone, Mail, MapPin, FileText, Shield } from 'lucide-angular';

@Component({
  selector: 'app-footer',
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './footer.html',
  styleUrls: ['./footer.scss'],
  standalone: true
})
export class FooterComponent {
  readonly PhoneIcon = Phone;
  readonly MailIcon = Mail;
  readonly MapPinIcon = MapPin;
  readonly FileTextIcon = FileText;
  readonly ShieldIcon = Shield;

  currentYear = new Date().getFullYear();
}
