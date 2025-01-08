import {HttpClient} from '@angular/common/http';
import {facebookConfiguration, githubConfiguration} from '../_configuration/auth.configuration';
import {map, Observable, of} from 'rxjs';
import type {
  AuthType,
  AuthUserProfile,
  FacebookAccessTokenValidationPayload,
  FacebookUserProfile,
  GithubUserProfile,
  JwtConfig,
  OAuthConfig,
  OAuthConfigPayload,
  OAuthType,
} from '../_types/auth.types';
import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class RestService {
  private oauthConfig: Partial<OAuthConfig> = {};
  private jwtConfig?: JwtConfig;
  constructor(private readonly httpClient: HttpClient) {}

  fetchAuthConfigFile(configFile: OAuthType = 'facebook'): Observable<OAuthConfigPayload> {
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

  fetchGithubAccessToken(
    clientId: string,
    clientSecret: string,
    code: string,
    redirectUri: string
  ): Observable<string> {
    return this.httpClient
      .post<Record<'access_token', string>>(
        githubConfiguration.getAccessTokenUrl(),
        {
          client_id: clientId,
          client_secret: clientSecret,
          code,
          redirect_uri: redirectUri,
        },
        {
          headers: {
            'Accept': 'application/json',
          },
        }
      )
      .pipe(
        map(
          (
            response:
              | Record<'access_token', string>
              | Record<'error' | `error_${'description' | 'uri'}`, string>
          ) => {
            debugger;
            if ('error' in response) {
              throw new Error(response.error);
            }
            return response.access_token;
          }
        )
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

  fetchGithubUserProfile(accessToken: string): Observable<AuthUserProfile> {
    return this.httpClient
      .get<GithubUserProfile>(githubConfiguration.getProfileUrl(), {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      })
      .pipe(
        map((githubUserProfile: GithubUserProfile) => {
          return {
            ['auth-type']: 'github',
            email: 'Hidden',
            id: githubUserProfile.id,
            picture: githubUserProfile.avatar_url,
            name: githubUserProfile.name,
          };
        })
      );
  }

  fetchJwtUserProfile(
    email: string,
    password: string,
    provider: AuthType = 'jwt'
  ): Observable<AuthUserProfile> {
    if (!this.jwtConfig) {
      throw new Error('Jwt auth config is not provided!');
    }

    return this.httpClient
      .post<AuthUserProfile>(this.jwtConfig.endpoint_url + this.jwtConfig.user_profile_path, {
        email,
        password,
        provider,
      })
      .pipe(
        map((authUserProfile) => {
          authUserProfile['auth-type'] = provider;
          authUserProfile['id'] = 'Unknown Id';
          return authUserProfile;
        })
      );
  }

  setOAuthConfig(oauthConfig: OAuthConfig): void {
    this.oauthConfig = oauthConfig;
  }

  setJwtConfig(jwtConfig: JwtConfig): void {
    this.jwtConfig = jwtConfig;
  }
}
