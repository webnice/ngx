// noinspection JSUnusedGlobalSymbols
// noinspection DuplicatedCode

import { ApplicationRef, ComponentRef, createComponent, EmbeddedViewRef } from '@angular/core';
import { Subscription } from 'rxjs';

import { ITableEvent } from '../../_classes';
import { PageSizeComponent } from './page-size.component';
import { ISize } from './page-size.types';


/**
 * Динамическое создание объекта выбора размера страницы.
 * Добавление компонента в DOM дерево и обмен данным.
 * @param appRef     - Ссылка на приложение. @type(ApplicationRef).
 * @param size       - Текущий размер страницы. @type(number).
 * @param event      - Объект описания события. @type(ITableEvent).
 * @param callBackFn - Функция, которая будет вызвана после получения результата и уничтожения компонента.
 */
export function newPageSizeComponent(
  appRef: ApplicationRef,
  size: number = 25,
  event: ITableEvent,
  callBackFn: (v: number) => void,
): void {
  const elm: HTMLElement | null = (event.target as HTMLElement);
  const componentRef: ComponentRef<PageSizeComponent> = createComponent<PageSizeComponent>(PageSizeComponent, {
    environmentInjector: appRef.injector,
  })
  // Передача данных в компонент.
  componentRef.setInput('value', size);
  componentRef.setInput('sizes', newSizes());
  componentRef.changeDetectorRef.detectChanges();
  // Подписка на событие результата.
  const sub: Subscription = componentRef.instance.selected.subscribe((v: number | undefined): void => {
    if (v !== undefined && callBackFn !== undefined) callBackFn(v);
    appRef.detachView(componentRef.hostView);
    componentRef.destroy();
    sub.unsubscribe();
  });
  appRef.attachView(componentRef.hostView);
  if (elm) {
    // Добавление компонента к HTML элементу события.
    elm.append((<EmbeddedViewRef<any>>componentRef.hostView).rootNodes[0]);
    // Позиционирование с привязкой к HTML элементу события.
    componentRef.location.nativeElement.style.position = 'absolute';
    componentRef.location.nativeElement.style.setProperty('margin-left', (4 - event.rect.width).toString() + 'px');
    componentRef.location.nativeElement.style.setProperty('margin-top', (8).toString() + 'px');
  } else {
    // Добавление компонента в конец DOM дерева.
    document.body.append((<EmbeddedViewRef<any>>componentRef.hostView).rootNodes[0]);
    // Позиционирование по абсолютным координатам.
    componentRef.location.nativeElement.style.position = 'absolute';
    componentRef.location.nativeElement.style.left = (event.rect.x).toString() + 'px';
    componentRef.location.nativeElement.style.top = (event.rect.y).toString() + 'px';
  }
}

/** Создание массива размеров страниц. */
function newSizes(): ISize[] {
  return [
    {label: '3', value: 3},
    {label: '10', value: 10},
    {label: '15', value: 15},
    {label: '20', value: 20},
    {label: '25', value: 25},
    {label: '30', value: 30},
    {label: '50', value: 50},
    {label: '100', value: 100},
    {label: '250', value: 250},
    {label: '500', value: 500},
    // {label: 'Все', value: Number.MAX_SAFE_INTEGER},
  ];
}
