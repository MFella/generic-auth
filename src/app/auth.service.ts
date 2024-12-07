import {Injectable} from '@angular/core';
import {AuthServiceMethods, AuthUserProfile, GenericAuthProviders} from 'generic-auth';
import {Observable, Subject} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  readonly genericAuthProvidersChanged$: Subject<GenericAuthProviders> =
    new Subject<GenericAuthProviders>();

  genAuthService!: AuthServiceMethods;
  private loggedUser?: AuthUserProfile;
  private readonly loggedUserChanged$: Subject<AuthUserProfile | undefined> = new Subject<
    AuthUserProfile | undefined
  >();

  constructor() {}

  setLoggedUser(loggedUser: AuthUserProfile | undefined): void {
    this.loggedUser = loggedUser;
    this.loggedUserChanged$.next(loggedUser);
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

  selectLoggedUserChanged(): Observable<AuthUserProfile | undefined> {
    return this.loggedUserChanged$.asObservable();
  }
}
