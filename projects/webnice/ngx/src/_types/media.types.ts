/** Константы названий размеров экрана браузера. */
export enum EMediaName {
  LO = 'lo',
  SL = 'sl',
  SM = 'sm',
  MD = 'md',
  LG = 'lg',
  XL = 'xl',
  XL2X = '2xl',
}

/** Описание диапазона размеров экрана в пикселях. */
export interface IMedia {
  /** Минимальное разрешение в пикселях. */
  min: number;
  /** Максимальное разрешение в пикселях. */
  max: number;
}

/** Соответствие названий размеров экрана браузера разрешению в пикселях.*/
export type TMediaMap = {
  // Минимальное разрешение.
  [p in EMediaName]: IMedia;
};

/** Карта соответствия названия размера разрешения браузера минимальному размеру в пикселях. */
export const mediaMap: TMediaMap = {
  [EMediaName.LO]: {min: 0, max: 359},
  [EMediaName.SL]: {min: 360, max: 639},
  [EMediaName.SM]: {min: 640, max: 767},
  [EMediaName.MD]: {min: 768, max: 1023},
  [EMediaName.LG]: {min: 1024, max: 1279},
  [EMediaName.XL]: {min: 1280, max: 1535},
  [EMediaName.XL2X]: {min: 1536, max: Number.MAX_SAFE_INTEGER},
};

/**
 * Вычисление на основе разрешения в пикселях константы размера экрана.
 * @param width  - Ширина экрана в пикселях.
 */
export function getMediaName(width: number): EMediaName {
  let ret: EMediaName = EMediaName.LO;
  Object.keys(mediaMap).forEach((key: string): void => {
    const k = key as EMediaName;
    if (width >= mediaMap[k].min && width <= mediaMap[k].max) ret = k;
  });
  return ret;
}

/**
 * Определение, является ли разрешение экрана мобильным.
 * @param width  - Ширина экрана в пикселях.
 * @param _height - Высота экрана в пикселях.
 */
export function getMediaIsMobile(width: number, _height: number): boolean {
  return width < mediaMap[EMediaName.MD].min;
}
