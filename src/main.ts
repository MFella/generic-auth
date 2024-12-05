import {createCustomElement} from '@angular/elements';
import {
  bootstrapApplication,
  createApplication,
  provideClientHydration,
} from '@angular/platform-browser';
import {appConfig} from './app/app.config';
import {AppComponent} from './app/app.component';
import {AuthComponent} from './app/auth/auth.component';
import {provideZoneChangeDetection, runInInjectionContext} from '@angular/core';
import {provideHttpClient, withFetch} from '@angular/common/http';
import {GenericAuthModule} from 'generic-auth';

bootstrapApplication(AppComponent, appConfig)
  .then((platform) => {
    GenericAuthModule.generateWebComponent(platform.injector);
  })
  .catch((err) => console.error(err));

// (async () => {
//   const app = await createApplication({
//     providers: [
//       provideZoneChangeDetection({eventCoalescing: true}),
//       provideClientHydration(),
//       provideHttpClient(withFetch()),
//     ],
//   });

//   const authComponent = createCustomElement(AuthComponent, {
//     injector: app.injector,
//   });

//   customElements.define('generic-auth', authComponent);
// })();
