import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {inject, Injectable} from '@angular/core';
import {catchError, firstValueFrom, Observable, of, switchMap, take, throwError} from 'rxjs';
import jwtConfig from './_oauth-configs/jwt';

export type UpdateUserResult = {
  provider: 'jwt';
  email: string;
  name: string;
  picture: string;
};

type UpdateUserDto = {
  name: string;
  password: string;
  picture: string;
};

@Injectable({
  providedIn: 'root',
})
export class RestService {
  private static PROXY_URL = 'https://cors-anywhere.herokuapp.com';
  private readonly httpClient = inject(HttpClient);
  private cachedIsValidPictureUrlResults: Map<string, boolean> = new Map<string, boolean>();

  observeIsValidPictureUrl(pictureUrl: string): Observable<boolean> {
    const cachedIsValidPictureUrlResult = this.cachedIsValidPictureUrlResults.get(pictureUrl);
    if (cachedIsValidPictureUrlResult) {
      return of(cachedIsValidPictureUrlResult);
    }

    try {
      return this.httpClient.get(`${RestService.PROXY_URL}/${pictureUrl}`).pipe(
        take(1),
        switchMap((fetchedImage) => {
          this.cachedIsValidPictureUrlResults.set(pictureUrl, !!fetchedImage);
          return of(!!fetchedImage);
        }),
        catchError((error: HttpErrorResponse) => {
          this.cachedIsValidPictureUrlResults.set(pictureUrl, error?.status === 200);
          return of(error?.status === 200);
        })
      );
    } catch (error: any) {
      this.cachedIsValidPictureUrlResults.set(pictureUrl, error?.status === 200);
      return of(error?.status === 200);
    }
  }

  updateJwtUser(updateUserDto: Partial<UpdateUserDto>): Observable<UpdateUserResult> {
    return this.httpClient.put<UpdateUserResult>(
      `${jwtConfig.endpoint_url}${jwtConfig.user_profile_path}`,
      updateUserDto
    );
  }
}
