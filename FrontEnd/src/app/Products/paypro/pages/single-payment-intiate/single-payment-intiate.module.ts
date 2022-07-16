import { NgModule, CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SelectBeneficiaryPage } from './select-beneficiary.page';
import { RouterModule} from "@angular/router";
import {FrequentlyUsedBeneficiaryPage} from "./frequently-used-beneficiary/frequently-used-beneficiary.page";
import {AllBeneficiaryPage} from "./all-beneficiary/all-beneficiary.page";
import {SuperTabsModule} from "@ionic-super-tabs/angular";
import {TextAvatarModule} from "../../../../directives/text-avatar";
import { SharedModule } from 'src/app/components/shared.module';
import {PaymentMethodsTemplateModule} from '../payment-request-service/payment-methods-template/payment-methods-template.module';
import { InitiatePaymentPage } from './initiate-payment/initiate-payment.page';
import { InitiateSinglePaymentCanDeactivateGuardService } from './initiate-payment/initiate-single-payment-guard';
import { TranslateModule } from '@ngx-translate/core';
import {InitiateSinglePaymentResolver} from "./initiate-payment/initiate-single-payment-resolver";
@NgModule({
    schemas: [
        CUSTOM_ELEMENTS_SCHEMA
    ],
    imports: [
        TranslateModule,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        IonicModule,
        SharedModule,
        RouterModule.forChild([
            {
                path: '',
                redirectTo: 'select-beneficiary'
            },
            {
                path: 'select-beneficiary',
                component: SelectBeneficiaryPage,
            },
            {
                path: 'mostly-used-beneficiary',
                component: FrequentlyUsedBeneficiaryPage
            },
            {
                path: 'all-beneficiary',
                component: AllBeneficiaryPage
            },
            {
                path: 'initiate',
                component: InitiatePaymentPage,
                canDeactivate: [InitiateSinglePaymentCanDeactivateGuardService],
                resolve: {
                    editTransactionData: InitiateSinglePaymentResolver
                }
            },

        ]),
        SuperTabsModule,
        TextAvatarModule,
        PaymentMethodsTemplateModule,
    ],
  declarations: [SelectBeneficiaryPage,
    FrequentlyUsedBeneficiaryPage,
    AllBeneficiaryPage,
    InitiatePaymentPage
    ]
})
export class SinglePaymentIntiatePageModule {}
