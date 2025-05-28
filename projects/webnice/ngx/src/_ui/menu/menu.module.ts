import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';

import { mediaReducer } from '../../_reducers';
import { IconModule } from '../../_components';

import { MenuRoutingModule } from './menu.routes';
import { MenuComponent } from './menu.component';


@NgModule({
  declarations: [
    MenuComponent,
  ],
  imports: [
    CommonModule,
    MenuRoutingModule,
    IconModule.forFeature(),
    StoreModule.forFeature({name: 'media', reducer: mediaReducer}),
  ],
  exports: [
    MenuComponent,
  ],
})
export class MenuModule {
}
