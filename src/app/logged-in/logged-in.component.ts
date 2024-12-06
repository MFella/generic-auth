import {Component, inject, OnInit} from '@angular/core';
import {NgOptimizedImage} from '@angular/common';
import {AuthService} from '../auth.service';
import {AuthUserProfile} from 'generic-auth';

@Component({
  selector: 'app-logged-in',
  standalone: true,
  imports: [NgOptimizedImage],
  templateUrl: './logged-in.component.html',
  styleUrl: './logged-in.component.scss',
})
export class LoggedInComponent implements OnInit {
  authService = inject(AuthService);
  loggedUser: AuthUserProfile | undefined;

  ngOnInit(): void {
    this.loggedUser = this.authService.getLoggedUser();
  }

  getUserSingleValue(key: keyof AuthUserProfile): string {
    return this.loggedUser?.[key] ?? '';
  }
}
