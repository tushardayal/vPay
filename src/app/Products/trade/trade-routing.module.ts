import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from "@ionic/angular";
import { CommonModule } from "@angular/common";
import { TranslateModule } from '@ngx-translate/core';
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



const routes: Routes = [
  {
    path: 'listing/:product',
    loadChildren: () => import('../../listing/listing.module').then(m => m.ListingPageModule)
  },
  {
    path: 'view',
    children: [
      {
        path: 'letterofcredit/:id',
        component: LetterOfCreditViewPage
      }, {
        path: 'letterofcreditamend/:id',
        component: LetterOfCreditAmendViewPage
      }, {
        path: 'shippingguarantee/:id',
        component: ShippingGuaranteeViewPage
      }, {
        path: 'tradebillacceptance/:id',
        component: BillAcceptanceViewPage
      }, {
        path: 'tradebillpaymentrequest/:id',
        component: BillPaymentTradeViewPage
      }, {
        path: 'ott/:id',
        component: OTTPaymentViewPage
      }, {
        path: 'importrequestfinance/:id',
        component: RequestFinanceViewPage
      }, {
        path: 'bankguarantee/:id',
        component: BankGuaranteeViewPage
      }, {
        path: 'bankguaranteeamend/:id',
        component: BankGuaranteeAmendViewPage
      }, {
        path: 'tradebillpresentment/:id',
        component: BillPresentmentViewPage
      }, {
        path: 'exportrequestfinance/:id',
        component: RequestFinanceExportViewPage
      }
    ]
  },
  {
    path: 'transaction-enquiry',
    loadChildren: () => import('./pages/transaction-enquiry/transaction-enquiry.module')
    .then(m => m.TransactionEnquiryPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes), IonicModule, CommonModule, TranslateModule],
  exports: [RouterModule],
})
export class TradePageRoutingModule { }
