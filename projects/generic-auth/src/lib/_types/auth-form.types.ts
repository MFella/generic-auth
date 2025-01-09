import {FormControl} from '@angular/forms';

export type JwtLoginForm = {
  email: FormControl<string | null>;
  password: FormControl<string | null>;
};

export type JwtUserEditForm = {
  name: FormControl<string | null>;
  pictureUrl: FormControl<string | null>;
  password: FormControl<string | null>;
  repeatPassword: FormControl<string | null>;
};
