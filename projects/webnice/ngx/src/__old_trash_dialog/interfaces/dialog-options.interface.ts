import { AppearanceAnimation, DisappearanceAnimation } from '../../__old_trash_enums';


export interface IDialogOptions {
  width: string;
  height: string;
  minWidth: string;
  maxWidth: string;
  minHeight: string;
  maxHeight: string;
  fullScreen: boolean;
  showOverlay: boolean;
  animationIn: AppearanceAnimation;
  animationOut: DisappearanceAnimation;
}
