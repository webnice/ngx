import { DOCUMENT } from '@angular/common';
import { Injector, Provider, inject } from '@angular/core';
import { provideAppInitializer, EnvironmentProviders } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { Observable } from 'rxjs';
import { IToastifyProviderOptions } from '../interfaces';
import { setupServiceLocator } from '../tools';
import { setupToastContainer } from './toast-container-provider';
// import { ToastConfigService } from '../services/toast-config.service';


export function provideNgVibeToastify(
  options: IToastifyProviderOptions = {}
): (Provider[] | EnvironmentProviders)[] {
  return [
    provideAnimations(),
    provideAppInitializer(() => {
      const initializerFn: () => void | Observable<unknown> | Promise<unknown> =
        // ТУТ ОШИБКА:  (injector: Injector, config: ToastConfigService) => () => {
        ((injector: Injector) => () => {
          setupServiceLocator(injector);
          if (options.maximumToasts !== undefined) {
            // ТУТ ТОЖЕ:  config.maximumToasts = options.maximumToasts;
          }
        })(inject(Injector));
      return initializerFn();
    }),
    provideAppInitializer(() => {
      const initializerFn: () => void = ((document: Document) =>
        setupToastContainer(document))(inject(DOCUMENT));
      return initializerFn();
    }),
  ];
}
