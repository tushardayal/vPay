import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule} from "@angular/router";
import { SharedModule } from 'src/app/components/shared.module';
import { EP1Component } from './ep1/ep1.component';
import { EP3Component } from './ep3/ep3.component';
import { EP4Component } from './ep4/ep4.component';
import { EP5Component } from './ep5/ep5.component';
import { EP17Component } from './ep17/ep17.component';
import { EP18Component } from './ep18/ep18.component';
import { EP10Component } from './ep10/ep10.component';
import { TranslateModule } from '@ngx-translate/core';


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
        RouterModule,
    ],
    declarations: [
      EP1Component,
      EP3Component,
      EP4Component,
      EP5Component,
      EP10Component,
      EP17Component,
      EP18Component,
      ],
      exports: [
        EP1Component,
        EP3Component,
        EP4Component,
        EP5Component,
        EP10Component,
        EP17Component,
        EP18Component,
        ]
})
export class PaymentMethodsTemplateModule {}
