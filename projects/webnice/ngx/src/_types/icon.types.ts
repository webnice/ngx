/** Данные для обновления иконки. */
export interface IIcon {
  /** Название активной иконки. */
  name?: string;

  /** Название иконки при наведении. */
  hover?: string;

  /** Название пассивной иконки. */
  passive?: string;

  /** Ширина иконки. */
  width?: number;

  /** Высота иконки. */
  height?: number;

  /** Стояние иконки пассивная/активная. */
  isPassive?: boolean;
}
