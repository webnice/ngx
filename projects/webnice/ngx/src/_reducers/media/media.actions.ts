import { Action } from '@ngrx/store';

import { EMediaName } from '../../_types';


/** События редуктора. */
export enum MediaActions {
  MediaUpdate = '[Media State] MediaUpdate',
  MediaGet = '[Media State] MediaGet',
}

/** Разрешение экрана. */
export interface MediaSize {
  /** Ширина экрана. */
  Width: number;
  /** Высота экрана. */
  Height: number;
}

/** Общее состояние медиа. */
export interface Media {
  /** Ширина экрана. */
  Width: number;
  /** Высота экрана. */
  Height: number;
  /** Названий размеров экрана. */
  MediaName: EMediaName;
  /** Мобильное устройство = "истина". */
  IsMobile: boolean;
  /** Устройство поддерживает TouchDevice. */
  IsTouch: boolean;
}

/** Обновление. */
export class MediaUpdate implements Action {
  readonly type: MediaActions.MediaUpdate = MediaActions.MediaUpdate;

  constructor(
    public payload: { mediaSize: MediaSize },
  ) {
  }
}

/** Получение. */
export class MediaGet implements Action {
  readonly type: MediaActions.MediaGet = MediaActions.MediaGet;

  constructor(
    public payload: { media: Media },
  ) {
  }
}

/** Действия как тип данных. */
export type MediaUnion = MediaUpdate | MediaGet;
