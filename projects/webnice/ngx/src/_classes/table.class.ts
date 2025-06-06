// noinspection JSUnusedGlobalSymbols

import { Input, OnDestroy, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { AfterViewInit, ChangeDetectorRef, EventEmitter, Injectable } from '@angular/core';
import { BehaviorSubject, ReplaySubject, Subscription } from 'rxjs';
import { Store } from '@ngrx/store';

import { EMediaName, mediaMap, TCssStyle } from '../_types';
import { Media, MediaState } from '../_reducers';
import { getParentByTargetDomRect, styles } from '../_utilities';
import { defaultByDataName, defaultMaxDataName, defaultTableCfg } from './table.types';
import { EColumnSort, ITablePaginator, TEventArea } from './table.types';
import { ICol, IRow, ITable, TTableElement, TTablePage, ITableEvent, TColumnShowMap } from './table.types';


/**
 * Базовый клас для компонентов таблиц.
 *
 * @param cfg           - Настройки таблицы.
 * @param upd           - Канал обновления настроек таблицы.
 * @param event         - Канал событий действий пользователя.
 * @param tplPageSwitch - Шаблон постраничного переключателя отображаемого до и после таблицы.
 */
@Injectable()
export class TableClass implements OnInit, OnDestroy, AfterViewInit {
  private mediaReducerSubscribe?: Subscription; // Подписка на медиа редуктор.
  private dataSubscribe?: Subscription; // Подписка на канал загрузки и обновления данных таблицы.
  private updSubscribe?: Subscription; // Подписка на событие обновления настроек таблицы.
  private selectionSubscribe?: Subscription; // Подписка на состояние выбора всех строк таблицы.
  private readonly selection$: BehaviorSubject<boolean | null>; // Канал обновления состояния выбора всех строк таблицы.
  private selectionData$: boolean | null; // Состояние выбора всех строк таблицы.
  private p$: ITablePaginator // Настройки постраничного переключателя.
  private d$: IRow[]; // Данные тела таблицы.

  private readonly columnShowMap: TColumnShowMap; // Карта отображения колонок таблицы в зависимости от медиа.
  private media: Media; // Текущее состояние медиа.
  protected isReady: boolean; // Таблица готова к отображению.

  // Входящие и исходящие данные.
  @Input({alias: 'cfg'}) protected cfg: ITable; // Настройки таблицы.
  @Input({alias: 'upd'}) protected upd?: ReplaySubject<ITable>; // Канал обновления настроек таблицы.
  @Output('event') protected event: EventEmitter<ITableEvent>; // Канал событий действий пользователя.

  // Шаблоны.
  @ViewChild('tplPageSwitch') protected tplPageSwitch?: TemplateRef<any>;

  // Ссылки на внешние библиотечные функции.
  protected readonly styles: (...style: TCssStyle[]) => TCssStyle = styles; // Функция объединения объектов стиля.
  protected readonly getParentByTargetDomRect: ($event: MouseEvent, ...tags: string[]) => DOMRect =
    getParentByTargetDomRect; // Поиск вышестоящего HTML элемента, получение координат этого элемента @type(DOMRect).

  /**
   * Конструктор.
   * @param changeDetectorRef  - Определение изменений HTML элементов.
   * @param store              - Сервис управления состоянием ангуляр.
   */
  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private store: Store,
  ) {
    this.p$ = this.initPaginator(undefined);
    [this.d$, this.columnShowMap] = [[], this.newColumnShowMap()];
    this.media = {Width: 0, Height: 0, MediaName: EMediaName.LO, IsMobile: false, IsTouch: false};
    this.isReady = false;
    [this.cfg, this.event] = [defaultTableCfg as ITable, new EventEmitter<ITableEvent>];
    this.selectionData$ = null;
    this.selection$ = new BehaviorSubject<boolean | null>(this.selectionData$);
    this.selectionSubscribe = this.selection$.subscribe((v: boolean | null) => this.selectionData$ = v);
  }

  /** Инициализатор. */
  ngOnInit(): void {
    this.mediaReducerSubscribe = this.store.subscribe((mediaState: Object) => this.mediaUpdate(mediaState));
    if (this.upd !== undefined) {
      this.updSubscribe = this.upd.subscribe((cfg: ITable | undefined): void => this.updateCfg(cfg));
    }
  }

  /** Деструктор. */
  ngOnDestroy(): void {
    if (this.mediaReducerSubscribe) {
      this.mediaReducerSubscribe.unsubscribe();
      this.mediaReducerSubscribe = undefined;
    }
    if (this.dataSubscribe) {
      this.dataSubscribe.unsubscribe();
      this.dataSubscribe = undefined;
    }
    if (this.updSubscribe) {
      this.updSubscribe.unsubscribe();
      this.updSubscribe = undefined;
    }
    if (this.selectionSubscribe) {
      this.selectionSubscribe.unsubscribe();
      this.selectionSubscribe = undefined;
    }
  }

  /** Событие завершения отображения элементов HTML страницы. */
  ngAfterViewInit(): void {
    this.initData();
  }

  /**
   * Обработка события обновления состояния медиа.
   * @param mediaState - Описание текущего состояния медиа.
   */
  private mediaUpdate(mediaState: Object): void {
    const state: MediaState = (mediaState as any).media as MediaState;
    if (mediaState === undefined || state === undefined) return;
    this.media = state.media;
  }

  /**
   * Создание карты отображения колонок таблицы в зависимости от разрешений медиа.
   * Функцию можно перегружать в потомке в случае необходимости изменения количества отображаемых колонок.
   */
  protected newColumnShowMap(): TColumnShowMap {
    return {
      [EMediaName.LO]: {max: 1, map: {}}, // Максимум колонок: 1
      [EMediaName.SL]: {max: 2, map: {}}, // Максимум колонок: 2
      [EMediaName.SM]: {max: 4, map: {}}, // Максимум колонок: 4
      [EMediaName.MD]: {max: 4, map: {}}, // Максимум колонок: 4
      [EMediaName.LG]: {max: 6, map: {}}, // Максимум колонок: 6
      [EMediaName.XL]: {max: Number.MAX_SAFE_INTEGER, map: {}}, // Максимум колонок: все.
      [EMediaName.XL2X]: {max: Number.MAX_SAFE_INTEGER, map: {}}, // Максимум колонок: все.
    };
  }

  /**
   * Обновление настроек таблицы.
   * @param cfg - Новые настройки таблицы.
   */
  protected updateCfg(cfg: ITable | undefined): void {
    if (cfg === undefined) return;
    this.cfg = cfg;
    this.initData();
  }

  /** Инициализация данных таблицы. */
  protected initData(): void {
    let n: number;
    let k: EMediaName;

    // Подготовка заголовков.
    if (this.cfg.head !== undefined) {
      // Расчёт карты отображения заголовков таблицы в зависимости от медиа разрешения.
      for (n = 0; n < this.cfg.head.columns.length; n++) {
        // Перенос в карту настроек отображения колонок таблицы.
        Object.keys(this.columnShowMap).forEach((key: string): void => {
          k = key as EMediaName;
          if (this.cfg.head && this.cfg.head.columns[n].minMediaName !== undefined) {
            this.columnShowMap[k].map[n] = mediaMap[k].min >= mediaMap[this.cfg.head.columns[n].minMediaName!].min;
          } else this.columnShowMap[k].map[n] = true;
        });
      }
      // Коррекция карты в соответствии и количественными значениями отображения колонок таблицы.
      Object.keys(this.columnShowMap).forEach((key: string): void => {
        let nShow: number = 0;
        k = key as EMediaName;
        for (n = 0; n < this.cfg.head!.columns.length; n++) {
          if (n in this.columnShowMap[k].map && this.columnShowMap[k].map[n]) {
            if (nShow >= this.columnShowMap[k].max) this.columnShowMap[k].map[n] = false;
          }
          if (n in this.columnShowMap[k].map && this.columnShowMap[k].map[n]) {
            nShow += 1;
          }
        }
      });
    }
    // Подготовка данных.
    if (this.cfg.data !== undefined) {
      // Копирование статических данных тела таблицы.
      if (this.cfg.data.rows !== undefined && this.cfg.data.rows.length > 0) {
        this.d$ = this.initDataRows(this.cfg.data.rows);
        this.initDataRowsIsSelected();
      }
      // Загрузка динамически обновляемые данные тела таблицы.
      if (this.cfg.data.loader !== undefined) {
        this.dataSubscribe = this.cfg.data.loader().subscribe((rows: IRow[]): void => {
          this.d$ = this.initDataRows(rows);
          this.initDataRowsIsSelected();
        });
      }
    }
    // Постраничный переключатель.
    this.p$ = this.initPaginator(this.cfg.paginator);
    // Флаг готовности к отображению таблицы.
    this.isReady = true;
    this.changeDetectorRef.detectChanges();
  }

  /**
   * Подготовка данных.
   * @param rows - Данные таблицы.
   */
  protected initDataRows(rows?: IRow[]): IRow[] {
    let ret: IRow[] = [];
    let n: number;

    if (rows !== undefined) {
      for (n = 0; n < rows.length; n++) {
        // Нормализация выбора строки.
        if (rows[n].isSelected === undefined) rows[n].isSelected = false;
        ret.push(rows[n]);
      }
    }

    return ret;
  }

  /**
   * Обновление состояния коробки выбора группы строк.
   * @param event - Подготовленный объект события действия пользователя над таблицей.
   */
  protected initDataRowsIsSelected(event: ITableEvent | undefined = undefined): void {
    let max: number = 0;
    let sel: number = 0;
    let uns: number = 0;
    let ids: number[] = [];
    let v: boolean | null = null;
    let n: number;

    for (n = 0; n < this.d$.length; n++) {
      if (this.rowDisabled(n)) continue;
      max += 1;
      if (this.d$[n].isSelected) {
        sel += 1;
        ids.push(this.d$[n].id);
      } else {
        uns += 1;
      }
    }
    if (sel === max) v = true;
    if (uns === max) v = false;
    if (sel > 0 && uns > 0) v = null;
    this.selection$.next(v);
    // Если объект события не равен undefined, наполнение объекта данными и отправка.
    if (event !== undefined) {
      [event.way, event.data] = ['selection', ids];
      this.event.next(event);
    }
  }

  /**
   * Расчёт постраничного переключателя.
   * @param paginator - Объект настроек постраничного переключателя.
   */
  protected initPaginator(paginator: ITablePaginator | undefined): ITablePaginator {
    const empty: ITablePaginator = {show: 'none', count: 0, size: 0, current: 1, max: 1};
    let size: number;
    let count: number;

    if (paginator === undefined || paginator.count <= 0) return empty;
    [paginator.current, paginator.max] = [this.p$.current, this.p$.max];
    // Расчёт постраничного переключателя.
    size = paginator.size > 0 ? paginator.size : 10;
    count = Math.trunc(paginator.count / size);
    if (count * size < paginator.count) count += 1;
    paginator.max = count;
    if (paginator.current === undefined || paginator.current <= 0) paginator.current = 1;

    return paginator;
  }

  /* *******************************************************************************************************************
   * ДОБЫТЧИКИ И УСТАНОВЩИКИ. */

  /** Получение текущего номера страницы постраничного переключателя. */
  protected get pageCurrent(): number {
    return this.p$.current!;
  }

  /** Установка текущего номера страницы постраничного переключателя. */
  protected set pageCurrent(value: number) {
    const rect: Partial<DOMRect> = {x: 0, y: 0, width: 0, height: 0};
    let event: ITableEvent;

    if (this.p$.current! > this.p$.max!) value = this.p$.max!;
    this.p$.current = value;
    this.changeDetectorRef.detectChanges();
    // Создание объекта события.
    event = {
      area: 'head', way: 'paginator',
      rect: rect as DOMRect, row: 0, col: 0, x: 0, y: 0,
      isShift: false, data: this.p$,
    };
    this.event.next(event);
  }

  /** Получение максимального номера страницы постраничного переключателя. */
  protected get pageMax(): number {
    return this.p$.max!;
  }

  /** Установка максимального номера страницы постраничного переключателя. */
  protected set pageMax(value: number) {
    const rect: Partial<DOMRect> = {x: 0, y: 0, width: 0, height: 0};
    let event: ITableEvent;

    if (this.p$.current! > value) this.p$.current = value;
    this.p$.max = value;
    this.changeDetectorRef.detectChanges();
    // Создание объекта события.
    event = {
      area: 'head', way: 'paginator',
      rect: rect as DOMRect, row: 0, col: 0, x: 0, y: 0,
      isShift: false, data: this.p$,
    };
    this.event.next(event);
  }

  /** Размер страницы постраничного переключателя. */
  protected get pageBy(): number {
    return this.p$.size;
  }

  /** Надпись перед выводом размера страницы данных. */
  protected get byDataName(): string {
    let ret: string = defaultByDataName;
    if (this.p$.sizeName !== undefined) ret = this.p$.sizeName;
    return ret;
  }

  /** Истина - заголовок таблицы отображается. */
  protected get isHeader(): boolean {
    let ret: boolean = false;
    if (this.cfg.head === null) return ret;
    ret = this.columns.length > 0;
    return ret;
  }

  /** Количество колонок таблицы. */
  protected get columnCount(): number {
    let ret: number;
    ret = this.columns.length;
    if (this.cfg.hideFirstColumn === undefined || !this.cfg.hideFirstColumn) ret += 1;
    if (this.cfg.hideLastColumn === undefined || !this.cfg.hideLastColumn) ret += 1;
    return ret;
  }

  /** Массив колонок таблицы. */
  protected get columns(): ICol[] {
    let ret: ICol[] = [];
    if (this.cfg !== undefined && this.cfg.head !== undefined) ret = this.cfg.head.columns;
    return ret;
  }

  /** Массив строк таблицы. */
  protected get dataRows(): IRow[] {
    return this.d$;
  }

  /** Количество строк данных таблицы. */
  protected get dataCount(): number {
    return this.d$.length;
  }

  /** Надпись перед выводом числа с количеством данных. */
  protected get maxDataName(): string {
    let ret: string = defaultMaxDataName;
    if (this.p$.name !== undefined) ret = this.p$.name;
    return ret;
  }

  /** Максимальное количество строк данных таблицы. */
  protected get maxDataCount(): number {
    return this.p$.count;
  }

  /** Получение состояния выбора всех строк таблицы. */
  protected get dataSelection(): boolean | null {
    return this.selectionData$;
  }

  /** Установка состояния выбора всех строк таблицы. */
  protected set dataSelection(v: boolean | null) {
    const rect: Partial<DOMRect> = {x: 0, y: 0, width: 0, height: 0};
    let event: ITableEvent;
    let n: number;

    this.selection$.next(v);
    if (v !== null) {
      for (n = 0; n < this.d$.length; n++) {
        if (this.rowDisabled(n)) continue;
        this.d$[n].isSelected = v;
      }
      // Создание объекта события.
      event = {
        area: 'head', way: 'selection',
        rect: rect as DOMRect, row: 0, col: 0, x: 0, y: 0,
        isShift: false, data: [],
      };
      this.initDataRowsIsSelected(event);
    }
  }

  /* /ДОБЫТЧИКИ И УСТАНОВЩИКИ.
   ****************************************************************************************************************** */

  /**
   * Разрешение или запрет отображения колонки.
   * @param col - Порядковый номер колонки.
   */
  protected isColumnShow(col: number): boolean {
    return this.columnShowMap[this.media.MediaName].map[col];
  }

  /**
   * Составление списка классов для колонки заголовка таблицы в соответствии с настройками.
   * @param col - Порядковый номер колонки.
   */
  protected columnClass(col: number): string[] | null {
    let ret: string[] | null = [];

    // Добавление списка внешних классов.
    if (this.columns[col].classData !== undefined && this.columns[col].classData !== null) {
      ret.push(...(this.columns[col].classData as string[]));
    }
    // Класс запрещающий перенос строк.
    if (this.columns[col].isNowrap !== undefined) {
      if (this.columns[col].isNowrap) ret.push('content-head-nowrap');
    } else ret.push('content-head-wrap');
    // Класс подсветки сортировки данных.
    if (this.columns[col].isSorting !== undefined) {
      switch (this.columns[col].isSorting) {
        // В прямом порядке.
        case EColumnSort.ASC:
          ret.push('head-asc');
          ret.push('head-sorting-space');
          break;
        // В обратном порядке.
        case EColumnSort.DESC:
          ret.push('head-desc');
          ret.push('head-sorting-space');
          break;
        // Без упорядочивания.
        case EColumnSort.NONE:
          break;
      }
    }
    // Если списка классов нет, меняем пустой массив на null.
    if (ret.length <= 0) ret = null;

    return ret;
  }

  /**
   * Создание уникального имени поля формы для строки данных.
   * @param row - Номер строки данных.
   */
  protected rowName(row: number): string {
    const data: IRow = this.d$[row];
    return `row-${row}-id-${data.id}`;
  }

  /**
   * Добытчик и установщик для поля isSelected данных таблицы указанной строки.
   * @param row   - Номер строки данных.
   * @param event - Подготовленный объект события действия пользователя над таблицей.
   */
  protected rowSelected(row: number, event: ITableEvent | undefined = undefined) {
    const parent: this = this;
    return new class {
      public get value(): boolean | null {
        return parent.d$[row].isSelected === undefined ? null : parent.d$[row].isSelected;
      }

      public set value(v: boolean | null) {
        parent.d$[row].isSelected = v === null ? undefined : v;
        parent.initDataRowsIsSelected(event);
      }
    }
  }

  /**
   * Запрет или разрешение выделения строки данных.
   * @param row - Номер строки данных.
   */
  protected rowDisabled(row: number): boolean {
    const data: IRow = this.d$[row];
    return data.noSelect !== undefined ? data.noSelect : false;
  }

  /**
   * Если включён элемент постраничного переключателя, тогда вернётся ссылка на шаблон HTML элемента.
   * @param id - Идентификатор постраничного переключателя.
   */
  protected pageSwitch(id: TTablePage): TemplateRef<any> | null {
    let ret: TemplateRef<any> | null = null;

    if (this.tplPageSwitch !== undefined) {
      switch (id) {
        case 'before':
          if (this.p$.show === id || this.p$.show === 'all') {
            ret = this.tplPageSwitch;
          }
          break;
        case 'after':
          if (this.p$.show === id || this.p$.show === 'all') {
            ret = this.tplPageSwitch;
          }
          break;
      }
    }

    return ret;
  }

  /**
   * Создание динамического стиля элемента компонента таблицы.
   * @param elm  - Константа элемента компонента таблицы.
   * @param colN - Порядковый номер колонки таблицы, используется для стилей зависящих от места в таблице.
   */
  protected style(elm: TTableElement, colN: number = 0): TCssStyle {
    const cfg: ITable = this.cfg;
    let isAnyNoWidth: boolean;
    let columnCount: number;
    let columnLast: number;
    let ret: TCssStyle[] = [];
    let n: number;

    switch (elm) {
      case 'table': // Стиль для всей таблицы.
        if ((cfg.widthFull === undefined || !cfg.widthFull) && (cfg.width !== undefined && cfg.width > 0)) {
          ret.push({'width.px': cfg.width.toString()});
        }
        break;
      case 'page-switch': // Стиль строки с компонентом постраничного переключателя.
        if ((cfg.widthFull === undefined || !cfg.widthFull) && (cfg.width !== undefined && cfg.width > 0)) {
          ret.push({'width.px': cfg.width.toString()});
        }
        break;
      case 'head-row': // Стиль строки заголовка таблицы.
        if (cfg.head !== undefined && cfg.head.height !== undefined) {
          ret.push({'height.px': cfg.head.height.toString()});
        }
        break;
      case 'column': // Стиль ячейки/колонки таблицы.
        if (cfg.head !== undefined && colN < cfg.head.columns.length && cfg.head.columns[colN].width !== undefined) {
          [isAnyNoWidth, columnCount, columnLast] = [false, 0, 0];
          for (n = 0; n < cfg.head.columns.length; n++) {
            if (!this.columnShowMap[this.media.MediaName].map[n]) continue;
            [columnCount, columnLast] = [columnCount + 1, n];
            if (cfg.head.columns[n].width === undefined) {
              isAnyNoWidth = true;
            }
          }
          if (columnCount > 1) {
            if (!isAnyNoWidth && colN !== columnLast || isAnyNoWidth) {
              ret.push({'width.px': cfg.head.columns[colN].width.toString()});
            }
          }
        }
        break;
    }

    return this.styles(...ret);
  }

  /**
   * Обработка события клика по колонке выбора строки данных.
   * @param $event - События клика мышкой.
   * @param area   - Константа области таблицы возникновения события.
   * @param row    - Номер строки данных.
   * @param col    - Порядковый номер колонки данных.
   */
  protected async onClickSelect($event: MouseEvent, area: TEventArea, row: number = 0, col: number = 0): Promise<void> {
    const rect: DOMRect = this.getParentByTargetDomRect($event, 'TD', 'TH');
    let isShift: boolean = false;
    let event: ITableEvent;

    if (this.rowDisabled(row)) return;
    // Для колонки 0 клик всегда обрабатывается как выделение.
    // Получение состояния нажатости клавиши shift.
    if (area === 'sel' || $event.shiftKey) isShift = true;
    // Клик с нажатым шифтом обрабатывается как переключение выделения строки.
    if (isShift) {
      // Создание объекта события.
      event = {
        area: area, way: 'selection',
        rect: rect, row: row, col: col, x: $event.x, y: $event.y,
        isShift: isShift, data: $event,
      };
      this.rowSelected(row, event).value = !this.rowSelected(row).value;
      $event.stopPropagation();
      $event.preventDefault();
      return;
    }
    // Создание объекта события.
    event = {
      area: area, way: 'click',
      rect: rect, row: row, col: col, x: $event.x, y: $event.y,
      target: $event.target,
      isShift: isShift, data: $event,
    };
    this.event.next(event);
  }

  /**
   * Обработка события клика правой клавишей мыши либо клика по иконке опций.
   * @param $event - События клика мышкой.
   * @param area   - Константа области таблицы возникновения события.
   * @param row    - Номер строки данных.
   * @param col    - Порядковый номер колонки данных.
   */
  protected async onContextMenu($event: MouseEvent, area: TEventArea, row: number = 0, col: number = 0): Promise<void> {
    const rect: DOMRect = this.getParentByTargetDomRect($event, 'TD', 'TH');
    let event: ITableEvent;

    $event.preventDefault();
    if (this.rowDisabled(row)) return;
    // Создание объекта события.
    event = {
      area: area, way: 'context',
      rect: rect, row: row, col: col, x: $event.x, y: $event.y,
      target: $event.target,
      isShift: $event.shiftKey, data: $event,
    };
    this.event.next(event);
  }

  /**
   * Обработка события клика по иконке опций.
   * @param $event - События клика мышкой.
   */
  protected async onOptions($event: MouseEvent): Promise<void> {
    const rect: DOMRect = this.getParentByTargetDomRect($event, 'TD', 'TH');
    let event: ITableEvent;

    $event.preventDefault();
    // Создание объекта события.
    event = {
      area: 'opt', way: 'button',
      rect: rect, row: 0, col: 0, x: $event.x, y: $event.y,
      target: $event.target,
      isShift: $event.shiftKey, data: $event,
    };
    this.event.next(event);
  }

  /**
   * Обработка события клика по кнопке выбора размера страницы постраничного выбора.
   * @param $event - События клика мышкой.
   */
  protected async onPageSize($event: MouseEvent): Promise<void> {
    const rect: DOMRect = this.getParentByTargetDomRect($event, 'BUTTON');
    let event: ITableEvent;

    $event.stopPropagation();
    // Создание объекта события.
    event = {
      area: 'opt', way: 'paginator',
      rect: rect, row: 0, col: 0, x: $event.x, y: $event.y,
      target: $event.target,
      isShift: $event.shiftKey, data: this.p$,
    };
    this.event.next(event);
  }
}
