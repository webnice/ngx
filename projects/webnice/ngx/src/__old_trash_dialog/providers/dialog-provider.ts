import { Injector, Provider, inject, provideAppInitializer, EnvironmentProviders } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { setupServiceLocator } from '../tools';


export function provideNgVibeDialog(): (Provider[] | EnvironmentProviders)[] {
  return [
    provideAnimations(),
    provideAppInitializer(() => {
        const initializerFn = ((injector: Injector) => () => setupServiceLocator(injector))(inject(Injector));
        return initializerFn();
      }),
  ];
}
