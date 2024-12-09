import {HttpClient} from '@angular/common/http';
import {facebookConfiguration} from '../_configuration/auth.configuration';
import {map, Observable, of} from 'rxjs';
import {
  AuthConfigFile,
  AuthType,
  AuthUserProfile,
  FacebookAccessTokenValidationPayload,
  FacebookUserProfile,
  OAuthConfig,
  OAuthConfigPayload,
} from '../_types/auth.types';
import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class RestService {
  private oauthConfig: Partial<OAuthConfig> = {};
  constructor(private readonly httpClient: HttpClient) {}

  fetchAuthConfigFile(configFile: AuthType = 'facebook'): Observable<OAuthConfigPayload> {
    if (!this.oauthConfig || !this.oauthConfig[configFile]) {
      return of();
    }

    return of(this.oauthConfig[configFile]);
  }

  fetchFacebookAccessToken(
    clientId: string,
    clientSecret: string,
    code: string,
    redirectUri: string
  ): Observable<string> {
    return this.httpClient
      .get<Record<'access_token', string>>(
        facebookConfiguration.getAccessTokenUrl(clientId, clientSecret, code, redirectUri)
      )
      .pipe(map((data: Record<'access_token', string>) => data['access_token']));
  }

  fetchFacebookAccessTokenValidation(clientId: string, accessToken: string): Observable<boolean> {
    return this.httpClient
      .get<FacebookAccessTokenValidationPayload>(
        facebookConfiguration.getCheckAccessTokenValidationUrl(clientId, accessToken)
      )
      .pipe(
        map((response: FacebookAccessTokenValidationPayload) => {
          return response.expires_in > 0;
        })
      );
  }

  fetchFacebookUserProfile(accessToken: string): Observable<AuthUserProfile> {
    return this.httpClient
      .get<FacebookUserProfile>(facebookConfiguration.getProfileUrl(accessToken))
      .pipe(
        map((facebookUserProfile: FacebookUserProfile) => {
          const authUserProfile = structuredClone(
            facebookUserProfile
          ) as unknown as AuthUserProfile;
          authUserProfile['picture'] = facebookUserProfile.picture.data.url;
          authUserProfile['auth-type'] = 'facebook';
          return authUserProfile;
        })
      );
  }

  setOAuthConfig(oauthConfig: OAuthConfig): void {
    this.oauthConfig = oauthConfig;
  }
}
