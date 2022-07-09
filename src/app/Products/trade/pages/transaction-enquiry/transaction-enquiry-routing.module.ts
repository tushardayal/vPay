import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TransactionEnquiryPage } from './transaction-enquiry.page';
import { TransactionLogPage } from './transaction-log/transaction-log.page';
import { TransactionSummaryPage } from './transaction-summary/transaction-summary.page';

const routes: Routes = [
  {
    path: '',
    component: TransactionEnquiryPage
  },
  {
    path: 'log/:id',
    component: TransactionLogPage
  },
  {
    path: 'summary/:id',
    component: TransactionSummaryPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TransactionEnquiryPageRoutingModule {}
