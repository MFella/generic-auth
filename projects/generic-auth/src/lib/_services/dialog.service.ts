import {inject, Injectable, TemplateRef} from '@angular/core';
import {DialogRef, DialogService as NgNeatDialogService} from '@ngneat/dialog';

@Injectable({
  providedIn: 'root',
})
export class DialogService {
  private readonly dialogService = inject(NgNeatDialogService);

  constructor() {}

  openDialog(templateRef: TemplateRef<unknown>): DialogRef {
    return this.dialogService.open(templateRef, {height: '400px', closeButton: false});
  }
}
