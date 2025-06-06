import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { NgClass, NgForOf } from '@angular/common';

import { ISize } from './page-size.types';


@Component({
  selector: 'page-size',
  standalone: true,
  templateUrl: './page-size.component.html',
  imports: [
    NgClass,
    NgForOf,
  ],
  styleUrl: './page-size.component.css'
})
export class PageSizeComponent {
  // Входящие и исходящие данные.
  @Input({alias: 'value', required: true}) public value: number;
  @Input({alias: 'sizes', required: true}) public sizes: ISize[];
  @Output('selected') public readonly selected: EventEmitter<number | undefined>;

  /**
   * Конструктор.
   */
  constructor() {
    [this.value, this.sizes, this.selected] = [0, [], new EventEmitter<number | undefined>];
  }

  // Завершение при скроллинге.
  @HostListener('window:scroll', ['$event'])
  public async onWindowScroll($event: UIEvent): Promise<void> {
    $event.stopPropagation();
    await this.onEnd();
  }

  // Завершение при изменении размеров окна.
  @HostListener('window:resize', ['$event'])
  public async onWindowResize($event: UIEvent): Promise<void> {
    $event.stopPropagation();
    await this.onEnd();
  }

  /**
   * Событие выбора элемента из списка.
   * @param $event   - Событие мышки.
   * @param selected - Выбранный элемент.
   */
  public async onSelect($event: MouseEvent, selected: number): Promise<void> {
    this.selected.next(selected);
    $event.preventDefault();
    $event.stopPropagation();
  }

  /** Событие выхода мышки за пределы компонента. */
  public async onEnd(): Promise<void> {
    this.selected.next(undefined);
  }
}
