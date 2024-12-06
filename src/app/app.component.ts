import {
  ApplicationRef,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  inject,
  NgZone,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import {Router, RouterModule, RouterOutlet} from '@angular/router';
import {AuthServiceMethods, AuthUserProfile, GenericAuthModule} from 'generic-auth';
import {AuthService} from './auth.service';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {distinctUntilChanged, firstValueFrom, switchMap, take, timer} from 'rxjs';
import {isPlatformBrowser} from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, GenericAuthModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  #authService = inject(AuthService);
  #destroyRef = inject(DestroyRef);
  #changeDetectorRef = inject(ChangeDetectorRef);
  #router = inject(Router);
  #ngZone = inject(NgZone);
  #platformId = inject(PLATFORM_ID);
  applicationRef = inject(ApplicationRef);

  loggedUser?: AuthUserProfile;
  genericAuthService?: AuthServiceMethods;

  ngOnInit(): void {
    this.observeLoggedInUser();
  }

  logout(): void {
    this.#authService.logout();
    this.#router.navigate(['auth']);
  }

  private async observeLoggedInUser(): Promise<void> {
    if (isPlatformBrowser(this.#platformId)) {
      const params = new URL(document.location.toString()).searchParams;
      const codeParam = params.get('code');
      if (codeParam) {
        await firstValueFrom(timer(2000));
      }
    }

    if (this.#authService.isUserRetrievedUserFromLS()) {
      this.setLoggedInUser(this.#authService.getGenAuthLoggedUser());
      return;
    }

    this.#authService.genericAuthProvidersChanged$
      .pipe(
        take(1),
        takeUntilDestroyed(this.#destroyRef),
        switchMap((genericAuthProviders) => {
          this.genericAuthService = genericAuthProviders.authService;
          return this.genericAuthService.loggedUserChanged$.pipe(
            distinctUntilChanged((previous, current) => {
              if (!previous || !current) {
                return true;
              }

              return Object.keys(previous).some(
                // eslint-disable-next-line
                (key) => (previous as unknown as any)[key] !== (current as unknown as any)[key]
              );
            }),
            takeUntilDestroyed(this.#destroyRef)
          );
        })
      )
      .subscribe(this.setLoggedInUser.bind(this));
  }

  private setLoggedInUser(loggedUser: AuthUserProfile | undefined): void {
    this.#authService.setLoggedUser(loggedUser);

    if (loggedUser) {
      this.#ngZone.runOutsideAngular(() => {
        this.#router.navigate(['logged-in']);
      });
    }

    this.loggedUser = loggedUser;
    this.#changeDetectorRef.detectChanges();
  }
}
