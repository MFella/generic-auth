import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
// import {GenericAuthProviders} from 'generic-auth';
import {AuthService} from '../auth.service';
import {isPlatformBrowser} from '@angular/common';

// eslint-disable-next-line
declare const google: any;

// type JwtAuthCredentials = 'email' | 'password';
// type AuthOptions<T extends AuthType> = T extends 'jwt' ? JwtAuthCredentials : never;

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthComponent implements OnInit {
  // eslint-disable-next-line
  googleObject: any;
  changeDetectorRef = inject(ChangeDetectorRef);
  #authService = inject(AuthService);
  #platformId = inject(PLATFORM_ID);

  ngOnInit(): void {
    if (isPlatformBrowser(this.#platformId)) {
      this.googleObject = google;
      this.changeDetectorRef.detectChanges();
    }
  }

  genericAuthInitialized($event: Event): void {
    this.#authService.genericAuthProvidersChanged$.next(($event as CustomEvent<any>).detail);
  }
}
