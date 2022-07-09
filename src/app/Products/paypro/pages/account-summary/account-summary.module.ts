import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AccountSummaryPage } from './account-summary.page';
import {RouterModule} from "@angular/router";
import {SuperTabsModule} from "@ionic-super-tabs/angular";
import { SharedModule } from 'src/app/components/shared.module';
import { ExchangeCurrencyPopoverComponent } from './exchangeCurrencyPopover/exchange-currency-popover.component';
import { TranslateModule } from '@ngx-translate/core';
import {AccountSummaryGraphComponent} from "../mis/account-summary-graph/account-summary-graph.component";
import {MISPageModule} from "../mis/mis.module";
import {GroupSummaryComponent} from "./group-summary/group-summary.component";
import {AccountSummaryGuard} from "./account-summary.guard";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SuperTabsModule,
    SharedModule,
    TranslateModule,
    RouterModule.forChild([
      {
        path: '',
        component: AccountSummaryPage,
        canActivate: [AccountSummaryGuard]
      },
      {
        path: 'group-summary',
        component: GroupSummaryComponent,
      }
    ])

  ],
  entryComponents: [ExchangeCurrencyPopoverComponent],
  declarations: [AccountSummaryPage, GroupSummaryComponent, ExchangeCurrencyPopoverComponent],
})
export class AccountSummaryPageModule {}
