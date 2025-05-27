import { TCssStyle, TNgClass } from '../_types';


/** Описание комплексного стиля, передаваемого в шаблон. */
export interface TSvgTemplateStyle {
  style: TCssStyle | null,
  class: TNgClass | null,
}
