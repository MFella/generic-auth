import {Component, inject} from '@angular/core';
import {NgOptimizedImage} from '@angular/common';

@Component({
  selector: 'app-logged-in',
  standalone: true,
  imports: [NgOptimizedImage],
  templateUrl: './logged-in.component.html',
  styleUrl: './logged-in.component.scss',
})
export class LoggedInComponent {
  getUserImageUrl(): string {
    // const loggedUser = this.authService.getLoggedUser();
    // return loggedUser?.picture ?? '';
    return '';
  }
}
