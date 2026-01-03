import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-book-tour',
  imports: [CommonModule, RouterModule],
  templateUrl: './book-tour.html',
  styleUrls: ['./book-tour.scss'],
  standalone: true
})
export class BookTourComponent implements OnInit {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (this.authService.isAuthenticatedUser()) {
      const user = this.authService.getCurrentUser();

      if (user?.role === 'parent') {
        this.router.navigate(['/parent/home']);
      } else if (user?.role === 'admin') {
        this.router.navigate(['/admin/dashboard']);
      } else if (user?.role === 'staff') {
        this.router.navigate(['/staff/dashboard']);
      } else {
        this.router.navigate(['/']);
      }
    } else {
      this.router.navigate(['/login']);
    }
  }
}
