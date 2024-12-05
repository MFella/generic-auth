import {ChangeDetectorRef, Component, DestroyRef, inject, OnInit} from '@angular/core';
import {Router, RouterModule, RouterOutlet} from '@angular/router';
import {AuthServiceMethods, AuthUserProfile} from 'generic-auth';
import {AuthService} from './auth.service';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {distinctUntilChanged, switchMap, take} from 'rxjs';

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

  isUserLoggedIn: boolean = false;
  genericAuthService?: AuthServiceMethods;
  loggedUser?: AuthUserProfile;

  ngOnInit(): void {
    this.observeLoggedInUser();
  }

  logout(): void {
    this.genericAuthService?.logout();
  }

  private observeLoggedInUser(): void {
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
                (key) => (previous as any)[key] !== (current as any)[key]
              );
            }),
            takeUntilDestroyed(this.#destroyRef)
          );
        })
      )
      .subscribe((loggedUser) => {
        this.loggedUser = loggedUser;
        if (this.loggedUser) {
          this.#router.navigate(['logged-in']);
        }

        this.#changeDetectorRef.detectChanges();
      });
  }
}
