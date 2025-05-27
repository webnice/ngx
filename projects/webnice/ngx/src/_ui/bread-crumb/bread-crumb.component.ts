import { Component } from '@angular/core';

import { BreadCrumb } from '../../_classes';
import { BreadCrumbService } from '../../_services';


@Component({
  selector: 'ui-bread-crumb',
  standalone: false,
  templateUrl: './bread-crumb.component.html',
  styleUrl: './bread-crumb.component.css'
})
export class BreadCrumbComponent extends BreadCrumb {
  /** Конструктор. */
  constructor(breadCrumbService: BreadCrumbService) {
    super(breadCrumbService);
  }
}
