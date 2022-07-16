import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { IonicModule } from "@ionic/angular";
import { ListingPage } from "./listing.page";
import { SuperTabsModule } from "@ionic-super-tabs/angular";
import {
    SinglePaymentListingPage,
    OwnAccountTransferListingPage,
    BulkPaymentListingPage,
    BillPaymentListingPage,
    BillPaymentUploadListingPage, LpoppListingPage
} from "../Products/paypro/pages/transactions";
import { SharedModule } from "../components/shared.module";
import { RouterModule, Routes } from "@angular/router";
import { TranslateModule } from '@ngx-translate/core';
import {
    LetterOfCreditListingPage,
    LetterOfCreditAmendListingPage,
    ShippingGuaranteeListingPage,
    BillAcceptanceListingPage,
    BillPaymentTradeListingPage,
    OTTPaymentListingPage,
    RequestFinanceListingPage,
    BankGuaranteeListingPage,
    BankGuaranteeAmendListingPage,
    BillPresentmentListingPage,
    RequestFinanceExportListingPage
} from '../Products/trade/pages/transactions';

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
                component: ListingPage
            }
        ])
    ],
    exports: [ListingPage],
    entryComponents: [
        SinglePaymentListingPage,
        OwnAccountTransferListingPage,
        BulkPaymentListingPage,
        BillPaymentListingPage,
        BillPaymentUploadListingPage,
        LpoppListingPage,

        LetterOfCreditListingPage,
        LetterOfCreditAmendListingPage,
        ShippingGuaranteeListingPage,
        BillAcceptanceListingPage,
        BillPaymentTradeListingPage,
        RequestFinanceListingPage,
        OTTPaymentListingPage,
        BankGuaranteeListingPage,
        BankGuaranteeAmendListingPage,
        BillPresentmentListingPage,
        RequestFinanceExportListingPage
    ],
    declarations: [
        ListingPage,
        SinglePaymentListingPage,
        OwnAccountTransferListingPage,
        BulkPaymentListingPage,
        BillPaymentListingPage,
        BillPaymentUploadListingPage,
        LpoppListingPage,

        LetterOfCreditListingPage,
        LetterOfCreditAmendListingPage,
        ShippingGuaranteeListingPage,
        BillAcceptanceListingPage,
        BillPaymentTradeListingPage,
        RequestFinanceListingPage,
        OTTPaymentListingPage,
        BankGuaranteeListingPage,
        BankGuaranteeAmendListingPage,
        BillPresentmentListingPage,
        RequestFinanceExportListingPage
    ]
})
export class ListingPageModule {
}
