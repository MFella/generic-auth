import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
  OnInit,
} from '@angular/core';
import {GenericAuthProviders} from 'generic-auth';
import {AuthService} from '../auth.service';

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

  ngOnInit(): void {
    this.googleObject = google;
    this.changeDetectorRef.detectChanges();
  }

  genericAuthInitialized($event: Event): void {
    this.#authService.genericAuthProvidersChanged$.next(
      ($event as CustomEvent<GenericAuthProviders>).detail
    );
  }
}
