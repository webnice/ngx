import { Pipe, PipeTransform, ChangeDetectorRef, LOCALE_ID, Inject, OnDestroy } from '@angular/core';
import { formatDate } from '@angular/common';
import { ReplaySubject, Subscription } from "rxjs";

const defaultFormat = 'dd.MM.yyyy HH:mm:ss';


@Pipe({
  name: 'localizedDate',
  pure: false
})
export class LocalizedDatePipe implements PipeTransform, OnDestroy {
  private readonly formatSubject$: ReplaySubject<string>; // Источник формата даты и времени.
  private onTranslationChange?: Subscription;
  private onLangChange?: Subscription;
  private onDefaultLangChange?: Subscription;
  private value: string;
  private lastDateValue: Date | string | undefined;

  constructor(
    private ref: ChangeDetectorRef,
    @Inject(LOCALE_ID) private locale: string,
  ) {
    this.formatSubject$ = new ReplaySubject(1); // Буфер в одно значение.
    this.formatSubject$.next(defaultFormat); // Первое значение по умолчанию.
    this.onTranslationChange = undefined;
    this.onLangChange = undefined;
    this.onDefaultLangChange = undefined;
    this.value = '';
    this.lastDateValue = undefined;
  }

  updateValue(dateValue: Date | string | number): void {
    const onTranslation: (format: string) => void = (format: string): void => {
      setTimeout((): void => {
        this.value = formatDate(dateValue, format, this.locale);
        this.ref.detectChanges();
      });
    };
    this.formatSubject$.subscribe((res: string): void => onTranslation(res));
  }

  transform(dateValue: Date | string): any {
    if (equals(dateValue, this.lastDateValue)) {
      return this.value;
    }
    this.lastDateValue = dateValue;
    this.updateValue(dateValue);

    return '';
  }

  /** Очистка любой существующей подписки, чтобы изменить события. */
  private _dispose(): void {
    if (this.onTranslationChange !== undefined) {
      this.onTranslationChange.unsubscribe();
      this.onTranslationChange = undefined;
    }
    if (this.onLangChange !== undefined) {
      this.onLangChange.unsubscribe();
      this.onLangChange = undefined;
    }
    if (this.onDefaultLangChange != undefined) {
      this.onDefaultLangChange.unsubscribe();
      this.onDefaultLangChange = undefined;
    }
  }

  /** Деструктор. */
  ngOnDestroy(): void {
    this._dispose();
  }
}

/**
 * Определяет, эквивалентны ли два объекта или два значения.
 *
 * Два объекта или значения считаются эквивалентными, если верно хотя бы одно из следующих значений:
 *
 * * Оба объекта или значения сравнимы через `===`.
 * * Оба объекта или значения имеют один и тот же тип, и все их свойства равны, сравнивая их через `equals`.
 *
 * @param o1 - Объект или значение для сравнения.
 * @param o2 - Объект или значение для сравнения.
 * @returns  - true если аргументы равны.
 */
function equals(o1: any, o2: any): boolean {
  if (o1 === o2) {
    return true;
  }
  if (o1 === null || o2 === null) {
    return false;
  }
  if (o1 !== o1 && o2 !== o2) {
    return true;
  }
  const t1: "string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "object" | "function" =
    typeof o1, t2: "string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "object" | "function" =
    typeof o2;
  let length: number, key: any, keySet: any;
  if (t1 === t2 && t1 === 'object') {
    if (Array.isArray(o1)) {
      if (!Array.isArray(o2)) {
        return false;
      }
      if ((length = o1.length) === o2.length) {
        for (key = 0; key < length; key++) {
          if (!equals(o1[key], o2[key])) {
            return false;
          }
        }
        return true;
      }
    } else {
      if (Array.isArray(o2)) {
        return false;
      }
      keySet = Object.create(null);
      for (key in o1) {
        if (!equals(o1[key], o2[key])) {
          return false;
        }
        keySet[key] = true;
      }
      for (key in o2) {
        if (!(key in keySet) && typeof o2[key] !== 'undefined') {
          return false;
        }
      }
      return true;
    }
  }

  return false;
}
