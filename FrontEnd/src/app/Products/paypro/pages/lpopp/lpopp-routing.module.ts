import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LpoppPage } from './lpopp.page';
import {InstituitionTypesComponent} from "./instituition-types/instituition-types.component";
import {LpoppService} from "./lpopp.service";

const routes: Routes = [
  {
    path: 'institution-list',
    component: InstituitionTypesComponent
  }, {
    path: 'lpopp-initiate',
    component: LpoppPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [LpoppService]
})
export class LpoppPageRoutingModule {}
