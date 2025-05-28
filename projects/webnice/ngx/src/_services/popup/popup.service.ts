// noinspection JSUnusedGlobalSymbols
// noinspection DuplicatedCode

import { Injectable } from '@angular/core';

import { AppearanceAnimation, DisappearanceAnimation } from '../../__old_trash_enums';
import { TextAlignEnum, ToastifyRemoteControl, ToastPosition, ToastTypeEnum } from '../../__old_trash_toastify';
import { IToastifyOptions } from '../../__old_trash_toastify';
import { ProgressBar } from '../../__old_trash_toastify';


@Injectable({
  providedIn: 'root',
})
export class PopupService {
  private readonly duration: number | undefined;

  /** Конструктор. */
  constructor() {
    this.duration = 7000; // 3 секунды.
  }

  /**
   * Базовые настройки всплывающей карточки.
   * @param message - Тело сообщения.
   */
  protected opt(message: string): Partial<IToastifyOptions> {
    return {
      text: message,
      layoutType: ToastTypeEnum.NEUTRAL,
      position: ToastPosition.TOP_RIGHT,
      progressBar: ProgressBar.INCREASE,
      textAlign: TextAlignEnum.START,
      animationIn: AppearanceAnimation.ELASTIC,
      animationOut: DisappearanceAnimation.FADE_OUT,
      showClose: true,
      showIcon: false,
    };
  }

  /**
   * Уведомление - сообщение, оформленное максимально нейтрально;
   * @param message  - Тело сообщения.
   * @param title    - Заголовок сообщения, не обязательный параметр.
   * @param duration - Переопределение времени отображения, не обязательный параметр.
   */
  public Notify(message: string, title: string | undefined, duration: number | undefined): void {
    const toast = new ToastifyRemoteControl();
    if (title === undefined) title = '';
    if (duration === undefined || duration === 0) duration = this.duration;
    toast.options = this.opt(message);
    toast.options.title = title;
    toast.options.autoCloseDuration = duration!;
    toast.options.layoutType = ToastTypeEnum.NEUTRAL;
    toast.openToast();
  }

  /**
   * Внимание - сообщение, содержащее не критическую ошибку;
   * @param message  - Тело сообщения.
   * @param title    - Заголовок сообщения, не обязательный параметр.
   * @param duration - Переопределение времени отображения, не обязательный параметр.
   */
  public Warning(message: string, title: string | undefined, duration: number | undefined): void {
    let toast: ToastifyRemoteControl

    try {
      toast = new ToastifyRemoteControl();
    } catch (e: unknown) {
      console.error(`Ошибка: ${e}`);
      return
    }
    if (title === undefined) title = '';
    if (duration === undefined || duration === 0) duration = this.duration;
    toast.options = this.opt(message);
    toast.options.title = title;
    toast.options.autoCloseDuration = duration!;
    toast.options.layoutType = ToastTypeEnum.WARNING;
    toast.openToast();
  }

  /**
   * Ошибка - сообщение, содержащее ошибку;
   * @param message  - Тело сообщения.
   * @param title    - Заголовок сообщения, не обязательный параметр.
   * @param duration - Переопределение времени отображения, не обязательный параметр.
   */
  public Error(message: string, title: string | undefined, duration: number | undefined): void {
    const toast = new ToastifyRemoteControl();
    if (title === undefined) title = '';
    if (duration === undefined || duration === 0) duration = this.duration;
    toast.options = this.opt(message);
    toast.options.title = title;
    toast.options.autoCloseDuration = duration!;
    toast.options.layoutType = ToastTypeEnum.DANGER;
    toast.openToast();
  }
}
