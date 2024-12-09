import {
  ApplicationRef,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  inject,
  NgZone,
  OnInit,
} from '@angular/core';
import {Router, RouterModule, RouterOutlet} from '@angular/router';
// import {AuthServiceMethods, AuthUserProfile} from 'generic-auth';
import {AuthService} from './auth.service';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {distinctUntilChanged, filter, switchMap, take} from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  #authService = inject(AuthService);
  #destroyRef = inject(DestroyRef);
  #changeDetectorRef = inject(ChangeDetectorRef);
  #router = inject(Router);
  #ngZone = inject(NgZone);
  applicationRef = inject(ApplicationRef);

  loggedUser?: any;
  genericAuthService?: any;
  genericModule: any;

  async ngOnInit(): Promise<void> {
    this.observeGenericAuthProviderChanged();
    this.observeLoggedInUser();
    this.tryReadUserFromLS();
  }

  logout(): void {
    this.#authService.logout();
    this.#router.navigate(['auth']);
  }

  private async tryReadUserFromLS(): Promise<void> {
    if (this.#authService.isUserRetrievedUserFromLS()) {
      this.setLoggedInUser(this.#authService.getGenAuthLoggedUser());
      return;
    }
  }

  private setLoggedInUser(loggedUser: any | undefined): void {
    this.#authService.setLoggedUser(loggedUser);

    if (loggedUser) {
      this.#ngZone.runOutsideAngular(() => {
        this.#router.navigate(['logged-in']);
      });
    } else if (this.genericAuthService?.retrieveUserFromLocalStorage()) {
      console.log('retrieved');
    }

    this.#changeDetectorRef.detectChanges();
  }

  private observeLoggedInUser(): void {
    this.#authService
      .selectLoggedUserChanged()
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe((loggedUser) => {
        this.loggedUser = loggedUser;
        if (loggedUser) {
          this.#router.navigate(['logged-in']);
        }
        this.#changeDetectorRef.detectChanges();
      });
  }

  private observeGenericAuthProviderChanged(): void {
    this.#authService.genericAuthProvidersChanged$
      .pipe(take(1), takeUntilDestroyed(this.#destroyRef))
      .subscribe((genericAuthProviders) => {
        this.genericAuthService = genericAuthProviders.authService;
        this.observeLoggedUserChanged();
      });
  }

  private observeLoggedUserChanged(): void {
    this.genericAuthService.loggedUserChanged$
      .pipe(
        distinctUntilChanged((previous, current) => {
          if ((previous === current) == null) {
            return true;
          } else if ((!previous && current) || (!current && previous)) {
            return false;
          }

          return Object.keys(previous!).some(
            // eslint-disable-next-line
            (key) => (previous as unknown as any)[key] !== (current as unknown as any)[key]
          );
        }),
        takeUntilDestroyed(this.#destroyRef)
      )
      .subscribe((loggedUser: any) => this.setLoggedInUser(loggedUser as any));
  }
}
