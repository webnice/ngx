/** Состояние меню. */
export interface Condition {
  /** Состояние отображения меню. */
  view: View;
  /** Истина - вид интерфейса меню "мобильный". */
  isMobile: boolean;
  /** Заголовок меню. */
  title?: string;
  /** Текущее значение роутинга - текущий раздел. */
  urnCurrent?: string;
}

/**
 * Тип состояния отображения меню.
 * @property 'open'  - Отображается;
 * @property 'close' - Скрыто;
 * @property 'thin'  - Отображается в сжатом виде, в виде иконок;
 */
export type View = 'open' | 'close' | 'thin';

/** Полные настройки всех разделов меню. */
export interface IMenu {
  /**
   * Заголовок меню.
   * Если определён, в момент настройки меню, присваивается свойству Condition.title.
   */
  title?: string;
  /** Элементы меню. */
  items?: IMenuItem[];
}

/** Один элемент меню. */
export interface IMenuItem {
  /** Уникальный идентификатор раздела меню. */
  urn: string;
  /** Истина - элемент меню отображается, но не доступен для выбора и клика. */
  isDisabled?: boolean;
  /**
   * Заголовок раздела меню,
   * Если определён, в момент переключения роутинга, присваивается свойству Condition.title.
   */
  title?: string;
  /** Название раздела меню. */
  name?: string;
  /** Наклейка с числом - количеством уведомлений. */
  sticker?: number;
  /** Иконка активного раздела. */
  iconActive?: string;
  /** Иконка отключённого или текущего раздела. */
  iconPassive?: string;
  /** Иконка при наведении раздела. */
  iconHover?: string;
  /** Элементы меню нижнего уровня. */
  // TODO: Сделать вложенное меню. items?: IMenuItem[];
}
