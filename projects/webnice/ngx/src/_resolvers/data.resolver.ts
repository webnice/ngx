import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { Observable, Subscriber } from 'rxjs';


/** Функция получения данных, передаваемая в функции-разрешителя данных для роутинга. */
export type TDataResolverFn<T1> = (route: ActivatedRouteSnapshot) => Observable<T1> | Promise<T1> | T1;

/**
 * Создание функции-разрешителя данных для роутинга.
 * Выполнена как безопасная обёртка для передаваемой извне функции загрузки данных.
 * @param loaderFn - Функция, выполняет загрузку данных.
 */
export const DataResolver: <T1>(loaderFn: TDataResolverFn<T1>) => ResolveFn<T1> =
  <T1>(loaderFn: TDataResolverFn<T1>): ResolveFn<T1> =>
    (route: ActivatedRouteSnapshot): Observable<T1> | Promise<T1> | T1 => {
      const defaultData: Partial<T1> = {};
      let ret: Observable<T1> | Promise<T1> | T1;

      try {
        ret = loaderFn(route);
      } catch (e: unknown) {
        console.error(`Выполнение внешней функции loaderFn прервано ошибкой: ${e}`);
        ret = new Observable<T1>((observer: Subscriber<T1>): void => {
          observer.next(defaultData as T1);
        });
      }

      return ret;
    };
