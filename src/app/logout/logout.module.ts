import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';


import { LogoutPage } from './logout.page';
import {RouterModule} from "@angular/router";
import {LoginPage} from "../login/login.page";
import {LoginPageModule} from "../login/login.module";
import { TranslateModule } from '@ngx-translate/core';
@NgModule({
  imports: [
    TranslateModule,
    CommonModule,
    FormsModule,
    IonicModule,
    LoginPageModule,
    RouterModule.forChild([
      {
        path: '',
        component: LogoutPage,
      },
      {
        path: 'login',
        component: LoginPage
      }
    ]),
  ],
  declarations: [LogoutPage]
})
export class LogoutPageModule {}
