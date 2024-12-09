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
import facebookConfig from './_oauth-configs/facebook';
import googleConfig from './_oauth-configs/google';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({eventCoalescing: true}),
    provideRouter(routes),
    provideClientHydration(),
    provideHttpClient(withFetch(), withInterceptorsFromDi()),
    {
      provide: APP_INITIALIZER,
      useFactory: (appRef: ApplicationRef) => async () => {
        const module = await import(
          '../../node_modules/generic-auth/fesm2022/generic-auth.mjs' as any
        );

        const {genAuthService} = module.GenericAuthModule.getAuthProvider(appRef.injector);
        genAuthService.setOAuthConfig({
          facebook: facebookConfig,
          google: googleConfig,
        });
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
