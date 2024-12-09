import {Injector, NgModule} from '@angular/core';
import {createCustomElement} from '@angular/elements';
import {GenericAuthComponent} from './generic-auth.component';
import {AuthService} from '../_services/auth.service';
import {AuthServiceMethods} from '../common/auth-types';
import '@angular/compiler';

@NgModule({
  bootstrap: [],
  providers: [],
})
export class GenericAuthModule {
  static generateWebComponent(
    injector: Injector,
    component: InstanceType<any> = GenericAuthComponent,
    name: string = 'generic-auth'
  ) {
    const genericAuthComponent = createCustomElement(component, {
      injector,
    });
    customElements.define(name, genericAuthComponent);
  }

  static getAuthProvider(injector: Injector): Record<string, AuthServiceMethods> {
    return {
      genAuthService: injector.get(AuthService),
    };
  }
}
