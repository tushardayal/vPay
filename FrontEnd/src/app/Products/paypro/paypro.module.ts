import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {IonicModule} from '@ionic/angular';

import {PayproPageRoutingModule} from './paypro-routing.module';
import {
    BillPaymentUploadDetailsListingPage,
    BillPaymentUploadTransactionLevelListingPage,
    BillPaymentUploadViewPage,
    BillPaymentViewPage,
    BulkPaymentDetailsListingPage,
    BulkPaymentDetailsReviewListingPage,
    BulkPaymentViewPage, LpoppReceiptComponent,
    LpoppViewPage,
    OwnAccountTransferViewPage,
    SinglePaymentViewPage
} from './pages/transactions';
import {SharedModule} from 'src/app/components/shared.module';
import {TranslateModule} from '@ngx-translate/core';
import {LpoppPageModule} from "./pages/lpopp/lpopp.module";
import {LpoppModalComponent} from "./pages/lpopp/lpopp-modal/lpopp-modal.component";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        SharedModule,
        PayproPageRoutingModule,
        TranslateModule,
        LpoppPageModule
    ],
    declarations: [
        OwnAccountTransferViewPage,
        SinglePaymentViewPage,
        BulkPaymentViewPage,
        BillPaymentViewPage,
        BulkPaymentDetailsListingPage,
        BulkPaymentDetailsReviewListingPage,
        BillPaymentUploadDetailsListingPage,
        BillPaymentUploadViewPage,
        BillPaymentUploadTransactionLevelListingPage,
        LpoppViewPage,
        LpoppReceiptComponent
    ],
    exports: [
    ],
    entryComponents: [LpoppReceiptComponent]
})
export class PayproPageModule {}
