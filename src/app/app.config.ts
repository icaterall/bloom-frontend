import { ApplicationConfig } from '@angular/core';
import { provideRouter, withViewTransitions, withInMemoryScrolling } from '@angular/router';
import { routes } from './app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideToastr } from 'ngx-toastr';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { authInterceptor } from './core/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      withViewTransitions(),          // Native View-Transitions API (Chrome 111+)
      withInMemoryScrolling({
        // Landing-page CTAs sit at the bottom of a long page — without this,
        // navigating to /contact keeps the old scroll offset.
        scrollPositionRestoration: 'enabled',
        anchorScrolling: 'enabled',
      }),
    ),
    provideAnimations(),              // Required for @angular/animations & ngx-toastr
    provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptor]),
    ),
    provideCharts(withDefaultRegisterables()),
    provideToastr({
      timeOut: 5000,
      positionClass: 'toast-bottom-right',
      preventDuplicates: true,
      progressBar: true,
      closeButton: true,
      newestOnTop: true,
      maxOpened: 5,
      autoDismiss: true,
      enableHtml: true,
    }),
  ],
};
