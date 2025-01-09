import {inject, Injectable} from '@angular/core';
import {AbstractControl, AsyncValidator, ValidationErrors} from '@angular/forms';
import {map, Observable, switchMap, timer} from 'rxjs';
import {RestService} from '../../rest.service';

@Injectable({
  providedIn: 'root',
})
export class IsValidPictureUrlValidator implements AsyncValidator {
  restService = inject(RestService);

  validate(
    control: AbstractControl
  ): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> {
    return timer(0).pipe(
      switchMap(() => {
        return this.restService.observeIsValidPictureUrl(control.value).pipe(
          map((isValidPictureUrl) => {
            if (isValidPictureUrl) {
              return null;
            }

            return {
              imageUrlInvalid: 'Image url is not valid',
            };
          })
        );
      })
    );
  }
}
