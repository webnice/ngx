import { Injectable } from '@angular/core';
import { Observable, Subscriber } from 'rxjs';

import { DrawerRemoteControl, DrawerPosition, DrawerService } from '../../__old_trash_drawer';


/**
 * Выдвижной ящик - отображение компонентов интерфейса в виде выезжающей створки.
 */
@Injectable({
  providedIn: 'root',
})
export class BoxService {
  private drawerCount: number;

  /**
   * Конструктор.
   * @param drawerService      - Сервис выдвижного ящика.
   */
  constructor(
    private drawerService: DrawerService,
  ) {
    this.drawerCount = 0;
    this.drawerService.activeDrawersCount$
      .subscribe((v: number): number => this.drawerCount = v);
  }

  /**
   * Открытие выдвижной коробки.
   * @param component - Компонент загружаемый в слой коробки.
   * @param payload   - Объект данных передаваемых в компонент.
   */
  public open(component: any, payload: any): Observable<any> {
    let observable: Observable<null>;

    if (this.drawerCount > 0) {
      observable = new Observable<null>((s: Subscriber<null>): void => {
        s.next(null);
        s.complete();
      });
      return observable;
    }
    const drawer: DrawerRemoteControl = new DrawerRemoteControl(component);
    drawer.options = {
      width: '',
      height: '',
      position: DrawerPosition.RIGHT,
      showOverlay: true,
    };
    return drawer.openDrawer(payload);
  }

  /** Количество открытых коробок. */
  public get count(): number {
    return this.drawerCount;
  }

  public get service(): DrawerService {
    return this.drawerService;
  }
}
