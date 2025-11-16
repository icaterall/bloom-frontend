import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./landing-page/landing-page.component')
        .then(m => m.LandingPageComponent),
    title: 'Bloom Spectrum Centre - Every child can grow'
  },
  {
    path: 'programmes',
    loadComponent: () =>
      import('./pages/programmes/programmes')
        .then(m => m.ProgrammesComponent),
    title: 'Our Programmes - Bloom Spectrum Centre'
  },
  {
    path: 'book-tour',
    loadComponent: () =>
      import('./pages/book-tour/book-tour')
        .then(m => m.BookTourComponent),
    title: 'Book a Tour - Bloom Spectrum Centre'
  },
  {
    path: 'fees',
    loadComponent: () =>
      import('./pages/fees/fees')
        .then(m => m.Fees),
    title: 'Fees - Bloom Spectrum Centre'
  },
  {
    path: 'faqs',
    loadComponent: () =>
      import('./pages/faqs/faqs')
        .then(m => m.Faqs),
    title: 'FAQs - Bloom Spectrum Centre'
  },
  {
    path: 'contact',
    loadComponent: () =>
      import('./pages/contact/contact')
        .then(m => m.Contact),
    title: 'Contact Us - Bloom Spectrum Centre'
  },
  { path: '**', redirectTo: '' }
];
