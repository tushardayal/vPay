import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {
  BillPaymentUploadDetailsListingPage, BillPaymentUploadTransactionLevelListingPage,
  BillPaymentUploadViewPage,
  BillPaymentViewPage,
  BulkPaymentDetailsListingPage,
  BulkPaymentDetailsReviewListingPage,
  BulkPaymentViewPage, LpoppReceiptComponent, LpoppViewPage,
  OwnAccountTransferViewPage,
  SinglePaymentViewPage
} from './pages/transactions';
import {IonicModule} from "@ionic/angular";
import {CommonModule} from "@angular/common";
import {TranslateModule} from '@ngx-translate/core';
import {bulkPaymentDetailsListingGuard} from './pages/transactions/bulk-payment/details-listing/bulk-payment-details-guard';
import {BillPaymentUploadDetailsListingGuard} from "./pages/transactions/bill-payment-upload/bill-payment-upload-details-guard";


const routes: Routes = [
  {
    path: 'listing/:product',
    loadChildren: () => import('../../listing/listing.module').then(m => m.ListingPageModule)
  },
  {
    path: 'view',
    children: [
      {
        path: 'OAT/:id',
        component: OwnAccountTransferViewPage
      },
      {
        path: 'singlePayment/:id',
        component: SinglePaymentViewPage
      },
      {
        path: 'bulkPayment/:id',
        component: BulkPaymentViewPage
      },
      {
        path: 'lpopp/:id',
        component: LpoppViewPage
      },
      {
        path: 'billPayment/:id',
        component: BillPaymentViewPage
      },
      {
        path: 'billPaymentUpload/:id',
        component: BillPaymentUploadViewPage
      }
    ]
  },
  {
    path: 'bulkPayementDetails/:id',
    component: BulkPaymentDetailsListingPage,
    canActivate: [bulkPaymentDetailsListingGuard]
  },
  {
    path: 'bulkPayementDetailsReview/:id',
    component: BulkPaymentDetailsReviewListingPage,
  },
  {
    path: 'billPayementUploadDetails/:id',
    component: BillPaymentUploadDetailsListingPage,
    canActivate: [BillPaymentUploadDetailsListingGuard]

  },
  {
    path: 'billPayementUploadTransactionLevelList/:id',
    component: BillPaymentUploadTransactionLevelListingPage,
  },
  {
    path: 'account-statement',
    loadChildren: () => import('./pages/account-statement/account-statement.module').then( m => m.AccountStatementPageModule)
  },
  {
    path: 'account-summary',
    loadChildren: () => import('./pages/account-summary/account-summary.module').then(m => m.AccountSummaryPageModule)
  },
  {
    path: 'single-payment-intiate',
    loadChildren: () => import('./pages/single-payment-intiate/single-payment-intiate.module').then(m => m.SinglePaymentIntiatePageModule)
  },
  {
    path: 'transaction-query',
    loadChildren: () => import('./pages/transaction-query/transaction-query.module').then( m => m.TransactionQueryPageModule)
  },
  {
    path: 'own-account-transfer-initiate',
    loadChildren: () => import('./pages/own-account-transfer-initiate/own-account-transfer-initiate.module').then( m => m.OwnAccountTransferInitiatePageModule)
  },
  {
    path: 'pay-bill-initiate',
    loadChildren: () => import('./pages/pay-bill-initiate/pay-bill-initiate.module').then(m => m.PayBillInitiatePageModule)
  },
  {
    path: 'mis',
    loadChildren: () => import('../../Products/paypro/pages/mis/mis.module').then( m => m.MISPageModule)
  },
  {
    path: 'leasing-summary',
    loadChildren: () => import('../../Products/paypro/pages/leasing-summary/leasing-summary.module').then( m => m.LeasingSummaryPageModule)
  },
  {
    path: 'treasury',
    loadChildren: () => import('../../Products/paypro/pages/treasury/treasury.module').then( m => m.TreasuryPageModule)
  },
  {
    path: 'lpopp',
    loadChildren: () => import('../../Products/paypro/pages/lpopp/lpopp.module').then( m => m.LpoppPageModule)
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes), IonicModule, CommonModule, TranslateModule],
  exports: [RouterModule],
})
export class PayproPageRoutingModule {}
