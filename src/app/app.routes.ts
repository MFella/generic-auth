import {Routes} from '@angular/router';
import {AuthComponent} from './auth/auth.component';
import {authGuard} from './_guards/auth.guard';

export const routes: Routes = [
  {
    path: 'auth',
    children: [
      {
        path: '',
        component: AuthComponent,
      },
    ],
  },
  {
    path: 'logged-in',
    loadComponent: () =>
      import('./logged-in/logged-in.component').then(
        (loggedInFile) => loggedInFile.LoggedInComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: '**',
    redirectTo: 'auth',
  },
];
