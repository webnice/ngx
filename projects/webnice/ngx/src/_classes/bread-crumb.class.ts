// noinspection JSUnusedGlobalSymbols

import { Injectable, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { BreadCrumbService, IBreadCrumb } from '../_services';


/**
 * Базовый класс для компонентов хлебных крошек.
 * Предоставляет весь функционал без элементов дизайна.
 */
@Injectable()
export class BreadCrumb implements OnInit, OnDestroy {
  private waysSubscribe?: Subscription; // Подписка на сервис изменения хлебных крошек.

  /** Конструктор. */
  constructor(
    private breadCrumbService: BreadCrumbService,
  ) {
  }

  /** Инициализатор. */
  ngOnInit(): void {
    this.waysSubscribe = this.breadCrumbService.observer
      .subscribe((value: IBreadCrumb[]): void => this.onChange(value))
  }

  /** Деструктор. */
  ngOnDestroy(): void {
    if (this.waysSubscribe) {
      this.waysSubscribe.unsubscribe();
      this.waysSubscribe = undefined;
    }
  }

  /** Выгрузка значения хлебных крошек. */
  protected get ways(): IBreadCrumb[] {
    return this.breadCrumbService.ways;
  }

  /**
   * Истина, если хлебная крошка последняя в списке.
   * @param n - Порядковый номер хлебной крошки.
   */
  protected isLast(n: number): boolean {
    return n === this.ways.length - 1;
  }

  /**
   * Истина, если хлебная крошка не последняя в списке и у неё есть не пустая ссылка.
   * @param n - Порядковый номер хлебной крошки.
   */
  protected isLink(n: number): boolean {
    if (this.ways.length <= n) return false;
    return !this.isLast(n) && (this.ways[n].urnInternal !== undefined && this.ways[n].urnInternal !== '');
  }

  /**
   * Вызывается при любом изменении в хлебных крошках.
   * @param _value - Новое значение хлебных крошек.
   */
  protected onChange(_value: IBreadCrumb[]): void {
  }
}
