import { ApplicationConfig } from '@angular/core';
import { provideRouter, withViewTransitions } from '@angular/router';
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
