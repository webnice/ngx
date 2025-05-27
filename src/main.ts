import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppComponent } from './app/app.component';


platformBrowserDynamic()
  .bootstrapModule(AppComponent)
  .then((): void => {
    // Если в проекте используется роутинг, редирект или таймеры, регистрация ServiceWorker возможна только тут.
    // if ('serviceWorker' in navigator && environment.production) {
    //   navigator.serviceWorker.register('/sw-master.js').then((result) => {
    //     console.log('serviceWorker returns:', result);
    //   });
    // }
  })
  .catch((err: unknown): void => {
    console.error(`Загрузка ангуляр прервана ошибкой: ${err}`);
  })
  .finally((): void => {
    console.log('Ангуляр загружен и выполняется.')
  });
