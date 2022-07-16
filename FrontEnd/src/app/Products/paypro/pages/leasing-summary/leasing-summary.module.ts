import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LeasingSummaryPageRoutingModule } from './leasing-summary-routing.module';

import { LeasingSummaryPage } from './leasing-summary.page';
import {SharedModule} from "../../../../components/shared.module";
import {LeasingViewComponent} from "./leasing-view/leasing-view.component";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LeasingSummaryPageRoutingModule,
    SharedModule
  ],
  declarations: [LeasingSummaryPage, LeasingViewComponent]
})
export class LeasingSummaryPageModule {}
