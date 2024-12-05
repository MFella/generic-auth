import {ApplicationRef, DoBootstrap, Injector, NgModule} from '@angular/core';
import {createCustomElement} from '@angular/elements';
import {GenericAuthComponent} from './generic-auth.component';

@NgModule({
  bootstrap: [],
})
export class GenericAuthModule implements DoBootstrap {
  static generateWebComponent(injector: Injector): void {
    const genericAuthComponent = createCustomElement(GenericAuthComponent, {
      injector,
    });

    customElements.define('generic-auth', genericAuthComponent);
  }

  ngDoBootstrap(appRef: ApplicationRef): void {
    console.log('hello');
  }
}
