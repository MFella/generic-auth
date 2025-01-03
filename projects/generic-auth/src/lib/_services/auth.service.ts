import {inject, Injectable} from '@angular/core';
import {AuthType, AuthUserProfile, OAuthConfig} from '../_types/auth.types';
import {LocalStorageService} from './local-storage.service';
import {BehaviorSubject, Observable} from 'rxjs';
import {AuthServiceMethods} from '../common/auth-types';
import {RestService} from './rest.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService implements AuthServiceMethods {
  private localStorageService = inject(LocalStorageService);
  private restService = inject(RestService);
  private loggedUser?: AuthUserProfile;
  private accessToken?: string;
  private allowedOauthTypesChanged$: BehaviorSubject<Array<AuthType>> = new BehaviorSubject<
    Array<AuthType>
  >([]);

  loggedUserChanged$: BehaviorSubject<AuthUserProfile | undefined> = new BehaviorSubject<
    AuthUserProfile | undefined
  >(undefined);

  constructor() {}

  setLoggedUser(loggedUser: AuthUserProfile): void {
    this.localStorageService.setItem('user', loggedUser);
    this.loggedUser = loggedUser;
    this.loggedUserChanged$.next(loggedUser);
  }

  getLoggedUser(): AuthUserProfile | undefined {
    return this.loggedUser;
  }

  setAccessToken(accessToken: string, authType: AuthType): void {
    this.accessToken = accessToken;
    this.localStorageService.setItem('access_token', `${authType}_${accessToken}`);
  }

  getAccessToken(): string | undefined {
    return this.accessToken?.split('_')?.slice(1)?.join('_');
  }

  logout(): void {
    this.loggedUser = undefined;
    this.accessToken = undefined;
    this.localStorageService.clearItems(false, 'access_token', 'user');
    this.loggedUserChanged$.next(undefined);
  }

  retrieveUserFromLocalStorage(accessToken?: string): boolean {
    const userFromLS = this.localStorageService.getItem('user');

    if (!userFromLS) {
      return false;
    }

    this.setLoggedUser(userFromLS);
    if (!accessToken) {
      accessToken = (this.localStorageService.getItem('access_token') as string)
        ?.split('_')
        ?.slice(1)
        ?.join('_');
    }
    this.accessToken = accessToken;

    return true;
  }

  setOAuthConfig(oauthConfig: OAuthConfig): void {
    this.restService.setOAuthConfig(oauthConfig);
    this.allowedOauthTypesChanged$.next(Object.keys(oauthConfig) as Array<AuthType>);
  }

  selectAllowedOauthTypesChanged(): Observable<Array<AuthType>> {
    return this.allowedOauthTypesChanged$.asObservable();
  }
}
