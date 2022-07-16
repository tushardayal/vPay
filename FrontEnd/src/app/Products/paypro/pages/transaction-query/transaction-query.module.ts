import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {IonicModule} from '@ionic/angular';
import {TransactionQueryPage} from './transaction-query.page';
import {RouterModule} from "@angular/router";
import {PaymentTransactionQueryPage} from "./payment-transaction-query/payment-transaction-query.page";
import {BillPaymentHistoryPage} from "./bill-payment-history/bill-payment-history.page";
import {SharedModule} from "../../../../components/shared.module";
import {PaymentTransactionQueryViewPage} from './payment-transaction-query/view/payment-transaction-query-view.page';
import {BillPaymentHistoryViewPage} from './bill-payment-history/view/bill-payment-history-view.page';
import {TranslateModule} from '@ngx-translate/core';
import {LpoppTransactionQueryPage} from "./lpopp-transaction-query/lpopp-transaction-query.page";
import {LpoppTransactionQueryViewPage} from "./lpopp-transaction-query/view/lpopp-transaction-query-view.page";
import {PayproTransactionQueryComponent} from "./paypro-transaction-query/paypro-transaction-query.component";
import {LpoppPageModule} from "../lpopp/lpopp.module";
import {TransactionQueryService} from "./transaction-query.service";

@NgModule({
    schemas: [
        CUSTOM_ELEMENTS_SCHEMA
    ],
    imports: [
        TranslateModule,
        CommonModule,
        FormsModule,
        IonicModule,
        SharedModule,
        LpoppPageModule,
        RouterModule.forChild([
            {
                path: 'payment-transaction-query-view',
                component: PaymentTransactionQueryViewPage
            }, {
                path: 'lpopp-transaction-query-view',
                component: LpoppTransactionQueryViewPage
            },
            {
                path: 'bill-payment-history-view',
                component: BillPaymentHistoryViewPage
            },
            {
                path: '',
                component: TransactionQueryPage,
                children: [{
                    path: 'paypro-transaction-query',
                    component: PayproTransactionQueryComponent
                }, {
                    path: 'payment-transaction-query',
                    component: PaymentTransactionQueryPage
                }, {
                    path: 'lpopp-transaction-query',
                    component: LpoppTransactionQueryPage
                },
                    {
                        path: 'bill-payment-history',
                        component: BillPaymentHistoryPage
                    },
                    {
                        path: '', redirectTo: 'transaction-query'
                    }]
            }
        ]),
    ],
    entryComponents: [
        // LpoppCommonViewComponent,
    ],
    providers: [TransactionQueryService],
    declarations: [TransactionQueryPage,
        PayproTransactionQueryComponent,
        PaymentTransactionQueryPage,
        LpoppTransactionQueryPage,
        BillPaymentHistoryPage,
        PaymentTransactionQueryViewPage,
        LpoppTransactionQueryViewPage,
        BillPaymentHistoryViewPage]
})
export class TransactionQueryPageModule {
}
