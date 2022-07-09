import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {LoginPage} from "./login.page";
import {AuthenticationPage} from "./authentication/authentication.page";
import {ApsLoginLayout1Page} from "./login-layout-1/aps-login-layout1-page.component";

const routes: Routes = [
  {
    path: 'login/:type',
    component: LoginPage
  },
  {
    path: 'authentication',
    component: AuthenticationPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  declarations: []

})

export class LoginRoutingModule { }
