// noinspection JSUnusedGlobalSymbols

import { AfterViewInit, ChangeDetectorRef, Injectable, InputSignal, TemplateRef } from '@angular/core';

import { TCssStyle, TNgClass } from '../_types';
import { styles } from '../_utilities';
import { TSvgTemplateStyle } from './svg.types';


/**
 * Базовый класс для компонентов встроенных SVG картинок.
 *
 * @example
 * Пример HTML:
 * <ng-container *ngTemplateOutlet="tpl; context: {$implicit: styles}"></ng-container>
 *
 * @example
 * Пример шаблона:
 * <ng-template #tplName let-opt>
 *   <svg
 *     [ngStyle]="opt.style"
 *     [ngClass]="opt.class"
 *     ...
 *   </svg>
 * </ng-template>
 */
@Injectable()
export class SvgClass implements AfterViewInit {
  protected readonly width!: InputSignal<number>; // Ширина.
  protected readonly height!: InputSignal<number>; // Высота.
  protected readonly class!: InputSignal<string[]>; // CSS классы.

  /** Конструктор. */
  constructor(
    protected changeDetectorRef: ChangeDetectorRef,
  ) {
  }

  /** Событие завершения отображения элементов HTML страницы. */
  ngAfterViewInit(): void {
    this.changeDetectorRef.detectChanges();
  }

  /** Ссылка на шаблон. */
  protected get tpl(): TemplateRef<any> | null {
    return null;
  }

  /** Функция получения списка классов с возможностью переопределения в потомке. */
  protected get defClass(): string[] {
    let ret: string[] = [];
    if (this.class === undefined) return ret;
    if (this.class().length > 0) ret = this.class();
    return ret;
  }

  /** Настройки объекта комплексного стиля. */
  protected get styles(): TSvgTemplateStyle {
    let s: TCssStyle = null;
    let c: TNgClass = null;
    if (this.width) s = styles(s, {'width': `${this.width()}px`});
    if (this.height) s = styles(s, {'height': `${this.height()}px`});
    if (this.defClass.length > 0) c = this.defClass;
    return {style: s, class: c};
  }
}
