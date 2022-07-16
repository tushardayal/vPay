import {Component, Output, EventEmitter, Input, OnChanges, OnInit, OnDestroy} from '@angular/core';
import {Observable} from "rxjs";
import {LoginService} from "../login-service";
import {environment} from "../../../environments/environment";
import {AlertController} from "@ionic/angular";
import { DeviceDetailsService } from 'src/app/services/aps-services/device-details.service';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'aps-login-layout-1',
  templateUrl: 'aps-login-layout-1.page.html',
  styleUrls: ['aps-login-layout-1.page.scss'],
  providers: [TranslatePipe]
})
export class ApsLoginLayout1Page implements OnChanges, OnInit, OnDestroy {

  @Input() data: any;

  // tslint:disable-next-line:no-output-on-prefix
  @Output() onLogin = new EventEmitter();
  // tslint:disable-next-line:no-output-on-prefix
  @Output() onRegister = new EventEmitter();

  isUsernameValid = true;
  isPasswordValid = true;
  isActivationUsernameValid = true;
  isActivationKeyValid = true;
  disableLoginClick$: Observable<boolean>;
  isDeviceActivated;
  useBiometricAuth;
  showPassword = false;
  item = {
    username: '',
    password: ''
  };
  activationObj = {
    username: '',
    activationKey: ''
  };
  environment = environment;
  constructor(private loginService: LoginService,
              private alertCtrl: AlertController,
              private deviceDetSrv: DeviceDetailsService,
              private translate: TranslatePipe
  ) {
    console.log("aps-login");
    this.loginService.isDeviceActivated.subscribe(val => {
      this.isDeviceActivated = val;
    });
    this.loginService.useBiometricAuth.subscribe(val => {
      this.useBiometricAuth = val;
    });
  }

  ngOnInit(): void {
    this.disableLoginClick$ = this.loginService.disableLoginClick$;
  }
  ngOnChanges(changes: { [propKey: string]: any }) {
    this.data = changes.data.currentValue;
  }

  onLoginFunc(): void {
    // this.intro();
    // return
    if (this.validateLoginForm()) {
      this.onLogin.emit(this.item);
    }
  }

  onRegisterFunc(): void {
    if (this.validateActivationForm()) {
      this.onRegister.emit(this.activationObj);
    }
  }


  validateLoginForm(): boolean {
    this.isUsernameValid = true;
    this.isPasswordValid = true;
    if (!this.item.username || this.item.username.length === 0) {
      this.isUsernameValid = false;
    }

    if (!this.item.password || this.item.password.length === 0) {
      this.isPasswordValid = false;
    }
    return this.isPasswordValid && this.isUsernameValid;
  }

  validateActivationForm(): boolean {
    this.isActivationKeyValid = true;
    this.isActivationUsernameValid = true;
    if (!this.activationObj.username || this.activationObj.username.length === 0) {
      this.isActivationUsernameValid = false;
    }

    if (!this.activationObj.activationKey || this.activationObj.activationKey.length === 0) {
      this.isActivationKeyValid = false;
    }
    return this.isActivationKeyValid && this.isActivationUsernameValid;
  }

  showBiomatric() {
    this.loginService.showBiomatric();
  }

  /*async changeRestContext() {
    const restContextAlert = await this.alertCtrl.create({
      cssClass: 'my-custom-class',
      header: 'Change Rest Context',
      inputs: [
        {
          name: 'ip',
          type: 'text',
          placeholder: environment.apiUrl.split('/')[2],
          value: environment.apiUrl.split('/')[2]
        }],
      buttons: [
      {
        text: this.translate.transform("lbl_cancel"),
        role: 'cancel',
        cssClass: 'secondary',
        handler: () => {
          console.log('Confirm Cancel');
        }
      }, {
        text: this.translate.transform("lbl_ok"),
        handler: (obj) => {
          environment.apiUrl = "http://" + obj.ip + "/cashProServiceAPI/rest/";
          console.log('environment', environment.apiUrl);
          this.deviceDetSrv.initialize();
          this.loginService.getOfflineBroadcastMessages();
          alert(environment.apiUrl);
        }
      }
    ]
  });
    await restContextAlert.present();
  }*/

  /*getDisplayName(key) {
    const oldValue = key;
    key = "lbl_" + key.replace(/\s/g, "_");
    key = key.toLowerCase();
    // console.log("key", key);
    const newValue = this.translate.transform(key);
    const setValue = newValue === key ? key : newValue;
    // console.log("newValue", newValue);
    return setValue;
  }*/

  ngOnDestroy(): void {
    console.log('Destroy login-layout-1');
    this.loginService.disableLoginClick$.next(false);
  }
}
