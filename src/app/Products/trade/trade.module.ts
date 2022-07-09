import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SharedModule } from 'src/app/components/shared.module';
import {TranslateModule, TranslatePipe} from '@ngx-translate/core';
import { TradePageRoutingModule } from './trade-routing.module';
import {
  LetterOfCreditViewPage,
  LetterOfCreditAmendViewPage,
  ShippingGuaranteeViewPage,
  BillAcceptanceViewPage,
  BillPaymentTradeViewPage,
  OTTPaymentViewPage,
  RequestFinanceViewPage,
  BankGuaranteeViewPage,
  BankGuaranteeAmendViewPage,
  BillPresentmentViewPage,
  RequestFinanceExportViewPage
} from './pages/transactions';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SharedModule,
    TradePageRoutingModule,
    TranslateModule
  ],
  declarations: [
    LetterOfCreditViewPage,
    LetterOfCreditAmendViewPage,
    ShippingGuaranteeViewPage,
    BillAcceptanceViewPage,
    BillPaymentTradeViewPage,
    RequestFinanceViewPage,
    OTTPaymentViewPage,
    BankGuaranteeViewPage,
    BankGuaranteeAmendViewPage,
    BillPresentmentViewPage,
    RequestFinanceExportViewPage
  ],
})
export class TradePageModule { }
