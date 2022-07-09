import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {TreasuryPage} from './treasury.page';
import {ProductDetailsComponent} from "./product-details/product-details.component";

const routes: Routes = [
  {
    path: '',
    component: TreasuryPage
  }, {
    path: 'product-details/:id',
    component: ProductDetailsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TreasuryPageRoutingModule {}
