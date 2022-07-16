import {Component, OnInit, ViewChild} from "@angular/core";
import { ProfileSettingService } from "./profile-setting-service";
import { UserService } from "src/app/services/aps-services/user.service";

import * as _ from "lodash";
import { AlertController } from '@ionic/angular';
import { DeviceDetailsService } from '../services/aps-services/device-details.service';
import { AESEncryptDecryptService } from '../services/aes-encrypt-decrypt-service';
import { TranslatePipe } from '@ngx-translate/core';
import {environment} from "../../environments/environment";
import {map} from "rxjs/operators";
import {ToastService} from "../services/aps-services/toast-service";

@Component({
  selector: "app-profile-setting",
  templateUrl: "profile-setting.page.html",
  styleUrls: ["profile-setting.page.scss"],
  providers: [TranslatePipe]
})
export class ProfileSettingPage implements OnInit {
  item = { background: "assets/imgs/background/29.jpg" };
  data: any;
  profileImageUrl;
  useBiometricAuth;
  biometricCurrentState: boolean;
  isBioMatricApplicable: any;
  environment = environment;
  constructor(
    private userSrv: UserService,
    private profilesettingService: ProfileSettingService,
    private alertCtrl: AlertController,
    private deviceDetailsSrv: DeviceDetailsService,
    private aesService: AESEncryptDecryptService,
    private toastCtrl: ToastService,
    private translate: TranslatePipe
  ) {}

  ngOnInit() {
    this.data = this.userSrv.getUserDetails();
    this.deviceDetailsSrv.useBiometricAuth$.subscribe(val => {
        this.useBiometricAuth = val;
        this.biometricCurrentState = val;
    });
    this.profileImageUrl = this.data ? this.data.profileImage : '';
    this.isBioMatricApplicable = this.deviceDetailsSrv.isBioMatricApplicable$;
  }

  onErrorProfilePic() {
    this.profileImageUrl = this.userSrv.onErrorProfilePic();
  }

   biometricBtnToggle($event) {
    console.log("biometric enable " + this.useBiometricAuth);
    if (this.useBiometricAuth !== this.biometricCurrentState ) {
        this.biometricCurrentState = this.useBiometricAuth;
        if (this.biometricCurrentState) {
           this.shlowVerifyPassword();
        } else {
           this.deviceDetailsSrv.sendTokenToServer(undefined);
        }
    }
  }
  async shlowVerifyPassword() {
    const alert = await this.alertCtrl.create({
      header: this.translate.transform("lbl_verify_password"),
      backdropDismiss: false,
      inputs: [{
          name: 'pass',
          placeholder: this.translate.transform("lbl_enter_your_password"),
          type: 'password',
      }],
      buttons: [
        {
            text: this.translate.transform("lbl_cancel"),
            role: 'cancel',
            handler: () => {
                this.useBiometricAuth = !this.biometricCurrentState;
                this.biometricCurrentState = !this.biometricCurrentState;
            }
        },
        {
          text: this.translate.transform("lbl_verify"),
            handler: (input) => {
                if (input.pass !== null && input.pass !== undefined && input.pass !== '') {
                    const userId = this.data.userId;
                    const password = this.aesService.encrypt(input.pass);
                    if (this.biometricCurrentState) {
                      this.deviceDetailsSrv.verifyPassword({userId, password, activateBioMetric: this.biometricCurrentState});
                    }
                } else {
                    this.toastCtrl.presentToast("Please Enter Your Password");
                    return false;
                }
            }
        },
      ],
    });
    await alert.present();
  }
}
