import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LeasingSummaryPage } from './leasing-summary.page';
import {LeasingViewComponent} from "./leasing-view/leasing-view.component";

const routes: Routes = [
  {
    path: '',
    component: LeasingSummaryPage
  }, {
    path: 'view/:id',
    component: LeasingViewComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LeasingSummaryPageRoutingModule {}
