import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {IonicModule} from '@ionic/angular';

import {MISPage} from './mis.page';
import {SuperTabsModule} from "@ionic-super-tabs/angular";
import {RouterModule} from "@angular/router";
import {AccountSummaryGraphComponent} from "./account-summary-graph/account-summary-graph.component";
import {PaymentVolumeComponent} from "./payment-volume/payment-volume.component";
import {ExchangeCurrencyPopoverComponent} from "../account-summary/exchangeCurrencyPopover/exchange-currency-popover.component";
import {SharedModule} from "../../../../components/shared.module";
import {AccountSummaryGuard} from "../account-summary/account-summary.guard";
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
    imports: [
        TranslateModule,
        CommonModule,
        FormsModule,
        IonicModule,
        SuperTabsModule,
        RouterModule.forChild([
            {
                path: '',
                component: MISPage
            },
            {
                path: 'account-summary-graph',
                component: AccountSummaryGraphComponent,
            },
            {
                path: 'payment-volume',
                component: PaymentVolumeComponent
            }
        ]),
        SharedModule,
    ],
    entryComponents: [AccountSummaryGraphComponent, PaymentVolumeComponent],
    declarations: [MISPage, AccountSummaryGraphComponent, PaymentVolumeComponent],
    exports: [AccountSummaryGraphComponent]
})
export class MISPageModule {
}
