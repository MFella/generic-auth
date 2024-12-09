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
import {provideHttpClient, withFetch, withInterceptorsFromDi} from '@angular/common/http';
import {AuthService} from './auth.service';
import {isPlatformBrowser} from '@angular/common';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({eventCoalescing: true}),
    provideRouter(routes),
    provideClientHydration(),
    provideHttpClient(withFetch(), withInterceptorsFromDi()),
    {
      provide: APP_INITIALIZER,
      useFactory: (appRef: ApplicationRef) => async () => {
        const module = await import('../generic-auth.mjs' as any);

        const {genAuthService} = module.GenericAuthModule.getAuthProvider(appRef.injector);
        if (isPlatformBrowser(appRef.injector.get(PLATFORM_ID))) {
          appRef.injector.get(AuthService).genAuthService = genAuthService;
          module.GenericAuthModule.generateWebComponent(appRef.injector);
        }
      },
      multi: true,
      deps: [ApplicationRef],
    },
  ],
};
