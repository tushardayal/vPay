import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { SharedModule } from '../components/shared.module';

import { LoginPage } from './login.page';
import {LoginRoutingModule} from "./login-routing.module";
import { AuthenticationPage } from "./authentication/authentication.page";
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SharedModule,
    LoginRoutingModule, TranslateModule
  ],
  declarations: [LoginPage, AuthenticationPage],
  exports: [LoginPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class LoginPageModule { }
