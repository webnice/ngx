// noinspection JSUnusedGlobalSymbols

import { HttpErrorResponse } from '@angular/common/http';

import { IError } from '../_types';


/**
 * Класс ошибки возникающей при работе с REST API.
 * Класс содержит все данные, которые можно извлечь из всех возникших и пришедших с сервера ошибок.
 */
export class RestError {
  private readonly message$: string;
  private readonly httpError$: HttpErrorResponse;
  private readonly serverError$?: IError;
  private readonly error$: Error;

  /** Конструктор. */
  constructor(
    message: string,
    httpError: HttpErrorResponse,
    serverError: IError | undefined = undefined,
    options: ErrorOptions | undefined = undefined,
  ) {
    [this.message$, this.httpError$, this.serverError$] = [message, httpError, serverError];
    this.error$ = new Error(message, options);
  }

  /**
   * Основное сообщение об ошибке.
   * При возможности локализуется.
   */
  public get message(): string {
    return this.message$;
  }

  /** Объект ошибки запроса HttpErrorResponse. */
  public get httpErrorResponse(): HttpErrorResponse {
    return this.httpError$;
  }

  /** Объект ошибки полученный с сервера IError. */
  public get serverError(): IError {
    const ret: IError = {};
    if (this.serverError$ !== undefined) ret.error = this.serverError$.error;
    return ret;
  }

  /** Объект стандартной ошибки Error, создаваемой при вызове throwError(). */
  public get error(): Error {
    return this.error$;
  }

  /** Представление объекта в качестве строки. */
  public toString(): String {
    return String(this.error$.message);
  }
}
