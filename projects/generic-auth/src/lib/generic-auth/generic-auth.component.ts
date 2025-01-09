import {DOCUMENT, NgIf, NgStyle} from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  Input,
  OnChanges,
  Output,
  Renderer2,
  SimpleChanges,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {RestService} from '../_services/rest.service';
import {AuthService} from '../_services/auth.service';
import {LocalStorageService} from '../_services/local-storage.service';
import {
  AuthType,
  AuthUserProfile,
  GoogleAuthRawPayload,
  GoogleJwtPayload,
  OAuthConfigPayload,
} from '../_types/auth.types';
import {facebookConfiguration} from '../_configuration/auth.configuration';
import {githubConfiguration} from '../_configuration/auth.configuration';
import {
  asyncScheduler,
  BehaviorSubject,
  catchError,
  filter,
  firstValueFrom,
  of,
  scheduled,
  switchMap,
  take,
  throwError,
} from 'rxjs';
import {RoutingConfig} from '../common/routing-types';
import {GenericAuthProviders} from '../common/generic-auth-types';
import {HttpErrorResponse} from '@angular/common/http';
import {ErrorCodes} from '../common/error-codes';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {JwtLoginForm} from '../_types/auth-form.types';
import {AlertService} from '../_services/alert.service';

@Component({
  selector: 'lib-generic-auth',
  standalone: true,
  imports: [NgIf, ReactiveFormsModule, NgStyle],
  providers: [],
  templateUrl: './generic-auth.component.html',
  styleUrl: './generic-auth.component.scss',
  encapsulation: ViewEncapsulation.ShadowDom,
})
export class GenericAuthComponent implements OnChanges {
  private static readonly MS_IN_SECOND = 1000;
  private static readonly HEX_REGEX = /^([0-9A-Fa-f])+$/i;
  private static readonly PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/i;
  restService = inject(RestService);
  authService = inject(AuthService);
  localStorageService = inject(LocalStorageService);
  router = inject(Router);
  document = inject(DOCUMENT);
  renderer2 = inject(Renderer2);
  changeDetectorRef = inject(ChangeDetectorRef);
  elementRef = inject(ElementRef);
  activatedRoute = inject(ActivatedRoute);
  googleButtonWrapper?: HTMLElement | null;
  #destroyRef = inject(DestroyRef);
  allowedOauthTypes: Array<AuthType> = [];
  alertService = inject(AlertService);
  isLoginRequestPended = false;

  jwtLoginFormGroup: FormGroup<JwtLoginForm> = new FormGroup<JwtLoginForm>({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [
      Validators.required,
      Validators.pattern(GenericAuthComponent.PASSWORD_REGEX),
    ]),
  });

  @ViewChild('googleButton')
  googleButton!: ElementRef;

  @Input()
  readonly backendUrl: string = '';

  @Input()
  googleObject: any = '';

  @Output()
  instanceInitialized$: BehaviorSubject<GenericAuthProviders | null> =
    new BehaviorSubject<GenericAuthProviders | null>(null);

  @Input()
  routingConfig: RoutingConfig = {
    auhtorizedPath: 'logged-in',
  };

  ngOnInit(): void {
    // Previously script was added with out 'procedure'
    // Currently used needs to declare that outside of web-component
    this.observeAuthQueryParamsChanged();
    this.observeIsStoredFacebookTokenValid();
    this.observeIsStoredGoogleTokenValid();
    this.observeAllowedOauthTypes();
    this.authService.retrieveUserFromLocalStorage();

    scheduled([0], asyncScheduler).subscribe(() => {
      this.instanceInitialized$.next({
        authService: this.authService,
      });
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['googleObject'].currentValue) {
      this.setupGoogleHooks();
    }
  }

  async logInUser(authType: AuthType): Promise<void> {
    switch (authType) {
      case 'facebook':
        {
          const facebookAuthPayload = await firstValueFrom(this.restService.fetchAuthConfigFile());

          if (facebookAuthPayload) {
            const facebookOauthUrl = facebookConfiguration.getRedirectUrl(
              facebookAuthPayload.client_id,
              facebookAuthPayload.redirect_uri
            );
            window.location.href = facebookOauthUrl;
          }
        }
        break;
      case 'google':
        {
          this.googleButtonWrapper?.click();
        }
        break;
      case 'github':
        {
          const githubAuthPayload = await firstValueFrom(
            this.restService.fetchAuthConfigFile('github')
          );

          if (githubAuthPayload) {
            const githubOauthUrl = githubConfiguration.getRedirectUrl(
              githubAuthPayload.client_id,
              githubAuthPayload.redirect_uri
            );
            window.location.href = githubOauthUrl;
          }
        }
        break;
      case 'jwt':
        {
          try {
            this.isLoginRequestPended = true;
            const jwtLoginFormGroupValue = this.jwtLoginFormGroup.value;

            this.changeDetectorRef.detectChanges();

            const jwtUserProfile = await firstValueFrom(
              this.restService.fetchJwtUserProfile(
                jwtLoginFormGroupValue.email ?? '',
                jwtLoginFormGroupValue.password ?? ''
              )
            );

            if (jwtUserProfile) {
              this.authService.setLoggedUser(jwtUserProfile);
              this.isLoginRequestPended = false;
            }
          } catch (error: unknown) {
            let errorMessage = 'Unrecognized error';
            if (
              typeof error === 'object' &&
              !!error &&
              'error' in error &&
              typeof error.error === 'object' &&
              !!error.error &&
              'message' in error.error &&
              typeof error.error.message === 'string'
            ) {
              errorMessage = error.error.message;
            }

            if (
              typeof error === 'object' &&
              !!error &&
              'status' in error &&
              typeof error.status === 'number'
            ) {
              errorMessage += `. Status Code: ${error.status}`;
            }
            this.isLoginRequestPended = false;
            this.alertService.showErrorAlert(errorMessage);
            console.error('Cannot login jwt user. Message: ' + errorMessage);
            this.changeDetectorRef.detectChanges();
          }
        }
        break;
      default: {
        console.error('Not implemented yet: ' + authType);
      }
    }
  }

  private observeIsStoredGoogleTokenValid(): void {
    let accessToken = this.localStorageService.getItem('access_token');

    if (!accessToken || !accessToken.startsWith('google')) {
      return;
    }

    accessToken = accessToken?.split('_')?.slice(1)?.join('_');

    const googleJwtPayload = this.convertGoogleJwtTokenToObject(accessToken);

    if (!googleJwtPayload) {
      return;
    }

    if (
      new Date(googleJwtPayload.exp * GenericAuthComponent.MS_IN_SECOND).getTime() <
      new Date().getTime()
    ) {
      this.authService.logout();
      return;
    }

    const isUserRetrieved = this.authService.retrieveUserFromLocalStorage(accessToken);

    if (!isUserRetrieved) {
      console.error('Cannot read user from local storage');
      this.authService.logout();
    }
  }

  private observeIsStoredFacebookTokenValid(): void {
    let accessToken = this.localStorageService.getItem('access_token');

    if (!accessToken || !accessToken.startsWith('facebook')) {
      return;
    }

    accessToken = accessToken?.split('_')?.slice(1)?.join('_');

    this.restService
      .fetchAuthConfigFile()
      .pipe(
        switchMap((facebookAuthPayload: OAuthConfigPayload) => {
          return this.restService.fetchFacebookAccessTokenValidation(
            facebookAuthPayload.client_id,
            accessToken
          );
        }),
        take(1)
      )
      .subscribe((isTokenValid) => {
        if (isTokenValid) {
          const isUserRetrieved = this.authService.retrieveUserFromLocalStorage(accessToken);
          if (!isUserRetrieved) {
            console.error('Cannot read user from local storage');
            this.authService.logout();
          }
        }
      });
  }

  private async setupGoogleHooks(): Promise<void> {
    // @ts-ignore
    const {client_id} = await firstValueFrom(this.restService.fetchAuthConfigFile('google'));
    this.googleObject.accounts.id.initialize({
      client_id,
      callback: this.handleGoogleCredentialResponse.bind(this),
      auto_select: false,
      cancel_on_tap_outside: true,
    });

    if (this.googleButton?.nativeElement.style.display != null) {
      this.googleButton.nativeElement.style.display = 'none';
    }
    // @ts-ignore
    this.googleObject.accounts.id.renderButton(this.googleButton.nativeElement, {});

    this.googleButtonWrapper = this.googleButton.nativeElement!.querySelector('div[role=button]');
    this.googleObject.accounts.id.prompt(() => {});
  }

  private handleGoogleCredentialResponse(googleAuthRawPayload: GoogleAuthRawPayload): void {
    const googleJwtPayload = this.convertGoogleJwtTokenToObject(googleAuthRawPayload.credential);

    if (!googleJwtPayload) {
      return;
    }

    const loggedUser: AuthUserProfile = {
      email: googleJwtPayload.email,
      name: googleJwtPayload.name,
      id: googleJwtPayload.sub,
      picture: googleJwtPayload.picture,
      ['auth-type']: 'google',
    };

    this.authService.setAccessToken(googleAuthRawPayload.credential, 'google');
    this.authService.setLoggedUser(loggedUser);
  }

  private convertGoogleJwtTokenToObject(jwtPayload: string): GoogleJwtPayload | null {
    try {
      const decodedJwtPayload = decodeURIComponent(
        Array.prototype.map
          .call(
            atob(jwtPayload.split('.')[1]),
            (c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
          )
          .join('')
      );

      return JSON.parse(decodedJwtPayload);
    } catch (e) {
      return null;
    }
  }

  private observeAuthQueryParamsChanged(): void {
    const params = new URL(document.location.toString()).searchParams;
    const queryParams = {code: params.get('code')};

    if (!queryParams['code']) {
      // redirect to auth page
      return;
    }

    if (this.isHexCode(queryParams['code'])) {
      this.tryFetchGithubUser(queryParams['code']);
      return;
    }

    this.tryFetchFacebookUser(queryParams['code']);
  }

  private isHexCode(code: string): boolean {
    return !!code.match(GenericAuthComponent.HEX_REGEX);
  }

  private tryFetchGithubUser(code: string): void {
    this.restService
      .fetchAuthConfigFile('github')
      .pipe(
        filter(Boolean),
        switchMap((githubAuthPayload) => {
          const storedAccessToken = this.authService.getAccessToken();

          const fetchUserProfileObs$ = this.restService.fetchGithubUserProfile.bind(
            this.restService
          );
          return storedAccessToken
            ? fetchUserProfileObs$(storedAccessToken)
            : this.restService
                .fetchGithubAccessToken(
                  githubAuthPayload.client_id,
                  githubAuthPayload.client_secret,
                  code,
                  githubAuthPayload.redirect_uri
                )
                .pipe(
                  switchMap((accessToken: string) => {
                    this.authService.setAccessToken(accessToken, 'github');
                    return fetchUserProfileObs$(accessToken);
                  })
                );
        })
      )
      .subscribe({
        next: (githubUserProfile) => {
          this.authService.setLoggedUser(githubUserProfile);
        },
        error: (error: any) => {
          if (error.message === ErrorCodes.GITHUB_BAD_VERIFICATION_CODE) {
            this.router.navigate(['']);
          }
          console.warn(error);
        },
      });
  }

  private tryFetchFacebookUser(code: string): void {
    this.restService
      .fetchAuthConfigFile()
      .pipe(
        filter(Boolean),
        switchMap((facebookAuthPayload) => {
          const storedAccessToken = this.authService.getAccessToken();
          // check if access token is not expired

          return (
            storedAccessToken
              ? this.restService
                  .fetchFacebookAccessTokenValidation(
                    facebookAuthPayload.client_id,
                    storedAccessToken
                  )
                  .pipe(
                    switchMap((isTokenValid) =>
                      isTokenValid
                        ? of(storedAccessToken)
                        : throwError(() => new Error('Token is not valid'))
                    )
                  )
              : this.restService.fetchFacebookAccessToken(
                  facebookAuthPayload.client_id,
                  facebookAuthPayload.client_secret,
                  code,
                  facebookAuthPayload.redirect_uri
                )
          ).pipe(
            catchError((httpErrorResponse: HttpErrorResponse) => {
              return throwError(
                () => new Error('Error occured: ' + httpErrorResponse.error?.error?.message)
              );
            }),
            switchMap((accessToken: string) => {
              this.authService.setAccessToken(accessToken, 'facebook');
              return this.restService.fetchFacebookUserProfile(accessToken);
            })
          );
        })
      )
      .subscribe({
        next: (facebookUserProfile) => {
          this.authService.setLoggedUser(facebookUserProfile);
        },
        error: (_err: any) => {
          console.warn(_err);
        },
      });
  }

  private observeAllowedOauthTypes(): void {
    this.authService
      .selectAllowedOauthTypesChanged()
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe((allowedOauthTypes) => {
        this.allowedOauthTypes = allowedOauthTypes;
        this.changeDetectorRef.detectChanges();
      });
  }
}
