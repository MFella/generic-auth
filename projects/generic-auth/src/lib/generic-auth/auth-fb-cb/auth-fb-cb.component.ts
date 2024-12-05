import {Component, inject, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {catchError, filter, of, switchMap, throwError} from 'rxjs';
import {HttpErrorResponse} from '@angular/common/http';
import {AuthService} from '../../_services/auth.service';
import {RestService} from '../../_services/rest.service';

@Component({
  selector: 'app-auth-fb-cb',
  standalone: true,
  imports: [],
  templateUrl: './auth-fb-cb.component.html',
  styleUrl: './auth-fb-cb.component.scss',
})
export class AuthFbCbComponent implements OnInit {
  activatedRoute = inject(ActivatedRoute);
  restService = inject(RestService);
  authService = inject(AuthService);
  router = inject(Router);

  ngOnInit(): void {
    const queryParams = this.activatedRoute.snapshot.queryParams;
    if (!queryParams['code']) {
      // redirect to auth page
      this.router.navigate(['auth']);
      return;
    }

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
                    facebookAuthPayload.clientId,
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
                  facebookAuthPayload.clientId,
                  facebookAuthPayload.clientSecret,
                  queryParams['code'],
                  facebookAuthPayload.redirectUri
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
          this.router.navigate(['logged-in']);
        },
        error: (_err: any) => {
          this.authService.logout();
        },
      });
  }
}
