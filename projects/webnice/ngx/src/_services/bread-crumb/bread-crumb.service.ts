// noinspection JSUnusedGlobalSymbols

import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';

import { IBreadCrumb } from './bread-crumb.types';


/**
 * Сервис хлебных крошек и названия раздела.
 */
@Injectable({
  providedIn: 'root'
})
export class BreadCrumbService {
  private readonly ways$: ReplaySubject<IBreadCrumb[]>;
  private lastWays$: IBreadCrumb[];

  /** Конструктор. */
  constructor() {
    this.lastWays$ = [];
    this.ways$ = new ReplaySubject<IBreadCrumb[]>(1);
  }

  /** Буферизированный канал изменений в хлебных крошках. */
  public get observer(): ReplaySubject<IBreadCrumb[]> {
    return this.ways$
  }

  /** Выгрузка последнего значения хлебных крошек. */
  public get ways(): IBreadCrumb[] {
    return this.lastWays$;
  }

  /** Установка нового значения хлебных крошек. */
  public set ways(value: IBreadCrumb[]) {
    this.lastWays$ = value;
    this.ways$.next(this.lastWays$);
  }

  /** Добавление секции к существующим значениям хлебных крошек. */
  public add(value: IBreadCrumb): void {
    this.lastWays$.push(value);
    this.ways$.next(this.lastWays$);
  }

  /** Очистка хлебных крошек. */
  public clean(): void {
    this.lastWays$ = [];
    this.ways$.next(this.lastWays$);
  }
}
