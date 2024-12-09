import {BehaviorSubject} from 'rxjs';
import {AuthUserProfile, OAuthConfig} from '../_types/auth.types';

export type AuthServiceMethods = {
  loggedUserChanged$: BehaviorSubject<AuthUserProfile | undefined>;

  getLoggedUser(): AuthUserProfile | undefined;
  getAccessToken(): string | undefined;
  logout(): void;
  retrieveUserFromLocalStorage(accessToken?: string): boolean;
  setOAuthConfig(oauthConfig: OAuthConfig): void;
};
