import {Component, inject, OnInit, TemplateRef} from '@angular/core';
import {NgClass, NgOptimizedImage, NgStyle} from '@angular/common';
import {AuthService} from '../auth.service';
import {DialogService} from '../../../projects/generic-auth/src/lib/_services/dialog.service';
import {DialogRef} from '@ngneat/dialog';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import {JwtUserEditForm} from '../../../projects/generic-auth/src/lib/_types/auth-form.types';
import {IsValidPictureUrlValidator} from '../common/forms/is-valid-picture-url.validator';
import {RestService} from '../rest.service';
import {take} from 'rxjs';
import {HttpErrorResponse} from '@angular/common/http';
import {AlertService} from '../alert.service';

@Component({
  selector: 'app-logged-in',
  standalone: true,
  imports: [NgOptimizedImage, ReactiveFormsModule, NgClass],
  templateUrl: './logged-in.component.html',
  styleUrl: './logged-in.component.scss',
})
export class LoggedInComponent implements OnInit {
  private static readonly PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/i;
  #authService = inject(AuthService);
  #dialogService = inject(DialogService);
  #restService = inject(RestService);
  #alertService = inject(AlertService);
  isValidPictureUrlValidator = inject(IsValidPictureUrlValidator);
  dialogRef?: DialogRef;
  loggedUser: any | undefined;
  editJwtUserRawValue: any;

  editJwtUserFormGroup: FormGroup<JwtUserEditForm> = new FormGroup<JwtUserEditForm>(
    {
      name: new FormControl('', [Validators.minLength(4), Validators.maxLength(32)]),
      pictureUrl: new FormControl(
        '',
        [],
        [this.isValidPictureUrlValidator.validate.bind(this.isValidPictureUrlValidator)]
      ),
      password: new FormControl('', [Validators.pattern(LoggedInComponent.PASSWORD_REGEX)]),
      repeatPassword: new FormControl('', [Validators.pattern(LoggedInComponent.PASSWORD_REGEX)]),
    },
    {
      validators: [this.arePasswordsTheSame.bind(this)],
      updateOn: 'blur',
    }
  );

  ngOnInit(): void {
    this.loggedUser = this.#authService.getLoggedUser();
  }

  getUserSingleValue(key: any): string {
    return this.loggedUser?.[key] ?? '';
  }

  openEditModal(templateRef: TemplateRef<unknown>): void {
    this.editJwtUserFormGroup.setValue({
      name: this.getUserSingleValue('name'),
      pictureUrl: this.getUserSingleValue('picture'),
      password: '',
      repeatPassword: '',
    });

    this.editJwtUserRawValue = this.editJwtUserFormGroup.getRawValue();
    this.dialogRef = this.#dialogService.openDialog(templateRef);
    this.dialogRef.afterClosed$.subscribe(() => {
      this.dialogRef = undefined;
      this.editJwtUserRawValue = null;
    });
  }

  discardChanges(): void {
    this.dialogRef?.close();
    this.dialogRef = undefined;
  }

  private arePasswordsTheSame(control: AbstractControl): ValidationErrors | null {
    const passwordValue = (control as FormGroup<JwtUserEditForm>).get('password')?.value;
    const repeatPasswordValue = (control as FormGroup<JwtUserEditForm>).get(
      'repeatPassword'
    )?.value;
    if (!passwordValue || !repeatPasswordValue) {
      return null;
    }

    if (passwordValue.localeCompare(repeatPasswordValue) === 0) {
      return null;
    }

    return {
      passwordMismatch: 'Passwords are not the same',
    };
  }

  saveChanges(): void {
    let updateUserPayload: Record<any, any> = {};
    const {name, pictureUrl, password} = this.editJwtUserFormGroup.getRawValue();

    if (name) {
      updateUserPayload['name'] = name;
    }

    if (pictureUrl) {
      updateUserPayload['picture'] = pictureUrl;
    }

    if (password) {
      updateUserPayload['password'] = password;
    }

    if (!name && !pictureUrl && !password) {
      this.dialogRef?.close();
      return;
    }

    this.#restService
      .updateJwtUser(updateUserPayload)
      .pipe(take(1))
      .subscribe({
        next: (updateUserResult) => {
          this.#authService.updateLoggedUser(updateUserResult);
          this.dialogRef?.close();
        },
        error: (error: HttpErrorResponse) => {
          this.#alertService.showErrorAlert(error.error?.message);
        },
      });
  }

  isFormInInitialState(): boolean {
    const editJwtUserRawValue = this.editJwtUserFormGroup.getRawValue();

    return (
      editJwtUserRawValue['name'] === this.editJwtUserRawValue['name'] &&
      editJwtUserRawValue['password'] == this.editJwtUserRawValue['password'] &&
      editJwtUserRawValue['repeatPassword'] === this.editJwtUserRawValue['repeatPassword'] &&
      editJwtUserRawValue['pictureUrl'] === this.editJwtUserRawValue['pictureUrl']
    );
  }
}
