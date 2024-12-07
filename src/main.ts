import {bootstrapApplication} from '@angular/platform-browser';
import {appConfig} from './app/app.config';
import {AppComponent} from './app/app.component';

bootstrapApplication(AppComponent, appConfig).catch((err) => console.error(err));

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
