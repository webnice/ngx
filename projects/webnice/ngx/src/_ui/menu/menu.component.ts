import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ReplaySubject, Subscription } from 'rxjs';

import { IIcon } from '../../_types';
import { Condition, IMenu, IMenuItem, MenuService } from '../../_services';

import { defaultIconName, IIconName, ISection } from './menu.types';


@Component({
  selector: 'ui-menu',
  standalone: false,
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css'
})
export class MenuComponent implements OnInit, OnDestroy, AfterViewInit {
  private menuConditionSubscribe?: Subscription; // Подписка на канал передачи состояния меню.
  private menuContentSubscribe?: Subscription; // Подписка на канал передачи содержимого меню.
  private menuCondition$?: Condition; // Текущее состояние меню.
  private menuContent$?: IMenu; // Текущее содержимое меню.
  private readonly iconCloseUpdate$: ReplaySubject<IIcon>; // Канал изменения иконки.
  private isViewReady: boolean;

  public sections: ISection[];

  /**
   * Конструктор.
   * @param menuService        - Сервис меню.
   * @param changeDetectorRef  - Определение изменений HTML элементов.
   */
  constructor(
    private menuService: MenuService,
    private changeDetectorRef: ChangeDetectorRef,
  ) {
    [this.menuConditionSubscribe, this.menuCondition$] = [undefined, undefined];
    [this.menuContentSubscribe, this.menuContent$] = [undefined, undefined];
    this.iconCloseUpdate$ = new ReplaySubject<IIcon>;
    this.isViewReady = true;
    this.sections = [];
  }

  /** Инициализатор. */
  ngOnInit(): void {
    this.menuConditionSubscribe = this.menuService.conditionSubject
      .subscribe((condition: Condition): void => {
        let closeIconName: IIconName;
        this.menuCondition$ = condition;
        closeIconName = this.titleIconName;
        this.iconCloseUpdate$.next({
          name: closeIconName.active,
          hover: closeIconName.hover,
          passive: closeIconName.passive,
        });
        this.updateSections();
        this.changeDetectorRef.detectChanges();
      });
    this.menuContentSubscribe = this.menuService.contentSubject
      .subscribe((menu: IMenu): void => {
        this.menuContent$ = menu;
        this.updateSections();
      });
  }

  /** Деструктор. */
  ngOnDestroy(): void {
    if (this.menuConditionSubscribe) {
      this.menuConditionSubscribe.unsubscribe();
      this.menuConditionSubscribe = undefined;
    }
    if (this.menuContentSubscribe) {
      this.menuContentSubscribe.unsubscribe();
      this.menuContentSubscribe = undefined;
    }
  }

  /** Событие завершения отображения элементов HTML страницы. */
  ngAfterViewInit(): void {
    this.isViewReady = true;
    this.updateSectionIcons();
  }

  /** Обновление иконок меню. */
  private updateSectionIcons(): void {
    let n: number;

    if (!this.isViewReady) return;
    for (n = 0; n < this.sections.length; n++) {
      const icon: IIcon = {
        name: this.sections[n].iconActive,
        passive: this.sections[n].iconPassive,
        isPassive: this.sections[n].isDisabled,
      };
      if (!this.sections[n].doUpdate) continue;
      this.sections[n].doUpdate = false;
      this.sections[n].iconUpdate.next(icon);
    }
  }

  /** Обновление настроек меню. */
  private updateSections(): void {
    const replaySubjectBuffer: number = 1;
    let urnCurrent: string = '';
    let add: IMenuItem[] = [];
    let n: number;

    if (!this.menuContent$ || !this.menuCondition$) return;
    if (!this.menuContent$.items) return;
    if (this.menuCondition$ && this.menuCondition$.urnCurrent) urnCurrent = this.menuCondition$.urnCurrent;
    // Изменение массива разделов меню.
    add = this.getSectionsAdd(this.menuContent$.items);
    add.forEach((item: IMenuItem): void => {
      let section: Partial<ISection> = {
        urn: item.urn,
        name: item.name,
        iconUpdate: new ReplaySubject<IIcon>(replaySubjectBuffer),
      }
      this.sections.push(section as ISection);
    });
    // Обновление элементов.
    this.menuContent$.items.forEach((item: IMenuItem): void => {
      for (n = 0; n < this.sections.length; n++) {
        if (item.urn !== this.sections[n].urn) continue;
        this.sections[n].name = item.name ? item.name : '';
        this.sections[n].sticker = item.sticker;
        this.sections[n].isCurrent = urnCurrent.indexOf(item.urn) >= 0;
        this.sections[n].isDisabled = item.isDisabled ? item.isDisabled : false;
        this.sections[n].iconActive = item.iconActive ? item.iconActive : '';
        this.sections[n].iconPassive = item.iconPassive ? item.iconPassive : '';
        if (this.sections[n].iconActive === '') this.sections[n].iconActive = defaultIconName.active;
        if (this.sections[n].iconPassive === '') this.sections[n].iconPassive = defaultIconName.passive;
        if (this.sections[n].isCurrent || this.sections[n].isDisabled) {
          this.sections[n].iconActive =
            this.sections[n].iconPassive !== '' ? this.sections[n].iconPassive : this.sections[n].iconActive;
        }
        this.sections[n].doUpdate = true;
      }
    });
    this.updateSectionIcons();
  }

  /**
   * Получение списка добавляемых элементов меню.
   * @param items - Элементы меню.
   */
  private getSectionsAdd(items: IMenuItem[]): IMenuItem[] {
    let ret: IMenuItem[] = [];
    let found: boolean;
    let n: number;
    let j: number;

    // Получение списка добавляемых элементов.
    for (j = 0; j < items.length; j++) {
      found = false;
      for (n = this.sections.length - 1; n >= 0; n--) {
        if (items[j].urn === this.sections[n].urn) {
          found = true;
          break;
        }
      }
      if (!found) ret.push(items[j]);
    }
    // Удаление лишних элементов.
    for (n = this.sections.length - 1; n >= 0; n--) {
      found = false;
      for (j = 0; j < items.length; j++) {
        if (items[j].urn === this.sections[n].urn) {
          found = true;
          break;
        }
      }
      if (!found) this.sections.splice(n, 1);
    }

    return ret;
  }

  /** Имена иконок для кнопки "сжать" или "закрыть". */
  public get titleIconName(): IIconName {
    let name: string = '';
    if (this.menuCondition$ === undefined) return {active: '', hover: '', passive: ''};
    switch (this.menuCondition$.isMobile) {
      case true:
        name = 'close';
        break;
      default:
        name = this.menuCondition$.view !== 'thin' ? 'bar-left' : 'bar-right';
        break;
    }
    return {active: name + '-active', hover: name + '-hover', passive: name + '-passive'};
  }

  /** Обновление иконки "закрыть". */
  public get iconCloseUpdate(): ReplaySubject<IIcon> {
    return this.iconCloseUpdate$;
  }

  /** Истина - меню открыто. */
  public get isOpen(): boolean {
    let ret: boolean = false;
    if (this.menuCondition$ === undefined) return ret;
    if (this.menuCondition$) ret = this.menuCondition$.view === 'open';
    return ret;
  }

  /** Истина - меню сжато. */
  public get isThin(): boolean {
    let ret: boolean = false;
    if (this.menuCondition$) ret = this.menuCondition$.view === 'thin';
    return ret;
  }

  /** Истина - отображается мобильный интерфейс. */
  public get isMobile(): boolean {
    let ret: boolean = false;
    if (this.menuCondition$) ret = this.menuCondition$.isMobile;
    return ret;
  }

  /** Заголовок меню. */
  public get title(): string {
    let ret: string = '';
    if (this.menuCondition$) ret = this.menuCondition$.title ? this.menuCondition$.title : '';
    return ret;
  }

  /** Вызов функции переключения меню между "открыто", "закрыто", "сжато". */
  public async doToggle(): Promise<void> {
    this.menuService.doToggle();
  }

  /** Обработка клика по меню. */
  public async onContentClick(item: ISection): Promise<void> {
    if (item.isDisabled) return;
    const urn: string = item.urn;
    this.menuService.goUrn(urn);
  }
}
