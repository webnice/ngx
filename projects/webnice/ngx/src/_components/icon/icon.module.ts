import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IconComponent } from './icon.component';
import { _FEATURE_ICON_CONFIGS, IIconConfig } from './icon.types';


@NgModule({})
export class IconModule {
  static forFeature(
    sprite?: string,
    width: number = 0,
    height: number = 0,
  ): ModuleWithProviders<IconFeatureModule> {
    const defaultSprite = '/images/sprite-icons.full.svg';
    const defaultWidth: number = 24;
    const defaultHeight: number = 24;

    let config: IIconConfig = {
      sprite: sprite === undefined ? defaultSprite : sprite,
      width: width <= 0 ? defaultWidth : width,
      height: height <= 0 ? defaultHeight : height,
    };

    return {
      ngModule: IconFeatureModule,
      providers: [
        {
          provide: _FEATURE_ICON_CONFIGS,
          useValue: config,
        },
      ],
    }
  }
}

@NgModule({
  declarations: [
    IconComponent,
  ],
  imports: [
    CommonModule,
  ],
  exports: [
    IconComponent,
  ],
})
export class IconFeatureModule {
  constructor(
    // @Optional()
    // @Inject(_FEATURE_ICON_CONFIGS)
    // config: any
  ) {
  }
}
