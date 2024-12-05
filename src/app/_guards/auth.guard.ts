import {CanActivateFn} from '@angular/router';
// import {LocalStorageService} from '../_services/local-storage.service';
// import {FacebookAuthPayload, RestService} from '../_services/rest.service';

export const authGuard: CanActivateFn = (_route, _state) => {
  // const localStorageService = inject(LocalStorageService);
  // const restService = inject(RestService);
  let accessToken = ''; // localStorageService.getItem('access_token');
  if (!accessToken) {
    return false;
  }

  if (!accessToken.startsWith('facebook')) {
    return true;
  }

  accessToken = accessToken?.split('_')?.slice(1)?.join('_');

  return true;
  // return firstValueFrom(
  //   restService.fetchAuthConfigFile().pipe(
  //     switchMap((facebookAuthPayload: FacebookAuthPayload) => {
  //       return restService.fetchFacebookAccessTokenValidation(
  //         facebookAuthPayload.clientId,
  //         accessToken
  //       );
  //     }),
  //     take(1)
  //   )
  // );
};
