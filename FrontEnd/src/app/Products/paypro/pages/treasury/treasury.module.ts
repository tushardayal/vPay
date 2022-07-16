import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TreasuryPageRoutingModule } from './treasury-routing.module';

import { TreasuryPage } from './treasury.page';
import {SharedModule} from "../../../../components/shared.module";
import {ProductDetailsComponent} from "./product-details/product-details.component";
import {ViewDealComponent} from "./view-deal/view-deal.component";
import {ApsTraslatePipe} from "../../../../components/pipes/aps-traslate.pipe";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        TreasuryPageRoutingModule,
        SharedModule
    ],
    declarations: [TreasuryPage, ProductDetailsComponent, ViewDealComponent],
    entryComponents: [ViewDealComponent],
})
export class TreasuryPageModule {}
