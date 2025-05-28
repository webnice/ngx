// noinspection JSUnusedGlobalSymbols

/** Отсутствие даты и времени. */
export const TimeZero: string = '0001-01-01T00:00:00Z';

/** Конфигурация запросов к API. */
export class ApiConfig {
  endpoint!: string;
  backend!: string;
}

/** Данные заголовка с рекомендуемым временем ожидания до следующего запроса. */
export interface IResponseWithRetryAfter {
  waitTimeSec?: number;
}

/**
 * Параметры запросов с сортировкой, фильтрацией и ограничениями.
 * Документация: https://github.com/webnice/f8n
 */
export interface IGetListOption {
  limit?: IGetListOptionLimit;
  by?: IGetListOptionOrder[];
  filter?: IGetListOptionFilter[];
}

/**
 * Тип способа сравнения значения для фильтрации запросов.
 * Документация: https://github.com/webnice/f8n
 */
export type IGetListOptionType = 'eq' | 'lt' | 'le' | 'gt' | 'ge' | 'ne' | 'ke' | 'kn' | 'in' | 'ni';

export interface IGetListOptionLimit {
  /** Количество элементов в ответе. */
  limit?: number;
  /** Порядковый номер первого элемента. */
  offset?: number;
}

export interface IGetListOptionOrder {
  /** Имя поля объекта. */
  name: string;
  /** Порядок сортировки. */
  type: 'asc' | 'desc' | 'none';
}

/** Фильтрация данных. */
export interface IGetListOptionFilter {
  /** Имя поля. */
  name: string;
  /** Способ сравнения. */
  type: IGetListOptionType;
  /** Значение фильтрации. */
  value: string;
}

/** Стандартный ответ сервера на запрос создания новой сущности. */
export interface IApiCreateResponse {
  /** Уникальный идентификатор созданной сущности. */
  id: number;
}

/**
 * Режим выбора и применения фильтрации.
 * 'input'       - Режим по умолчанию - фильтрация задаётся полем ввода свободного значения и применяется к данным
 *                 методами: 'ke', 'kn'
 * 'datepicker'  - Тип фильтрации по дате. Фильтрация задаётся через выбор даты и применяется к данным
 *                 методами: 'eq', 'lt', 'le', 'gt', 'ge', 'ne'
 */
export type TFiltrationType = 'input' | 'datepicker'

/** Тип фильтрации контента для сводной таблицы. */
export type TContentFiltration = {
  /** Название фильтра. */
  name: string;
  /** Наименование колонки фильтрации для передачи в запрос фильтрации. */
  field: string;
  /** Тип сравнения значения. */
  type: IGetListOptionType;
  /** Режим выбора и применения фильтрации.  */
  mode?: TFiltrationType;
}
