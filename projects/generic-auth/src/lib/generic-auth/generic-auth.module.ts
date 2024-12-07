import {inject, Injector, NgModule, PLATFORM_ID} from '@angular/core';
import {createCustomElement} from '@angular/elements';
import {GenericAuthComponent} from './generic-auth.component';
import {AuthService} from '../_services/auth.service';
import {AuthServiceMethods} from '../common/auth-types';
import {} from '@angular/elements';
import {isPlatformServer} from '@angular/common';

abstract class WCGenericAuthModule {
  constructor(injector: Injector, component: InstanceType<any>, name: string) {
    if (isPlatformServer(inject(PLATFORM_ID))) {
      return;
    }
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

  static getAuthProvider(injector: Injector): Record<string, AuthServiceMethods> {
    return {
      genAuthService: injector.get(AuthService),
    };
  }
}
