import { TCssStyle } from '../_types';


/**
 * Объединение объектов стилей в один объект стиля.
 * @param style - @type(TCssStyle) Объекты стиля, переменное количество.
 */
export function styles(...style: TCssStyle[]): TCssStyle {
  let ret: TCssStyle = null;
  let n: number;

  for (n = 0; n < style.length; n++) {
    if (style[n] !== null && style[n] !== undefined) {
      if (ret === null) ret = {};
      Object.assign(ret, style[n], ret); // Объединение объектов.
    }
  }

  return ret;
}
