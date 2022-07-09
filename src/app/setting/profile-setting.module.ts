import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { IonicModule } from "@ionic/angular";
import { RouterModule } from "@angular/router";
import { ProfileSettingPage } from "./profile-setting.page";
import { TranslateModule } from "@ngx-translate/core";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,
    RouterModule.forChild([
      {
        path: "",
        component: ProfileSettingPage,
      },
    ]),
  ],
  declarations: [ProfileSettingPage],
  entryComponents: [],
  exports: [ProfileSettingPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ProfileSettingPageModule {}
