import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { MenuPageRoutingModule } from './menu-routing.module';
import { MenuPage } from './menu.page';
import {SharedModule} from "../components/shared.module";
import { TranslateModule } from '@ngx-translate/core';
import {SessionTimoutDirective} from "../directives/session-timout.directive";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SharedModule,
    MenuPageRoutingModule, TranslateModule
  ],
  declarations: [MenuPage, SessionTimoutDirective]
})
export class MenuPageModule {}
