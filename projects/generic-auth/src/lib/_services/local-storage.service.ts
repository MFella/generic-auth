import {inject, Injectable, PLATFORM_ID} from '@angular/core';
import {LSEntryMap, ValidLSKeys} from '../_types/local-storage.types';
import {isPlatformBrowser, isPlatformServer} from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  #platformId = inject(PLATFORM_ID);

  constructor() {}

  setItem<T extends keyof LSEntryMap>(key: T, item: LSEntryMap[T]): void {
    isPlatformBrowser(this.#platformId) &&
      localStorage.setItem(key, typeof item === 'string' ? item : JSON.stringify(item));
  }

  getItem<T extends keyof LSEntryMap>(key: T): LSEntryMap[T] | null {
    if (isPlatformServer(this.#platformId)) {
      return null;
    }

    const item = localStorage.getItem(key);
    if (!item) {
      return null;
    }

    try {
      return JSON.parse(item);
    } catch (err) {
      return item as any;
    }
  }

  clearItems<T extends ValidLSKeys>(hardClear: boolean = false, ...keys: Array<T>): void {
    if (isPlatformServer(this.#platformId)) {
      return;
    }

    if (hardClear) {
      localStorage.clear();
      return;
    }

    keys.forEach((key) => localStorage.removeItem(key));
  }
}
