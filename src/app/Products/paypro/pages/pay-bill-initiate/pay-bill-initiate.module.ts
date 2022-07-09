import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule, DatePipe  } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { SharedModule} from "../../../../components/shared.module";
import { RouterModule} from "@angular/router";
import { TextAvatarModule} from "src/app/directives/text-avatar";
import { BillerListPage } from './biller-list/biller-list.page';
import { ListOfBillsPage } from './list-of-bills/list-of-bills.page';
import { PayBillPaymentPage } from './payment/pay-bill-payment.page';
import { FilterPipe} from './filter.pipe';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
    schemas: [
        CUSTOM_ELEMENTS_SCHEMA
    ],
    imports: [
        TranslateModule,
        SharedModule,
        CommonModule,
        FormsModule,
        IonicModule,
        FormsModule,
        ReactiveFormsModule,
        TextAvatarModule,
        RouterModule.forChild([
            {
                path: '',
                component: BillerListPage
            },
            {
                path: 'list-of-bills',
                component: ListOfBillsPage
            },
            {
                path: 'paybillpayment',
                component: PayBillPaymentPage
            }
        ]),
    ],
    providers: [DatePipe] ,
    exports: [ListOfBillsPage, PayBillPaymentPage],
    declarations: [BillerListPage, ListOfBillsPage, PayBillPaymentPage, FilterPipe]
})
export class PayBillInitiatePageModule {}
