import {provideHttpClient, withFetch} from '@angular/common/http';
import {provideZoneChangeDetection} from '@angular/core';
import {createCustomElement} from '@angular/elements';
import {createApplication, provideClientHydration} from '@angular/platform-browser';
import {GenericAuthComponent} from '../public-api';

(async () => {
  const app = await createApplication({
    providers: [
      provideZoneChangeDetection({eventCoalescing: true}),
      provideClientHydration(),
      provideHttpClient(withFetch()),
    ],
  });

  const genericAuthComponent = createCustomElement(GenericAuthComponent, {
    injector: app.injector,
  });

  customElements.define('generic-auth', genericAuthComponent);
})();
