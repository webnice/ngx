import { Component, ElementRef, Inject, Input } from '@angular/core';
import { AfterViewInit, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { OnChanges, SimpleChange, SimpleChanges } from '@angular/core';
import { ReplaySubject, Subscription } from 'rxjs';

import { IIcon } from '../../_types';
import { _FEATURE_ICON_CONFIGS, IIconConfig } from './icon.types';


/**
 * Отображение одной SVG иконки с заданными параметрами.
 * Иконка берётся из спрайта иконок и масштабируется до требуемых размеров, если это требуется.
 *
 * @param name      - Название иконки в спрайте;
 * @param hover     - Для состояния наведения мышки, название иконки в спрайте;
 * @param passive   - Для пассивного состояния, название иконки в спрайте;
 * @param width     - Ширина иконки. Указывается только если ширина иконки отличается от 24px;
 * @param height    - Высота иконки. Указывается только если высота иконки отличается от 24px;
 * @param isPassive - Получение изменений пассивного состояния (boolean | ReplaySubject<boolean>);
 * @param update    - Канал получения изменений иконки (ReplaySubject<IIcon);
 *
 * @example
 * Пример использования:
 * <icon
 *    [name]="'eye-close-active'"
 *    [width]="16"
 *    [height]="12"
 * ></icon>
 */
@Component({
  selector: 'icon',
  standalone: false,
  templateUrl: './icon.component.html',
  styleUrl: './icon.component.css',
  encapsulation: ViewEncapsulation.None,
})
export class IconComponent implements OnInit, OnDestroy, AfterViewInit, OnChanges {
  private readonly config: IIconConfig;
  private isPassiveSubscribe?: Subscription; // Подписка на канал получения состояния иконки пассивная/активная;
  private updatesSubscribe?: Subscription; // Подписка на канал получения обновлений иконки.
  private isAfterViewInitDone$: boolean;
  private isMouseOver: boolean;
  private gist$: IIcon;

  // Входящие данные.
  @Input({alias: 'name', required: true}) public name: string; // Название активной иконки.
  @Input({alias: 'hover'}) public hover: string; // Название иконки при наведении.
  @Input({alias: 'passive'}) public passive: string; // Название пассивной иконки.
  @Input({alias: 'width'}) public width: number; // Ширина иконки.
  @Input({alias: 'height'}) public height: number; // Высота иконки.
  @Input({alias: 'isPassive'}) public isPassive?: boolean | ReplaySubject<boolean>; // Состояние иконки пассивная/активная.
  @Input({alias: 'update'}) public update?: ReplaySubject<IIcon>; // Канал получения обновлений иконки.

  public isView: boolean; // Если "истина", тогда объект иконки отображается.

  @ViewChild('svg') public svg!: ElementRef<SVGElement>;
  @ViewChild('use') public use!: ElementRef<SVGUseElement>;

  /** Конструктор. */
  constructor(
    @Inject(_FEATURE_ICON_CONFIGS)
    config: IIconConfig,
  ) {
    this.config = config;
    [this.isAfterViewInitDone$, this.isMouseOver, this.gist$] = [false, false, {}];
    [this.name, this.hover, this.passive, this.width, this.height] = ['', '', '', config.width, config.height];
    this.isView = false;
  }

  /** Инициализатор. */
  ngOnInit(): void {
    [this.gist$.name, this.gist$.hover, this.gist$.passive] = [this.name, this.hover, this.passive];
    [this.gist$.width, this.gist$.height] = [this.width, this.height];
    try {
      switch (typeof this.isPassive) {
        // Передана булевая переменная.
        case "boolean":
          this.gist$.isPassive = this.isPassive as boolean;
          break;
        // Передан канал изменения состояния.
        case 'object':
          let chan: ReplaySubject<boolean> = this.isPassive as ReplaySubject<boolean>;
          this.isPassiveSubscribe = chan.subscribe((isPassive: boolean): void => {
            this.gist$.isPassive = isPassive;
            this.init();
          });
          break;
        default:
          break;
      }
    } catch (e: unknown) {
      // console.warn('Канал получения состояния иконки пассивная/активная не передан.');
    }
    try {
      let chan: ReplaySubject<IIcon> = this.update as ReplaySubject<IIcon>;
      this.updatesSubscribe = chan.subscribe((upd: IIcon): void => {
        if (upd.name) this.gist$.name = upd.name;
        if (upd.hover) this.gist$.hover = upd.hover;
        if (upd.passive) this.gist$.passive = upd.passive;
        if (upd.width) this.gist$.width = upd.width;
        if (upd.height) this.gist$.height = upd.height;
        if (upd.isPassive) this.gist$.isPassive = upd.isPassive;
        this.init();
      });
    } catch (e: unknown) {
      // console.warn('Канал получения обновлений иконки не передан.');
    }
    // Если название иконки передано, тогда показываем объект.
    this.isView = this.gist$.name !== '';
  }

  /** Деструктор. */
  ngOnDestroy(): void {
    if (this.isPassiveSubscribe) {
      this.isPassiveSubscribe.unsubscribe();
      this.isPassiveSubscribe = undefined;
    }
    if (this.updatesSubscribe) {
      this.updatesSubscribe.unsubscribe();
      this.updatesSubscribe = undefined;
    }
  }

  /** Событие завершения отображения элементов HTML страницы. */
  ngAfterViewInit(): void {
    this.isAfterViewInitDone$ = true;
    this.init();
  }

  /**
   * Событие обнаружения изменений.
   * @param changes - Объект описания изменений. */
  ngOnChanges(changes: SimpleChanges): void {
    let doUpdate: boolean = false;
    let value: string | undefined;

    value = this.changesValueString(changes, 'name');
    if (value !== undefined) {
      this.gist$.name = value;
      doUpdate = true;
    }
    value = this.changesValueString(changes, 'hover');
    if (value !== undefined) {
      this.gist$.hover = value;
      doUpdate = true;
    }
    value = this.changesValueString(changes, 'passive');
    if (value !== undefined) {
      this.gist$.passive = value;
      doUpdate = true;
    }
    if (doUpdate) this.init();
  }

  /**
   * Загрузка числового значения из события изменения.
   * @param changes - Объект описания изменений.
   * @param key     - Название переменной.
   */
  private changesValueString(changes: SimpleChanges, key: string): string | undefined {
    let change: SimpleChange;
    let ret: string | undefined = undefined;

    if (changes.hasOwnProperty(key)) {
      change = (changes as any)[key] as SimpleChange;
      ret = String(change.currentValue);
    }

    return ret;
  }

  protected get vName(): string {
    if (this.gist$.name) return this.gist$.name; else return '';
  }

  protected get vHover(): string {
    if (this.gist$.hover) return this.gist$.hover; else return '';
  }

  protected get vPassive(): string {
    if (this.gist$.passive) return this.gist$.passive; else return '';
  }

  protected get vWidthS(): string {
    if (this.gist$.width) return this.gist$.width.toString(); else return this.config.width.toString();
  }

  protected get vHeightS(): string {
    if (this.gist$.height) return this.gist$.height.toString(); else return this.config.height.toString();
  }

  protected get vIsPassive(): boolean {
    if (this.gist$.isPassive) return this.gist$.isPassive; else return false;
  }

  /** Защита вызова функции обращения к SVG элементу до инициализации view. */
  protected init(): void {
    if (!this.isView) return;
    if (!this.isAfterViewInitDone$) return;
    this.svgUpdate();
  }

  /** Инициализация SVG иконки, установка размера, установка переданной иконки по имени. */
  protected svgUpdate(): void {
    const attributes: NamedNodeMap = this.svg.nativeElement.attributes;
    let attr: Attr | null;

    // коробка отображения.
    attr = this.setAttr(attributes, 'viewBox', `0 0 ${this.vWidthS} ${this.vHeightS}`);
    this.svg.nativeElement.attributes.setNamedItem(attr!);
    // ширина.
    attr = this.setAttr(attributes, 'width', `${this.vWidthS}px`);
    this.svg.nativeElement.attributes.setNamedItem(attr!);
    // высота.
    attr = this.setAttr(attributes, 'height', `${this.vHeightS}px`);
    this.svg.nativeElement.attributes.setNamedItem(attr!);
    // Изменение ссылки на SVG спрайт.
    this.svg.nativeElement.childNodes.forEach((value: ChildNode): void => {
      const svgUse = value as SVGUseElement;
      switch (this.vIsPassive && this.vPassive !== '') {
        case true:
          attr = this.setAttr(svgUse.attributes, 'xlink:href', `${this.config.sprite}#${this.vPassive}`);
          break;
        default:
          if (this.isMouseOver && this.vHover !== '') {
            attr = this.setAttr(svgUse.attributes, 'xlink:href', `${this.config.sprite}#${this.vHover}`);
          } else {
            attr = this.setAttr(svgUse.attributes, 'xlink:href', `${this.config.sprite}#${this.vName}`);
          }
          break;
      }
      svgUse.attributes.setNamedItem(attr!);
    });
  }

  /**
   * Изменение атрибута HTML элемента.
   *
   * @param attributes - Карта аттрибутов объекта.
   * @param name       - Название атрибута.
   * @param value      - Значение атрибута.
   */
  private setAttr(attributes: NamedNodeMap, name: string, value: string): Attr | null {
    let ret: Attr | null;

    ret = attributes.getNamedItem(name);
    if (ret && ret.name === name) {
      ret.value = value;
    }

    return ret;
  }

  /** Событие наведения мышки на элемент. */
  public async onHover(): Promise<void> {
    this.isMouseOver = true;
    this.init();
  }

  /** Событие выхода мышки за пределы элемента. */
  public async onHout(): Promise<void> {
    this.isMouseOver = false;
    this.init();
  }
}
