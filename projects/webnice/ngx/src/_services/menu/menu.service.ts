// noinspection JSUnusedGlobalSymbols

import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ReplaySubject } from 'rxjs';
import { Store } from '@ngrx/store';

import { MediaState } from '../../_reducers';
import { Condition, IMenu } from './menu.types';


/**
 * Сервис работы с меню приложения.
 * Единая точка входа и управления меню.

 * Для работы требуются следующие компоненты:
 *   _directives/on-view - Подписка на событие появления кнопки мобильного меню и переключение режима меню.
 *   _ui/menu            - Компонент самого меню, содержимое которого изменяется через сервис.
 *
 */
@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private tm$: NodeJS.Timeout | string | number | undefined; // Таймер автоматического закрытия мобильного меню.

  private readonly condition$: Condition; // Текущее состояние меню.
  private readonly menuConditionSubject$: ReplaySubject<Condition>; // Канал передачи изменения состояния меню.
  private readonly menuContentSubject$: ReplaySubject<IMenu>; // Кана передачи изменения содержимого меню.
  private menu$: IMenu; // Текущее содержимое меню.

  /**
   * Конструктор.
   * @param store              - Сервис управления состоянием ангуляр.
   * @param router             - Роутер.
   */
  constructor(
    private store: Store,
    private router: Router,
  ) {
    this.tm$ = undefined;
    this.condition$ = {view: 'close', isMobile: false};
    this.menuConditionSubject$ = new ReplaySubject<Condition>(1);
    this.menuContentSubject$ = new ReplaySubject<IMenu>(1);
    this.menu$ = {};
    this.store.subscribe((mediaState: Object) => this.mediaUpdate(mediaState));
  }

  /** Остановка и удаление таймера. */
  private tmDestroy(): void {
    if (this.tm$ === undefined) return;
    try {
      clearInterval(this.tm$);
    } catch (e: unknown) {
      console.error('что-то пошло не так:', e);
    }
    this.tm$ = undefined;
  }

  /** Перезапуск таймера. */
  private tmRestart(fn: () => void, timeout: number): void {
    this.tmDestroy();
    if (timeout <= 0 || fn === undefined) return;
    if (!this.condition$.isMobile) return;
    this.tm$ = setInterval(() => fn(), timeout);
  }

  /** Обработка события обновления состояния медиа. */
  private mediaUpdate(mediaState: Object): void {
    const state: MediaState = (mediaState as any).media as MediaState;
    if (mediaState === undefined || state === undefined) return;
    if (this.condition$ !== undefined && this.condition$.isMobile !== state.media.IsMobile) {
      this.doMobile(state.media.IsMobile);
    }
    this.updateView(true);
    // ОТЛАДКА.
    // console.log(
    //   `      Ширина '${state.media.Width}',
    //   Высота: '${state.media.Height}',
    //   Название размера: '${state.media.MediaName}',
    //   Мобильное: '${state.media.IsMobile}',
    //   Прикосновение: '${state.media.IsTouch}'`,
    //   this.condition$);
    // /ОТЛАДКА.
  }

  /** Обновление свойства view. */
  private updateView(doCondition: boolean = false): void {
    if (!this.condition$.isMobile && this.condition$.view === 'close') {
      this.condition$.view = 'open';
      if (doCondition) this.menuConditionSubject$.next(this.condition$);
    }
  }

  /**
   * Получение информации о состоянии интерфейса "мобильный" или "десктопный".
   * @param isMobile - Истина - интерфейс переключён в режим "мобильный".
   */
  public doMobile(isMobile: boolean): void {
    if (!this.condition$.isMobile && isMobile && this.condition$.view === 'open') {
      this.condition$.view = 'close';
    } else if (this.condition$.isMobile && !isMobile) {
      this.condition$.view = 'open';
    }
    this.condition$.isMobile = isMobile;
    this.updateView();
    this.menuConditionSubject$.next(this.condition$);
  }

  /** Текущее состояние меню. */
  public get condition(): Condition {
    return this.condition$;
  }

  /** Канал изменения состояния меню. */
  public get conditionSubject(): ReplaySubject<Condition> {
    return this.menuConditionSubject$;
  }

  /** Текущее содержимое меню. */
  public get content(): IMenu {
    return this.menu$
  }

  /** Канал изменения содержимого меню. */
  public get contentSubject(): ReplaySubject<IMenu> {
    return this.menuContentSubject$;
  }

  /** Текущий URN адрес. */
  public get urn(): string | undefined {
    return this.condition$.urnCurrent;
  }

  /** Открытие меню. */
  public doOpen(): void {
    const fn: () => void = (): void => {
      if (this.condition$.isMobile) this.doClose();
    }
    if (this.condition$.view !== 'open') {
      this.condition$.view = 'open';
      this.menuConditionSubject$.next(this.condition$);
      this.tmRestart(fn, 10000);
    }
  }

  /** Закрытие меню для мобильного интерфейса и переключение в сжатый вид для десктопного интерфейса. */
  public doClose(): void {
    this.tmDestroy();
    if (this.condition$.isMobile && this.condition$.view !== 'close') {
      this.condition$.view = 'close';
      this.menuConditionSubject$.next(this.condition$);
    } else if (!this.condition$.isMobile && this.condition$.view !== 'thin') {
      this.condition$.view = 'thin';
      this.menuConditionSubject$.next(this.condition$);
    }
  }

  /** Переключение между "открыто", "закрыто", "сжато". */
  public doToggle(): void {
    if (this.condition$.view === 'open') this.doClose(); else this.doOpen();
  }

  /** Получение текущего значения роутинга - текущего раздела. */
  public doUrn(urn: string): void {
    this.condition$.urnCurrent = urn;
    this.menuConditionSubject$.next(this.condition$);
  }

  /**
   * Выполнение перехода по URN,
   * но только если это не текущий раздел.
   * @param urn - URN адрес для перехода.
   */
  public goUrn(urn: string): void {
    this.router.navigateByUrl(urn)
      .then((_: boolean): void => {
        if (this.condition$.isMobile && this.condition$.view === 'open') {
          this.condition$.view = 'close';
        }
        this.doUrn(urn);
        this.menuConditionSubject$.next(this.condition$);
      });
  }

  /** Установка значения заголовка меню. */
  public setTitle(title?: string): void {
    this.condition$.title = title;
    this.menuConditionSubject$.next(this.condition$);
  }

  /** Установка значений меню. */
  public setMenu(menu: IMenu): void {
    this.menu$ = menu;
    if (this.menu$.title) this.setTitle(this.menu$.title);
    this.menuContentSubject$.next(this.menu$);
  }
}
