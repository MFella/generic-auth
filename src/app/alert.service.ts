import {DOCUMENT} from '@angular/common';
import {inject, Injectable, Renderer2, RendererFactory2} from '@angular/core';
import {Subject, take, takeUntil, timer} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AlertService {
  private static readonly HIDE_ALERT_TIME_MS = 3000;
  private static readonly GENERIC_AUTH_ALERT_CLASS = 'app-error-alert';
  private readonly bannerDestroyed$: Subject<void> = new Subject<void>();

  private readonly rendererFactory = inject(RendererFactory2);
  private readonly renderer2!: Renderer2;
  private readonly document = inject(DOCUMENT);

  constructor() {
    this.renderer2 = this.rendererFactory.createRenderer(null, null);
  }

  showErrorAlert(errorMessage: string, hideInMs: number = AlertService.HIDE_ALERT_TIME_MS): void {
    const errorAlertChild = Array.from(this.document.body.childNodes).find((node) =>
      ((node as any).classList as DOMTokenList)?.contains(AlertService.GENERIC_AUTH_ALERT_CLASS)
    );
    if (errorAlertChild) {
      this.bannerDestroyed$.next();
      this.renderer2.removeChild(document.body, errorAlertChild);
    }

    const errorMessageHtml = this.getErrorAlertHTMLTemplate(errorMessage);

    const errorAlertElement: HTMLDivElement = this.renderer2.createElement('div');

    this.setHTMLDivElementStyles(errorAlertElement);
    errorAlertElement.innerHTML = errorMessageHtml;
    this.renderer2.appendChild(document.body, errorAlertElement);

    timer(hideInMs)
      .pipe(take(1), takeUntil(this.bannerDestroyed$))
      .subscribe(() => {
        this.renderer2.removeChild(document.body, errorAlertElement);
      });
  }

  private setHTMLDivElementStyles(htmlDivElement: HTMLDivElement): void {
    htmlDivElement.classList.add(AlertService.GENERIC_AUTH_ALERT_CLASS);
    htmlDivElement.style.position = 'fixed';
    htmlDivElement.style.right = '2rem';
    htmlDivElement.style.bottom = '2rem';
    htmlDivElement.style.padding = '2rem';
    htmlDivElement.style.border = '1px solid rgb(239 68 68 / 1)';
    htmlDivElement.style.backgroundColor = 'rgb(254 242 242 / 1)';
    htmlDivElement.style.borderRadius = '.5rem';
    htmlDivElement.style.boxShadow =
      '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);';
  }

  private getErrorAlertHTMLTemplate(errorMessage: string): string {
    return `
    <div role="alert" style="transition: all .4s;">
      <div style="display: flex; align-items: center; gap: .5rem; color: rgb(153 27 27 / 1);">
      <svg style="width: 1.25rem; height: 1.25rem;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-5">
      <path fill-rule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clip-rule="evenodd"></path>
    </svg>
      <strong class="block font-medium text-red-800"> Something went wrong </strong>
      </div>

  <p style="margin-top: .5rem; font-size: 0.875rem; line-height: 1.25rem; color: rgb(185 28 28 / 1)" >
    ${errorMessage}
  </p>
</div>
    `;
  }
}
