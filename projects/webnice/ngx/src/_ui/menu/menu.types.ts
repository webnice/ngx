import { ReplaySubject } from 'rxjs';

import { IIcon } from '../../_types';


/** Иконка для раздела без иконки. */
export const defaultIconName: IIconName = {
  active: 'empty-square-active',
  passive: 'empty-square-passive',
  hover: 'empty-square-hover',
};

/** Название иконок для спрайта. */
export interface IIconName {
  /** Иконка активная. */
  active: string;
  /** Иконка при наведении. */
  hover: string;
  /** Иконка пассивная. */
  passive: string;
}

/** Разделы меню. */
export interface ISection {
  doUpdate: boolean;
  urn: string;
  name: string;
  sticker?: number;
  isCurrent: boolean;
  isDisabled: boolean;
  iconActive: string;
  iconPassive: string;
  iconUpdate: ReplaySubject<IIcon>;
}
