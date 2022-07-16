import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TransactionEnquiryPageRoutingModule } from './transaction-enquiry-routing.module';

import { TransactionEnquiryPage } from './transaction-enquiry.page';
import { SharedModule } from 'src/app/components/shared.module';
import { CurrencyFormatPipe } from 'src/app/components/pipes/currency-format-pipe.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { TransactionLogPage } from './transaction-log/transaction-log.page';
import { TransactionSummaryPage } from './transaction-summary/transaction-summary.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SharedModule,
    TranslateModule,
    TransactionEnquiryPageRoutingModule
  ],
  declarations: [
    TransactionEnquiryPage,
    TransactionLogPage,
    TransactionSummaryPage
  ],
  providers: [CurrencyFormatPipe]
})
export class TransactionEnquiryPageModule {}
