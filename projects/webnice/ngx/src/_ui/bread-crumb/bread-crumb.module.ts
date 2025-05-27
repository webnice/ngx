import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { BreadCrumbComponent } from './bread-crumb.component';


@NgModule({
  declarations: [
    BreadCrumbComponent,
  ],
  imports: [
    CommonModule,
    RouterLink,
  ],
  exports: [
    BreadCrumbComponent,
  ],
})
export class BreadCrumbModule {
}
