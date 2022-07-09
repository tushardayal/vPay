import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import {SharedModule} from "../../../../components/shared.module";
import {StatementPage} from "./statement/statement.page";
import {RouterModule} from "@angular/router";
import {AccountStatementPage} from "./accounts/account-statement.page";
import {ViewComponent} from "./view/view.component";
import { TranslateModule } from '@ngx-translate/core';


@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        SharedModule,
        TranslateModule,
        RouterModule.forChild([
            {
                path: '',
                component: AccountStatementPage,
            },
            {
                path: 'statement',
                component: StatementPage
            },
            {
                path: 'view',
                component: ViewComponent
            }
        ]),
    ],
  exports: [StatementPage],
  declarations: [AccountStatementPage, StatementPage, ViewComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AccountStatementPageModule {}
