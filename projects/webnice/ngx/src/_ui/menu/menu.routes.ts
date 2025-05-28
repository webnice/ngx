import { NgModule } from '@angular/core';
import { EventType, NavigationEnd, Router } from '@angular/router';

import { MenuService } from '../../_services';


@NgModule({})
export class MenuRoutingModule {
  /**
   * Конструктор.
   * @param router            - Роутер приложения.
   * @param menuService       - Сервис меню.
   */
  constructor(
    private router: Router,
    private menuService: MenuService,
  ) {
    // Подписка на события переключения роутинга для отслеживания недопустимых URN, которые иногда проскакивают.
    this.router.events.subscribe((e2: any): void => {
      if (Object.prototype.hasOwnProperty.call(e2, "type")) {
        const event: NavigationEnd = e2 as NavigationEnd;
        if (event.type === EventType.NavigationEnd) {
          this.onRoutingReady(event);
        }
      }
    });
  }

  /**
   * Функция выполняется после получения окончательного значения роутинга.
   * @param ne - @type(NavigationEnd) - Объект описания окончательного значения роутинга.
   */
  private onRoutingReady(ne: NavigationEnd): void {
    // Отправка текущего URN в сервис меню.
    this.menuService.doUrn(ne.urlAfterRedirects);
  }
}
