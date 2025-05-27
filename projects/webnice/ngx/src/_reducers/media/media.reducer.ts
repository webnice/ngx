/**
 * Редуктор помощника для медиа запросов.
 *
 * @example
 * constructor(
 *   private store: Store,
 * ) ...
 *
 *     this.storeSubscription = this.store.subscribe((s: Object) => {
 *       const media: MediaState = (s as any).media as MediaState;
 *
 *       console.log(media);
 *
 *     });
 *     this.store.dispatch(new MediaUpdate({media: {Width: 0, Height: 0, MediaName: EMediaName.LO, IsMobile: false}}));
 */

import { Media, MediaActions, MediaSize, MediaUnion } from './media.actions';
import { EMediaName, getMediaIsMobile, getMediaName } from '../../_types';


/** Описание состояния медиа. */
export interface MediaState {
  media: Media;
}

/** Инициализатор первоначального состояния медиа. */
const initialState: MediaState = {
  media: {
    Width: 0,
    Height: 0,
    MediaName: EMediaName.LO,
    IsMobile: false,
    IsTouch: false,
  },
};

/** Основная функция редуктора. */
export function mediaReducer(
  state: MediaState = initialState,
  action: MediaUnion,
) {
  switch (action.type) {
    case MediaActions.MediaUpdate:
      const isTouchDevice: () => boolean = () => 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const media: MediaSize = action.payload.mediaSize;
      const newState: MediaState = {
        ...state,
        media: {
          Width: media.Width,
          Height: media.Height,
          MediaName: getMediaName(media.Width),
          IsMobile: getMediaIsMobile(media.Width, media.Height),
          IsTouch: false,
        },
      };
      try {
        newState.media.IsTouch = isTouchDevice();
      } catch (e: unknown) {
        console.error(`Определение TouchDevice прервано ошибкой: ${e}`);
      }
      return newState;
    case MediaActions.MediaGet:
      return {
        ...state,
        media: action.payload.media,
      };
    default:
      return state;
  }
}
