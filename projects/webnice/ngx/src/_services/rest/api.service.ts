// noinspection JSUnusedGlobalSymbols

import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { throwError, lastValueFrom, map, Subscriber, } from 'rxjs';
import { Observable } from 'rxjs';
import { catchError, debounceTime } from "rxjs/operators";

import { IError } from '../../_types';
import { RestError } from '../../_classes';
import { PopupService } from '../popup';
import { ApiConfig, IApiCreateResponse } from './api.types';
import { IGetListOption, IGetListOptionFilter, IGetListOptionOrder } from './api.types';


// noinspection DuplicatedCode
@Injectable({
  providedIn: 'root',
})
export class ApiService {
  /**
   * Конструктор.
   * @param http        - HTTP клиент.
   * @param config      - Конфигурация API.
   * @param popup       - Сервис отображения карточек сообщений.
   */
  constructor(
    protected http: HttpClient,
    protected config: ApiConfig,
    protected popup: PopupService,
  ) {
  }

  /**
   * Формирование полной URI в соответствии с версией API из конфигурации.
   * @param suffix    - URN суффикс.
   */
  protected createUri(suffix: string): string {
    return this.config.backend + this.config.endpoint + suffix;
  }

  /**
   * Обработка стандартных ошибок.
   * @param error     - Объект ошибки.
   * @param next      - Следующая функция готовая обработать ошибку.
   */
  protected errors(error: HttpErrorResponse, next?: (error: any) => Promise<never>): Promise<never> {
    let serverError: IError | undefined = undefined;
    switch (error.status) {
      case 400:
        serverError = error.error as IError;
        return this.handleError(
          error,
          'Переданы не верные данные.',
          serverError,
          true
        );
      case 401:
        return this.handleError(
          error,
          'Попытка доступа не авторизованным пользователем. Требуется аутентификация.',
          serverError,
          true
        );
      case 403:
        return this.handleError(
          error,
          'Доступ к методу запрещён.',
          serverError,
          true
        );
      case 429:
        return this.handleError(
          error,
          'Слишком частые запросы. Помедленнее...',
          serverError,
          true
        );
      case 500:
        return this.handleError(error, 'Сервер не в состоянии вернуть ответ.', serverError);
      default:
        if (next !== undefined) {
          return next(error)
        } else {
          return this.handleError(
            error,
            `Сервер вернул неожиданную ошибку: ${error.status.toString()}`,
            serverError,
          );
        }
    }
  }

  /**
   * Отображение ошибки.
   * @param httpError       - Объект ошибки содержащий код ошибки.
   * @param message     - Сообщение об ошибке.
   * @param serverError - Объект серверной ошибки, формируется для кода 4xx.
   * @param showSnack   - Разрешение отобразить ошибку во всплывающей popup карточке.
   */
  protected async handleError(
    httpError: HttpErrorResponse,
    message: string,
    serverError: IError | undefined = undefined,
    showSnack: boolean = true,
  ): Promise<never> {
    const titleError: string = 'Ошибка!';
    const titleWarning: string = 'Внимание.';
    let title: string | undefined = undefined;
    let type: string;

    // Локализация стандартизированных ошибок.
    //message = await lastValueFrom(this.translation.get(message));
    try {
      type = httpError.status && httpError.status >= 400 && httpError.status <= 499 ? 'warning' : 'error';
      switch (type) {
        case 'warning':
          title = titleWarning;
          if (showSnack) this.popup.Warning(message, title, 0);
          break;
        case 'error':
          title = titleError;
          if (showSnack) this.popup.Error(message, title, 0);
          break;
        default:
          title = undefined;
          if (showSnack) this.popup.Notify(message, title, 0);
          break;
      }
    } catch (e: unknown) {
      console.warn('не обработанная ошибка: ', e);
    }

    return await lastValueFrom(throwError((): any => {
      const restError: RestError = new RestError(message, httpError as any, serverError);
      return restError as any;
    }));
  }

  /** Создание ключа для кеширования запросов. */
  protected key(uri: string, options?: IGetListOption, accessToken?: string): string {
    let params: HttpParams = new HttpParams();
    let ret: string = uri;

    if (options) {
      if (options.limit) {
        params = params.append('limit', `${options.limit.offset}:${options.limit.limit}`);
      }
      if (options.by) {
        options.by.forEach((order: IGetListOptionOrder): void => {
          params = params.append('by', `${order.name}:${order.type}`);
        });
      }
      if (options.filter) {
        options.filter.forEach((filter: IGetListOptionFilter): void => {
          params = params.append('filter', `${filter.name}:${filter.type}:${filter.value}`);
        });
      }
      ret += params.toString();
    }
    if (accessToken) {
      ret += `?accessToken=${accessToken}`;
    }

    return ret;
  }

  /**
   * Получение количества записей.
   * @param urn         - Uri для получения.
   * @param options     - Параметры, фильтры, сортировка, пагинация.
   * @param accessToken - Сессионный токен доступа.
   * @return            - Количество записей с учётом переданной фильтрации.
   */
  protected apiCount(urn: string, options?: IGetListOption, accessToken?: string): Observable<number> {
    const headers: HttpHeaders = new HttpHeaders();
    let params: HttpParams = new HttpParams();

    if (accessToken) urn += `?accessToken=${accessToken}`;
    if (options) {
      if (options.limit) params = params.append('limit', `${options.limit.offset}:${options.limit.limit}`);
      if (options.by) {
        options.by.forEach((order: IGetListOptionOrder): void => {
          params = params.append('by', `${order.name}:${order.type}`);
        });
      }
      if (options.filter) {
        options.filter.forEach((filter: IGetListOptionFilter): void => {
          params = params.append('filter', `${filter.name}:${filter.type}:${filter.value}`);
        });
      }
    }
    return this.http
      .get<number>(urn, {
        observe: 'response', params,
        headers,
      })
      .pipe(
        catchError((error: any): Promise<never> => this.errors(error)),
        map((response: HttpResponse<number>): any => (response as any).body),
        debounceTime(200),
      );
  }

  /**
   * Получение идентификаторов (без кеширования запросов).
   * @param urn         - Uri для получения.
   * @param options     - Параметры, фильтры, сортировка, пагинация.
   * @param accessToken - Сессионный токен доступа.
   * @return            - Массив идентификаторов доступных для загрузки сущностей.
   */
  protected apiListId(urn: string, options?: IGetListOption, accessToken?: string): Observable<number[]> {
    const headers: HttpHeaders = new HttpHeaders();
    let params: HttpParams = new HttpParams();

    if (accessToken) urn += `?accessToken=${accessToken}`;
    if (options) {
      if (options.limit) params = params.append('limit', `${options.limit.offset}:${options.limit.limit}`);
      if (options.by) {
        options.by.forEach((order: IGetListOptionOrder): void => {
          params = params.append('by', `${order.name}:${order.type}`);
        });
      }
      if (options.filter) {
        options.filter.forEach((filter: IGetListOptionFilter): void => {
          params = params.append('filter', `${filter.name}:${filter.type}:${filter.value}`);
        });
      }
    }
    return this.http
      .get<number[]>(urn, {
        observe: 'response', params,
        headers,
      })
      .pipe(
        catchError((error: any): Promise<never> => this.errors(error)),
        map((response: HttpResponse<number[]>): any => (response as any).body),
        debounceTime(200),
      );
  }

  /**
   * Получение подробной информации (без кеширования запросов).
   * @param uri         - Урл для получения.
   * @param ids         - Идентификаторы сущностей.
   * @param fnMap       - Функция обработки результата.
   * @param accessToken - Сессионный токен доступа.
   */
  protected apiListInfo<T>(
    uri: string,
    ids: number[],
    fnMap: (item: T) => T,
    accessToken?: string,
  ): Observable<T[]> {
    const headers: HttpHeaders = new HttpHeaders();

    if (accessToken) uri += `?accessToken=${accessToken}`;
    // Если запрашивается пустой список, сразу отдаём пустой ответ.
    if (ids.length === 0) {
      return new Observable<T[]>((data: Subscriber<T[]>): void => {
        data.next([]);
        data.complete();
      });
    }
    return this.http
      .get<T[]>(uri, {
        observe: 'response',
        headers,
      })
      .pipe(
        catchError((error: any): Promise<never> => this.errors(error, (error: any): Promise<never> => {
          switch (error.status) {
            case 404:
              return this.handleError(
                error,
                'Сущность отсутствует либо фильтрация исключила все результаты.',
                undefined,
                false
              );
            default:
              return this.handleError(error, `Сервер вернул неожиданную ошибку: ${error.status.toString()}`);
          }
        })),
        // Обработка данных функцией.
        map((response: HttpResponse<T[]>): any => (response as any).body.map(fnMap)),
        // Сортировка данных в порядке указанном в массиве идентификаторов.
        map((data: any): any[] => ids.map((id: number): any => data.find((item: any): boolean => item.id === +id)))
      );
  }

  /**
   * Создание новой сущности.
   * @param urn          - Урл для вызова метода API.
   * @param request      - Объект создаваемой сущности.
   * @param accessToken  - Сессионный токен доступа.
   * @param errorsFn     - Функция обработки дополнительных ошибок.
   * @description        - Стандартный метод API для создания сущностей на сервере.
   */
  protected apiCreate<T>(urn: string, request: T, accessToken?: string, errorsFn?: (error: any) => Promise<never>): Observable<number> {
    const headers: HttpHeaders = new HttpHeaders();

    if (accessToken) urn += `?accessToken=${accessToken}`;
    return this.http
      .post<IApiCreateResponse>(urn, request, {
        observe: 'response',
        headers,
      })
      .pipe(
        catchError((error: any): Promise<never> => this.errors(error, errorsFn)),
        map((response: HttpResponse<IApiCreateResponse>): any => (response as any).body),
        map((data: any): number => data.id as number),
        debounceTime(200),
      );
  }

  /**
   * Изменение свойств существующей сущности.
   * @param urn          - Урл для вызова метода API.
   * @param request      - Объект изменяемой сущности.
   * @param accessToken  - Сессионный токен доступа.
   * @param errorsFn     - Функция обработки дополнительных ошибок.
   * @description        - Метод изменяет часть свойств сущности.
   *                       Метод доступен аутентифицированному пользователю состоящему в группе администратор.
   */
  protected apiUpdate<T>(urn: string, request: T, accessToken?: string, errorsFn?: (error: any) => Promise<never>): Observable<void> {
    const headers: HttpHeaders = new HttpHeaders();

    if (accessToken) urn += `?accessToken=${accessToken}`;
    return this.http
      .patch<void>(urn, request, {
        observe: 'response',
        headers,
      })
      .pipe(
        catchError((error: any): Promise<never> => this.errors(error, errorsFn)),
        map((response: HttpResponse<void>): any => (response as any).body),
        debounceTime(200),
      );
  }

  /**
   * Удаление или пометка на удаление сущности на сервере.
   * @param urn         - Урл для вызова метода API.
   * @param accessToken - Сессионный токен доступа.
   */
  protected apiDelete<T>(urn: string, accessToken?: string): Observable<T> {
    const headers: HttpHeaders = new HttpHeaders();

    if (accessToken) urn += `?accessToken=${accessToken}`;
    return this.http
      .delete<T>(urn, {
        observe: 'response',
        headers,
      })
      .pipe(
        catchError((error: any): Promise<never> => this.errors(error, (error: any): Promise<never> => {
          switch (error.status) {
            case 404:
              return this.handleError(
                error,
                'Удаляемая сущность не найдена.',
                undefined,
                true,
              );
            case 424:
              return this.handleError(
                error,
                'Запись удалять запрещено, существует запись привязанная к удаляемой записи.',
                undefined,
                true
              );
            default:
              return this.handleError(error, `Сервер вернул неожиданную ошибку: ${error.status.toString()}`);
          }
        })),
        map((response: HttpResponse<T>): any => (response as any).body),
        debounceTime(200),
      );
  }
}
