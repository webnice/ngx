import { Injector, Provider, inject, EnvironmentProviders } from '@angular/core';
import { provideAppInitializer } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';


import { setupServiceLocator } from '../tools';

export function provideNgVibeDrawer(): (Provider[] | EnvironmentProviders)[] {
  return [
    provideAnimations(),
    provideAppInitializer(() => {
      const initializerFn = (
        (injector: Injector) => () =>
          setupServiceLocator(injector)
      )(inject(Injector));
      return initializerFn();
    }),
  ];
}
