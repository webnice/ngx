import { InjectionToken } from '@angular/core';

export const _FEATURE_ICON_CONFIGS = new InjectionToken(
  '@webnice/ngx Icon Module Config'
);

/** Конфигурация. */
export interface IIconConfig {
  /** Путь и имя файла спрайта SVG иконок. */
  sprite?: string,
  /** Ширина иконки по-умолчанию */
  width: number,
  /** Высота иконки по-умолчанию */
  height: number,
}
