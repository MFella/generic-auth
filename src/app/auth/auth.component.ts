import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
} from '@angular/core';
import {AuthType} from '../../../projects/generic-auth/src/lib/_types/auth.types';
import {GenericAuthProviders} from 'generic-auth';
import {AuthService} from '../auth.service';

declare const google: any;

type JwtAuthCredentials = 'email' | 'password';
type AuthOptions<T extends AuthType> = T extends 'jwt' ? JwtAuthCredentials : never;

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthComponent {
  googleObject: any;
  changeDetectorRef = inject(ChangeDetectorRef);
  #authService = inject(AuthService);

  initializeGoogleObject(): void {
    this.googleObject = google;
    this.changeDetectorRef.detectChanges();
  }

  genericAuthInitialized($event: Event): void {
    this.#authService.genericAuthProvidersChanged$.next(
      ($event as CustomEvent<GenericAuthProviders>).detail
    );
  }
}
