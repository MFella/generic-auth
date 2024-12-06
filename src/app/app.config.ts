import {
  ApplicationConfig,
  provideZoneChangeDetection,
  APP_INITIALIZER,
  ApplicationRef,
  PLATFORM_ID,
} from '@angular/core';
import {provideRouter} from '@angular/router';

import {routes} from './app.routes';
import {provideClientHydration} from '@angular/platform-browser';
import {provideHttpClient, withFetch} from '@angular/common/http';
import {AuthService} from './auth.service';
import {isPlatformBrowser} from '@angular/common';
import {GenericAuthModule} from 'generic-auth';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({eventCoalescing: true}),
    provideRouter(routes),
    provideClientHydration(),
    provideHttpClient(withFetch()),
    {
      provide: APP_INITIALIZER,
      useFactory: (appRef: ApplicationRef) => () => {
        const {genAuthService} = GenericAuthModule.getAuthProvider(appRef.injector);
        if (isPlatformBrowser(appRef.injector.get(PLATFORM_ID))) {
          appRef.injector.get(AuthService).genAuthService = genAuthService;
        }
      },
      multi: true,
      deps: [ApplicationRef],
    },
  ],
};
