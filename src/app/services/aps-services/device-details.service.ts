import {Injectable} from '@angular/core';
import {Device} from '@ionic-native/device/ngx';
// import {FirebaseX} from "@ionic-native/firebase-x/ngx"; https://github.com/nileshbandekar/cordova-plugin-iroot.git
import {IRoot} from 'cordova-plugin-iroot/www/iroot';
import {AlertController, NavController, Platform} from '@ionic/angular';
import {appConstants} from "../../appConstants";
import {AngularAjaxService} from './ajaxService/angular-ajax.service';
import {Market} from '@ionic-native/market/ngx';
import {AppVersion} from '@ionic-native/app-version/ngx';
import {BehaviorSubject, of} from 'rxjs';
import {AESEncryptDecryptService} from '../aes-encrypt-decrypt-service';
import {ToastService} from './toast-service';
import {UserService} from './user.service';
import {catchError, map} from 'rxjs/operators';
import {AnalyticsService} from '../analytics.service';
import {environment} from 'src/environments/environment';
import {TouchID} from "@ionic-native/touch-id/ngx";
import {FingerprintAIO, FingerprintSecretOptions} from "@ionic-native/fingerprint-aio/ngx";

declare function generateAESKey(keyLength: number);
declare var IRoot: IRoot;
declare let window: any;
@Injectable({
    providedIn: 'root'
})
export class DeviceDetailsService {

    imei: string;
    mac: string;
    uuid: string;
    fcmToken: string;
    latestVersion;
    packageName;
    private APP_VERSION = this.platform.is('ios') ? appConstants.appIOSVersion : appConstants.appAndroidVersion;
    private deviceDetails: IDeviceDetails;
    private _isDeviceActivated: BehaviorSubject<any> = new BehaviorSubject(true);
    public isDeviceActivated$ = this._isDeviceActivated.asObservable();
    private _deviceDetails: BehaviorSubject<IDeviceDetails> = new BehaviorSubject(null);
    public deviceDetails$ = this._deviceDetails.asObservable();
    public startAjaxCalls$: BehaviorSubject<any> = new BehaviorSubject(null);
    private MAIN_CONSTANTS = {
        IS_ENCRYPTION_REQUIRED: 'authenticationService/public/isEncryptionRequired',
        BASIC_AUTHENTICATION: 'authenticationService/public/login/basicAuthentication',
        PASSWORD_CHANGE_MSG: 'You have updated your password',
        GET_APP_CONFIG : 'json/app_config.json',
        ISDEVICE_ACTIVATED_URL : 'mobilityRegisteredDevicesService/public/isRegistered',
        SEND_TOKEN_TO_SERVER : 'authenticationService/private/saveSecretToken',
        VERIFY_PASSWORD: "authenticationService/private/verifyPassword",
        ACTIVATION_URL: "mobilityRegisteredDevicesService/public/activation",
        GET_GROUPS: 'authenticationService/public/getGroups',
    };
    private SETTING: any = {};
    FINGERPRINT_AUTH = {
        isPasswordChanged : false,
        token: undefined,
        loginid: undefined,
    };
    private _useBiometricAuth: BehaviorSubject<any> = new BehaviorSubject(false);
    public useBiometricAuth$ = this._useBiometricAuth.asObservable();

    private _isBioMatricApplicable: BehaviorSubject<any> = new BehaviorSubject(false);
    public isBioMatricApplicable$ = this._isBioMatricApplicable.asObservable();

    clientSecret;
    private appSignature: string;

    constructor(
        public navCtrl: NavController,
        private device: Device,
        // private firebase: FirebaseX,
        private platform: Platform,
        private angularAjaxSrv: AngularAjaxService,
        private market: Market,
        private alertCtrl: AlertController,
        private aesService: AESEncryptDecryptService,
        private toastCtrl: ToastService,
        private appVersion: AppVersion,
        private analyticsService: AnalyticsService,
        private touchId: TouchID,
        private faio: FingerprintAIO,
        private userService: UserService) {
        this.platform.ready().then(() => {
            // this.uuid = device.uuid;
            this.deviceDetails = {
                isVirtual: this.device.isVirtual,
                uuid: this.getEncryptedUUID(),
                manufacturer: this.device.manufacturer,
                model: this.device.model,
                platform: this.device.platform,
                version: this.device.version
            };
            this._deviceDetails.next(this.deviceDetails);
            console.log("device details", JSON.stringify(this.deviceDetails));
            this.firebaseSetup();
            this.initialize();
        });
    }

    getEncryptedUUID() {
        try {
        return this.aesService.encrypt(this.device.uuid);
        } catch (e) {
    }
        return null;
    }

    isPasswordChanged() {
        return this.FINGERPRINT_AUTH.isPasswordChanged;
    }

    getDeviceDetails() {
      return  this.deviceDetails.platform + '-' +
        this.deviceDetails.version + '|' + this.deviceDetails.uuid
        + '|' + this.deviceDetails.manufacturer + '-' +
        this.deviceDetails.model;
    }
    firebaseSetup() {
        /*this.firebase.getToken().then(token => {
            console.log(`The token is ${token}`);
            // alert('token# ' + token);
            this.fcmToken = token;
        });

        this.firebase.onMessageReceived().subscribe(data => {
            console.log(`FCM message: ${data}`);
        });

        this.firebase.onTokenRefresh().subscribe((token: string) => {
            console.log(`Got a new token ${token}`);
        });*/
    }
    async initialize() {
        try {
            if (this.platform.is('android')) {
                (window as any).plugins.preventscreenshot
                    .enable(
                        (a) => console.log('#PS_S#', a),
                        (b) => console.log('#PS_E#', b)
                    );
            }
        } catch (e) {
            console.log('preventscreenshot exception', e);
        }

        this.isEncryptionRequired();
        this.packageName = await this.appVersion.getPackageName();
        await this.getAppSignature();
        this.deviceCheck();
    }

    private deviceCheck() {
        if (environment.production === true && this.deviceDetails.isVirtual) {
            this.showAppNoSupportedAlert();
        }
        if (this.platform.is('cordova')) {
            this.startAjaxCalls$.subscribe(startAjxs => {
                if (startAjxs !== null && appConstants.USE_ACTIVATION_PROCESS) {
                    this.checkDeviceActivation();
                }
            });
            if (environment.production === true) {
                this.rootDetection();
            }
            this.antiTamperingDetection();
            this.checkForBiomatric();
        }
    }
    checkForBiomatric() {
        if (this.platform.is('ios')) {
            this.touchId.isAvailable()
                .then((result: any) => {
                    this._isBioMatricApplicable.next(true);
                    console.log(result);
                })
                .catch((error: any) => {
                    console.log(error);
                });
        }
        if (this.platform.is('android')) {
            this.faio.isAvailable()
                .then((result) => {
                    console.log('isAvailable ', result);
                    this._isBioMatricApplicable.next(true);
                }).catch(error => {
                console.error('isAvailable ', error);
            });
        }
    }
    antiTamperingDetection() {
        window.cordova.plugins.AntiTampering.verify(
            (success) => {
                console.log('AT success' , JSON.stringify(success));
                // {"assets": {"count": x}} - where x is the number of assets checked
            },
            (error) => {
                console.log('AT error' , JSON.stringify(error));
                // gives you the file on which tampering was detected
            }
        );
    }

    getAppSignature() {
        if (this.platform.is('android')) {
            window.cordova.plugins.ReadAppSignature.getAppSignature(
                (success) => {
                    console.log('RAS success', JSON.stringify(success));
                    // alert('RAS success' + JSON.stringify(success));
                    this.appSignature = success;

                },
                (error) => {
                    console.log('RAS error', JSON.stringify(error));
                    // alert('RAS error' + JSON.stringify(error));

                }
            );
        }
    }

    checkDeviceActivation() {
        const dataMap: any = {};
        dataMap.appVersion = this.APP_VERSION;
        dataMap.device = {};
        dataMap.device.platform = this.deviceDetails.platform + "-" +  this.deviceDetails.version;
        dataMap.device.uuid =   this.deviceDetails.uuid;
        dataMap.device.imei =   this.deviceDetails.uuid;
        dataMap.device.model = this.deviceDetails.manufacturer + "-" + this.deviceDetails.model;
        dataMap.packageName = this.packageName;
        dataMap.appSignature = this.appSignature;
        // dataMap.device.platform = "Android-8.1.0";
        // dataMap.device.uuid =   "123456456789";
        // dataMap.device.imei =   "123456456789";
        // dataMap.device.model = "motorola-Moto G (5S) Plus";
        const data = {
            dataMap
        };
        this.angularAjaxSrv
            .sendAjaxRequest(this.MAIN_CONSTANTS.ISDEVICE_ACTIVATED_URL, data)
            .pipe(catchError((error, caught) => {
                console.log('Is Activated Url error ', error);
                // console.log('Is Activated Url caught ', caught);
                this.reloadAlert();
                return error;
            }))
            .subscribe(response => {
                this._isDeviceActivated.next(response.dataMap.isRegistered);
                this.latestVersion = response.dataMap.latestVersion;
                // if (this.latestVersion === false) {
                //     this.showAlertForUpdate();
                // }
                const versionDetails = response.dataMap.appVersionDetails;
                if (versionDetails) {
                    if (!versionDetails.enabled) {
                        this.showAlertForUpdate(versionDetails.msg.title, versionDetails.msg.text);
                    } else if (versionDetails.msg) {
                        // tslint:disable-next-line:max-line-length
                        this.showAlertForUpdate(versionDetails.msg.title, versionDetails.msg.text, 'UPDATE', versionDetails.isLatestVersion);
                    }

                }

                if (environment.production === true
                    && (response.dataMap.checkPackageName === false
                        || response.dataMap.checkAppSignature === false
                        || response.dataMap.checkAppCRC === false)) {
                    this.showAppNoSupportedAlert();
                }
                if (response.dataMap.isPasswordChanged
                    && response.dataMap.isPasswordChanged !== null
                    && response.dataMap.isPasswordChanged !== '') {
                    this.FINGERPRINT_AUTH.isPasswordChanged = response.dataMap.isPasswordChanged;
                }
                if (response.dataMap.isRegistered) {
                    console.log(response.dataMap.token);
                    this.FINGERPRINT_AUTH.token = response.dataMap.token;
                    this.FINGERPRINT_AUTH.token = response.dataMap.token;
                    this.FINGERPRINT_AUTH.loginid = response.dataMap.loginid;

                    if (this.FINGERPRINT_AUTH.token && this.FINGERPRINT_AUTH.token != null) {
                        this._useBiometricAuth.next(true);
                        if (this.FINGERPRINT_AUTH.isPasswordChanged) {
                            this._useBiometricAuth.next(false);
                            this.showAlert('Alert', this.MAIN_CONSTANTS.PASSWORD_CHANGE_MSG);
                        } else {
                            this.loginWithBiometric();
                        }
                    }
                }
            }, error => {
                console.log(error);
            });
    }

    activateDevice(activationReq) {
        const dataMap: any = {};
        dataMap.device = {};
        dataMap.device.platform = this.deviceDetails.platform + "-" + this.deviceDetails.version;
        dataMap.device.uuid =   this.deviceDetails.uuid;
        dataMap.device.imei =   this.deviceDetails.uuid;
        dataMap.device.model =  this.deviceDetails.manufacturer + "-" + this.deviceDetails.model;
        // dataMap.device.platform = "Android-8.1.0";
        // dataMap.device.uuid =   "123456456789";
        // dataMap.device.imei =   "123456456789";
        // dataMap.device.model = "motorola-Moto G (5S) Plus";
        dataMap.username = activationReq.username;
        dataMap.activationKey = this.aesService.encrypt(activationReq.activationKey);
        const data = { dataMap };
        this.angularAjaxSrv.sendAjaxRequest(this.MAIN_CONSTANTS.ACTIVATION_URL, data)
        .subscribe(res => {
            if (res.responseStatus.status !== 1) {
                this.activationSuccessAlert(res.responseStatus.message);
            }
        });
    }

    sendTokenToServer(token) {
        const dataMap: any = {};
        dataMap.deviceDetails = this.getDeviceDetails();

        if (token) {
            dataMap.secretToken = token;
            dataMap.clearToken = false;
        } else {
            dataMap.clearToken = true;
        }
        const data = { dataMap };
        this.angularAjaxSrv.sendAjaxRequest(this.MAIN_CONSTANTS.SEND_TOKEN_TO_SERVER, data)
          .pipe(catchError((err) => {
            return of(false);
        }))
        .subscribe(res => {
            if (res) {
                if (token) {
                    this.showAlert("Biometric", "Biometric enabled successfully");
                    this._useBiometricAuth.next(true);
                } else {
                    this.showAlert("Biometric", "Biometric disabled successfully");
                    this._useBiometricAuth.next(false);
                }
            }
        });
    }

    verifyPassword(input) {
        const deviceDetails = this.getDeviceDetails();
        const inputData = {
            userId: input.userId,
            password: input.password,
            versionDetails: {
                version: 1
            },
            clientDetails: {
                source: "MOBILE"
            },
            activateBioMetric: input.activateBioMetric,
            deviceDetails
        };
        this.angularAjaxSrv.sendAjaxRequest(this.MAIN_CONSTANTS.VERIFY_PASSWORD, inputData)
        .pipe(catchError((err) => {
            this._useBiometricAuth.next(false);
            return of(false);
        }))
        .subscribe(response => {
            if (response) {
                if (response.userDetails && response.userDetails.clientSecret) {
                    this.enrollForBiometric(response.userDetails.clientSecret);
                } else {
                    this.toastCtrl.presentToast('No client Sec found ');
                }
            }
        });
    }
    enrollForBiometric(secret) {
        if (this.platform.is('ios')) {
            this.enrollForBiometricIOS(secret);
        } else {
            this.enrollForBiometricAndroid(secret);
        }

    }
    enrollForBiometricIOS(secret) {
        this.touchId.verifyFingerprint('Scan your fingerprint please')
            .then((result: any) => {
                this.FINGERPRINT_AUTH.token = secret;
                this.FINGERPRINT_AUTH.loginid = this.userService.getUserDetails().userId;
                this.sendTokenToServer(this.FINGERPRINT_AUTH.token);
                console.log(result);
            })
            .catch((error: any) => {
                this._useBiometricAuth.next(false);
                // this.showAlert('Enrollment Failed', error);
                console.log(error);
            });
    }

    enrollForBiometricAndroid(secret) {
        /*const fingerprintOptions = {
            clientId: this.userService.getUserDetails().userId,
            username: this.userService.getUserDetails().userId,
            password: secret
        };
        this.fingerAuth.encrypt(fingerprintOptions)
            .then((result: any) => {
                this.FINGERPRINT_AUTH.token = result.token;
                this.FINGERPRINT_AUTH.loginid = this.userService.getUserDetails().userId;
                this.sendTokenToServer(this.FINGERPRINT_AUTH.token ? this.FINGERPRINT_AUTH.token : 'Y');
                console.log(result);
            })
            .catch((error: any) => {
                this._useBiometricAuth.next(false);
                this.showAlert('Enrollment Failed', error);
                console.log(error);
            });*/
        const options: FingerprintSecretOptions = {
            description: "Scan your fingerprint please",
            secret,
            // invalidateOnEnrollment: true, // If true secret will be deleted when biometry items are deleted or enrolled
            disableBackup: false, // always disabled on Android
        };
        this.faio.registerBiometricSecret(options)
            .then((result) => {
                // alert('registerBiometricSecret result' + JSON.stringify(result));
                this.FINGERPRINT_AUTH.token = result.token;
                this.FINGERPRINT_AUTH.loginid = this.userService.getUserDetails().userId;
                this.sendTokenToServer(this.FINGERPRINT_AUTH.token ? this.FINGERPRINT_AUTH.token : 'Y');
                console.log('register enrollment ', result);
            })
            .catch((error) => {
                this._useBiometricAuth.next(false);
                // alert('registerBiometricSecret error ' + JSON.stringify(error));
                console.error('register enrollment ', error);
            });
    }

    loginWithBiometric() {
        console.log(this.FINGERPRINT_AUTH);
        const fingerprintOptions = {
            clientId: this.FINGERPRINT_AUTH.loginid,
            username: this.FINGERPRINT_AUTH.loginid,
            token: this.FINGERPRINT_AUTH.token
        };
        if (this.platform.is('ios')) {
            this.clientSecret = fingerprintOptions.token;
            this.touchId.verifyFingerprint('Scan your fingerprint please')
                .then((result: any) => {
                    console.log(result);
                    this.basicAuthentication(undefined, true).subscribe(value => {
                        if (value === true) {
                            this.navCtrl.navigateRoot('authentication');
                        }
                    });
                })
                .catch((error: any) => {
                    // this._useBiometricAuth.next(false);
                    // this.showAlert('Failed', JSON.stringify(error));
                    console.log(error);
                });
        }
        if (this.platform.is('android')) {
            this.faio.loadBiometricSecret({
                description: "Confirm fingerprint to continue",
                disableBackup: true,
            }).then((secret) => {
                console.log(secret);
                this.clientSecret = secret;
                // alert('loginWithBiometric Success' + JSON.stringify(secret));
                this.basicAuthentication(undefined, true)
                    .subscribe(value => {
                        if (value === true) {
                            this.navCtrl.navigateRoot('authentication');
                        }
                    });
            }).catch((error: any) => {
                // this._useBiometricAuth.next(false);
                // this.showAlert('Failed', JSON.stringify(error));
                console.log(error);
                // alert('loginWithBiometric Error ' + JSON.stringify(error));
                if (error.code === -102) {
                    this.toastCtrl.presentToast("Biometric authentication failed ");
                }
                /*BIOMETRIC_UNKNOWN_ERROR = -100;
                BIOMETRIC_UNAVAILABLE = -101;
                BIOMETRIC_AUTHENTICATION_FAILED = -102;
                BIOMETRIC_SDK_NOT_SUPPORTED = -103;
                BIOMETRIC_HARDWARE_NOT_SUPPORTED = -104;
                BIOMETRIC_PERMISSION_NOT_GRANTED = -105;
                BIOMETRIC_NOT_ENROLLED = -106;
                BIOMETRIC_INTERNAL_PLUGIN_ERROR = -107;
                BIOMETRIC_DISMISSED = -108;
                BIOMETRIC_PIN_OR_PATTERN_DISMISSED = -109;
                BIOMETRIC_SCREEN_GUARD_UNSECURED = -110;
                BIOMETRIC_LOCKED_OUT = -111;
                BIOMETRIC_LOCKED_OUT_PERMANENT = -112;
                BIOMETRIC_SECRET_NOT_FOUND = -113;*/
                if ([-100, -101, -103, -104, -105, -106, -107, -110, -111, -112, -113].includes(error.code)) {
                    this._useBiometricAuth.next(false);
                }
            });
            /*this.fingerAuth.decrypt(fingerprintOptions)
                .then((result: any) => {
                    console.log(result);
                    if (result.withFingerprint) {
                        console.log("Successful biometric authentication.");
                        if (result.password) {
                            this.clientSecret = result.password;
                            this.basicAuthentication(undefined, true).subscribe(value => {
                                if (value === true) {
                                    this.navCtrl.navigateRoot('authentication');
                                }
                            });
                        }
                    } else if (result.withBackup) {
                        this.clientSecret = result.password;
                        this.basicAuthentication(undefined, true).subscribe(value => {
                            if (value === true) {
                                this.navCtrl.navigateRoot('authentication');
                            }
                        });
                    }
                })
                .catch((error: any) => {
                    if ('INIT_CIPHER_FAILED' === error) {
                        this.showAlert("Biometric", 'Please Enable Biometric First');
                        this._useBiometricAuth.next(false);
                    } else if ('FINGERPRINT_CANCELLED' !== error) {
                        this.showAlert('Failed', error);
                    }
                    console.log(error);
                });*/
        }
    }

    basicAuthentication(loginReq, biometric?) {

        if (!this.platform.is('cordova')) {
            this.deviceDetails.uuid = environment.userLogins[loginReq.username];
        }
        const data = {
            userId: undefined,
            password: undefined,
            usingBioMetricPassword: undefined,
            isPasswordChanged: this.isPasswordChanged(),
            versionDetails: {version: this.APP_VERSION},
            clientDetails: {source: "MOBILE"},
            deviceDetails: this.getDeviceDetails()
        };

        if (biometric) {
            data.userId = this.FINGERPRINT_AUTH.loginid;
            data.password =  this.clientSecret;
            data.usingBioMetricPassword = "Y";
        } else {
            data.userId = loginReq.username;
            data.password = this.aesService.encrypt(loginReq.password);
            data.usingBioMetricPassword = "N";
        }

        if (data.userId === null || data.userId === undefined || data.userId === ''
            || data.password === null || data.password === undefined || data.password === '') {
            return;
        }

        return this.angularAjaxSrv.sendAjaxRequest(this.MAIN_CONSTANTS.BASIC_AUTHENTICATION, data)
            .pipe(map((response: any) => {
                if (response.securityId !== undefined) {
                    this.userService.setEnrichmentDetails(response.enrichmentMap);
                    this.userService.setUserDetails(response.userDetails);
                    this.userService.setSecurityId(response.securityId);
                    if (response.userDetails.isGroupUser === 'Y') {
                        this.getGroups();
                    }
                    this.analyticsService.logEvent("select_content",
                        {content_type: "BASIC_AUTHENTICATION", item_id: response.securityId});
                    return true;
                }
                return false;
            }),
            catchError((err) => {
                if (err.responseStatus.message === "UPDATE_BIOMETRIC_PASSWORD") {
                    this.toastCtrl.presentToast('Update Biometric Password');
                    this._useBiometricAuth.next(false);
                } else {
                    this.toastCtrl.presentToast(err.responseStatus.message);
                }
                return of(false);
            })
            );
    }

    getGroups() {
        return this.angularAjaxSrv.sendAjaxRequest(this.MAIN_CONSTANTS.GET_GROUPS, {}).subscribe(response => {
            console.log(response.dataList);
            this.userService.setAvaliableGroups(response.dataList);
        });
    }

    /*async fingerAuthAvailable() {
        return  await this.fingerAuth.isAvailable();
    }*/

    async showAppNoSupportedAlert() {
        if (environment.production !== true) {
            return;
        }
        const alert = await this.alertCtrl.create({
            header: "Error",
            message: "<p class='ion-margin-top ion-no-margin'>App Not Supported</p>",
            backdropDismiss: false,
            buttons: [{
                text: "Ok",
                handler: () => {
                    try {
                        navigator['app'].exitApp();
                    } catch (e) {
                        this.showAppNoSupportedAlert();
                    }
                }
            }]
        });
        await alert.present();
        /*alert.onDidDismiss().then(() => {
        });*/
    }
    async showAlertForUpdate(header, message, btnTxt = '', allowClose = false) {
        const buttons: any = [];
        let cancelClick = false;

        if (btnTxt !== '') {
            buttons.push({
                text: btnTxt,
                handler: () => {
                    cancelClick = false;
                    const marketLink = this.platform.is('ios') ?
                        "itms-apps://itunes.apple.com/app/" + this.packageName : this.packageName;
                    this.market.open(marketLink)
                        .then(res => {
                            console.log("market.open Sucess");
                        }, err => {
                            console.log("market.open Error", err);
                        });
                }
            });
        }
        if (allowClose) {
            buttons.push({
                text: 'Close',
                role: 'cancel',
                handler: () => {cancelClick = true; }
            });
        }
        const alert = await this.alertCtrl.create({
            header,
            message: "<p class='ion-margin-top ion-no-margin'> " + message + "</p>",
            backdropDismiss: allowClose,
            buttons
        });
        await alert.present();
        alert.onDidDismiss().then((res) => {
            console.log(res);
            if (!cancelClick) {
                this.showAlertForUpdate(header, message, btnTxt, allowClose);
            }
        });
    }
    async showAlert(title, msg) {
        const alert = await this.alertCtrl.create({
            header: title,
            message: "<p class='ion-margin-top ion-no-margin'>" + msg + "</p>",
            buttons: [{
                text: "ok"
            }]
        });
        await alert.present();
    }

    async activationSuccessAlert(msg) {
        const alert = await this.alertCtrl.create({
            header: "Success",
            message: "<p class='ion-margin-top ion-no-margin'>" + msg + "</p>",
            cssClass: "alert-subscribe",
            buttons: [{
                text: "ok"
            }]
        });
        await alert.present();
        alert.onDidDismiss().then(() => {
           this._isDeviceActivated.next(true);
        });
    }

    private rootDetection() {
        try {
            console.log(' IRoot', IRoot);
            IRoot.isRooted((booleanVal) => {
                console.log('IRT1 S ', booleanVal);
                if (booleanVal) {
                    this.showAppNoSupportedAlert();
                }
            }, (err) => {
                console.log('IRT1 E ', err);
            });
            if (this.platform.is('android')) {
                IRoot.isRootedWithBusyBox((booleanVal) => {
                    console.log('IRT2 S ', booleanVal);
                    if (booleanVal) {
                        this.showAppNoSupportedAlert();
                    }
                }, (err) => {
                    console.log('IRT2 E', err);
                });
                IRoot.isRootedWithEmulator((booleanVal) => {
                    console.log('IRT3 S ', booleanVal);
                    if (booleanVal) {
                        this.showAppNoSupportedAlert();
                    }
                }, (err) => {
                    console.log('IRT3 E ', err);
                });
            }

        } catch (e) {
            console.log('Error:', e);
        }
    }

    private async reloadAlert() {
        const alert = await this.alertCtrl.create({
            header: "Error",
            message: "<p class='ion-margin-top ion-no-margin'>Unable to Connect</p>",
            backdropDismiss: false,
            buttons: [{
                text: "Retry",
                handler: () => {
                    this.checkDeviceActivation();
                }
            }]
        });
        await alert.present();
    }

    private async isEncryptionRequired() {
        const uiKey = generateAESKey(32);
        AESEncryptDecryptService.secretKey = uiKey;
        this.angularAjaxSrv.sendAjaxRequest(this.MAIN_CONSTANTS.IS_ENCRYPTION_REQUIRED, {dataMap: {uiKey}})
            .subscribe(response => {
                if (response.dataMap.aesKey) {
                    AESEncryptDecryptService.secretKey = response.dataMap.aesKey;
                }
                this.deviceDetails.uuid = this.getEncryptedUUID();
            if (response.dataMap && response.dataMap.isEncryptionRequired) {
                appConstants.IS_ENCRYPTION_REQUIRED = response.dataMap.isEncryptionRequired === 'Y';
            } else {
                appConstants.IS_ENCRYPTION_REQUIRED = false;
            }
            this.startAjaxCalls$.next(appConstants.IS_ENCRYPTION_REQUIRED);
        });
    }
}

export interface IDeviceDetails {
    platform: string;
    uuid: string;
    model: string;
    version: string;
    manufacturer: string;
    isVirtual: boolean;
}
