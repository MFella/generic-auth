import {Injectable} from '@angular/core';
// import {AuthServiceMethods, AuthUserProfile, GenericAuthProviders} from 'generic-auth';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {UpdateUserResult} from './rest.service';

type AuthType = 'facebook' | 'google' | 'jwt';
type AuthUserProfile = Record<'email' | 'name' | 'id' | 'picture', string> &
  Record<'auth-type', AuthType> &
  Record<'accessToken', string | undefined>;

type GenericAuthProviders = {
  authService: AuthServiceMethods;
};

export type AuthServiceMethods = {
  loggedUserChanged$: BehaviorSubject<AuthUserProfile | undefined>;

  getLoggedUser(): AuthUserProfile | undefined;
  getAccessToken(): string | undefined;
  logout(): void;
  retrieveUserFromLocalStorage(accessToken?: string): boolean;
  setLoggedUser(loggedUser: AuthUserProfile): void;
};

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

  updateLoggedUser(updateUserResult: Partial<AuthUserProfile>): void {
    for (let [key, value] of Object.entries(updateUserResult)) {
      if (this.loggedUser) {
        this.loggedUser[key as keyof AuthUserProfile] = value as any;
      }
    }

    this.loggedUserChanged$.next(this.loggedUser);
    if (this.loggedUser) {
      this.genAuthService?.setLoggedUser(this.loggedUser);
    }
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
