import {
  ApplicationRef,
  ClassProvider,
  DoBootstrap,
  Injectable,
  Injector,
  ModuleWithProviders,
  NgModule,
  Provider,
} from '@angular/core';
import {createCustomElement} from '@angular/elements';
import {GEN_AUTH_SERVICE, GenericAuthComponent} from './generic-auth.component';
import {AuthService} from '../_services/auth.service';
import {AuthServiceMethods} from '../common/auth-types';
import {} from '@angular/elements';

abstract class WCGenericAuthModule {
  constructor(injector: Injector, component: InstanceType<any>, name: string) {
    const genericAuthComponent = createCustomElement(component, {
      injector,
    });
    customElements.define(name, genericAuthComponent);
  }
}

@NgModule({
  bootstrap: [],
})
export class GenericAuthModule extends WCGenericAuthModule {
  constructor(readonly injector: Injector) {
    super(injector, GenericAuthComponent, 'generic-auth');
  }

  static generateWebComponent(injector: Injector): void {
    const genericAuthComponent = createCustomElement(GenericAuthComponent, {
      injector,
    });

    customElements.define('generic-auth', genericAuthComponent);
  }

  static getAuthProvider(injector: Injector): Record<string, AuthServiceMethods> {
    return {
      genAuthService: injector.get(AuthService),
    };
  }
  // ngDoBootstrap(appRef: ApplicationRef): void {
  //   console.log('hello');
  //   const genericAuthComponent = createCustomElement(GenericAuthComponent, {
  //     injector: appRef.injector,
  //   });

  //   customElements.define('generic-auth', genericAuthComponent);
  // }
}
