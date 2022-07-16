import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import {RouterModule} from "@angular/router";
import {SuperTabsModule} from "@ionic-super-tabs/angular";
import {TextAvatarModule} from "../../../../directives/text-avatar";
import { OwnAccountTransferInitiatePage } from './own-account-transfer-initiate.page';
import {SharedModule} from "../../../../components/shared.module";
import {PaymentMethodsTemplateModule} from '../payment-request-service/payment-methods-template/payment-methods-template.module';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
    schemas: [
        CUSTOM_ELEMENTS_SCHEMA
    ],
    imports: [
        TranslateModule,
        CommonModule,
        FormsModule,
        IonicModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule.forChild([
            {
                path: '',
                component: OwnAccountTransferInitiatePage
            }
        ]),
        SuperTabsModule,
        TextAvatarModule,
        SharedModule,
        PaymentMethodsTemplateModule,
    ],
    providers: [DatePipe] ,
  declarations: [OwnAccountTransferInitiatePage]
})
export class OwnAccountTransferInitiatePageModule {}
