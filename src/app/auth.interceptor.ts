import {HttpErrorResponse, HttpInterceptorFn, HttpStatusCode} from '@angular/common/http';
import {inject} from '@angular/core';
import {AuthService} from './auth.service';
import {catchError, throwError} from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const accessToken = authService.getLoggedUser()?.accessToken;
  if (!accessToken) {
    return next(req);
  }

  req = req.clone({
    setHeaders: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });
  return next(req).pipe(
    catchError((httpErrorResponse: HttpErrorResponse) => {
      if (httpErrorResponse.status === HttpStatusCode.Unauthorized) {
        authService.logout();
      }
      return throwError(() => httpErrorResponse);
    })
  );
};
