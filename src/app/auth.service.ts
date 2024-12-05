import {Injectable} from '@angular/core';
import {GenericAuthProviders} from 'generic-auth';
import {Subject} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  readonly genericAuthProvidersChanged$: Subject<GenericAuthProviders> =
    new Subject<GenericAuthProviders>();

  constructor() {}
}
