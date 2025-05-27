// noinspection JSUnusedGlobalSymbols

/** Описание типов значения поля. */
export type TValue = string | number | string[] | null;

/**
 * Класс добытчика/установщика для типа TValue.
 */
export class ValueClass {
  private value$: TValue = null;

  /**
   * Конструктор.
   * @param value - Первоначальное значение объекта класса.
   */
  constructor(value: TValue | undefined = undefined) {
    if (value === undefined) value = null;
    this.value$ = value;
  }

  /** Добытчик значение. */
  public get value(): TValue | undefined {
    return this.value$ === null ? undefined : this.value$;
  }

  /** Установщик значение. */
  public set value(value: TValue | undefined) {
    if (value === undefined) value = null;
    this.value$ = value;
  }

  /** Представление объекта в качестве строки. */
  public toString(): String {
    return String(this.value$ !== null ? this.value$ as any : '');
  }

  /** Экспорт объекта в JSON. */
  public toJSON(): TValue {
    return this.value$;
  }
}
