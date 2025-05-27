import { AppearanceAnimation, DisappearanceAnimation } from '../../__old_trash_enums';
import { ProgressBar, TextAlignEnum, ToastPosition, ToastTypeEnum } from '../enums';


export interface IToastifyOptions {
  animationIn: AppearanceAnimation;
  animationOut: DisappearanceAnimation;
  position: ToastPosition;
  autoCloseDuration: number;
  progressBar: ProgressBar;
  layoutType: ToastTypeEnum;
  textAlign: TextAlignEnum;
  showClose: boolean;
  showIcon: boolean;
  text: string;
  title: string;
}
