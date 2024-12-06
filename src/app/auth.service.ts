import {Injectable} from '@angular/core';
import {AuthServiceMethods, AuthUserProfile, GenericAuthProviders} from 'generic-auth';
import {Subject} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  readonly genericAuthProvidersChanged$: Subject<GenericAuthProviders> =
    new Subject<GenericAuthProviders>();

  genAuthService!: AuthServiceMethods;
  private loggedUser?: AuthUserProfile;

  constructor() {}

  setLoggedUser(loggedUser: AuthUserProfile | undefined): void {
    this.loggedUser = loggedUser;
  }

  getLoggedUser(): AuthUserProfile | undefined {
    return this.loggedUser;
  }

  isUserRetrievedUserFromLS(): boolean {
    return this.genAuthService?.retrieveUserFromLocalStorage();
  }

  getGenAuthLoggedUser(): AuthUserProfile | undefined {
    return this.genAuthService?.getLoggedUser();
  }

  logout(): void {
    this.genAuthService?.logout();
    this.setLoggedUser(undefined);
  }
}
