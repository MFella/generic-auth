import {HttpClient} from '@angular/common/http';
import {facebookConfiguration} from '../_configuration/auth.configuration';
import {map, Observable, of} from 'rxjs';
import {
  AuthConfigFile,
  AuthUserProfile,
  FacebookAccessTokenValidationPayload,
  FacebookUserProfile,
} from '../_types/auth.types';
import facebookConfig from '../_configuration/auth-data/facebook';
import googleConfig from '../_configuration/auth-data/google';
import {Injectable} from '@angular/core';

export type AuthPayloadKeys = 'clientId' | 'clientSecret' | 'redirectUri';
export type FacebookAuthPayload = Record<AuthPayloadKeys, string>;

@Injectable({
  providedIn: 'root',
})
export class RestService {
  constructor(private readonly httpClient: HttpClient) {}

  fetchAuthConfigFile(configFile: AuthConfigFile = 'facebook'): Observable<FacebookAuthPayload> {
    return of(configFile === 'facebook' ? facebookConfig : googleConfig);
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
}
