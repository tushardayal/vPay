import { IService } from '../services/IService';
import {Injectable, OnDestroy} from '@angular/core';
import {BehaviorSubject, interval, Observable, of, Subject, timer} from 'rxjs';
import { LoadingService } from '../services/aps-services/loading-service';
import {AngularAjaxService} from '../services/aps-services/ajaxService/angular-ajax.service';
import {UserService} from "../services/aps-services/user.service";
import {ToastService} from "../services/aps-services/toast-service";
import {map, switchMap, takeUntil, catchError, delayWhen} from "rxjs/operators";
import {AnalyticsService} from "../services/analytics.service";
import {environment} from "../../environments/environment";
import { DeviceDetailsService, IDeviceDetails } from '../services/aps-services/device-details.service';
import { AlertController } from '@ionic/angular';
import {AESEncryptDecryptService} from "../services/aes-encrypt-decrypt-service";
import {appConstants} from "../appConstants";
@Injectable({providedIn: 'root'})
export class LoginService implements IService, OnDestroy {

    resendOTPTImer$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
    disableLoginClick$: BehaviorSubject<boolean> = new BehaviorSubject<any>(false);
    isDeviceActivated: Observable<any>;
    useBiometricAuth: Observable<any>;
    startAjaxCalls: Observable<any>;
    deviceDetails: IDeviceDetails;
    private _tradeLoginType = new BehaviorSubject<any>(null);
    public tradeLoginType$ = this._tradeLoginType.asObservable();
    screenContent$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
    constructor(
                private loadingService: LoadingService,
                private ajaxService: AngularAjaxService,
                private userService: UserService,
                private analyticsService: AnalyticsService,
                private aesService: AESEncryptDecryptService,
                private toastCtrl: ToastService,
                private deviceDetailsSrv: DeviceDetailsService,
                private alertCtrl: AlertController) {
        console.log('LoginService constructor', this.resendOTPTImer$.getValue());
        this.isDeviceActivated = this.deviceDetailsSrv.isDeviceActivated$;
        this.useBiometricAuth = this.deviceDetailsSrv.useBiometricAuth$;
        this.startAjaxCalls = this.deviceDetailsSrv.startAjaxCalls$;
        this.deviceDetailsSrv.deviceDetails$.subscribe(res => {
            this.deviceDetails = res;
        });
    }

    private CONSTANTS = {
        BASIC_AUTHENTICATION: 'authenticationService/public/login/basicAuthentication',
        GENERATE_OTP: 'authenticationService/public/login/generateOTP',
        GET_GROUPS: 'authenticationService/public/getGroups',
        VALIDATE_TOKEN: 'authenticationService/public/login',
        LOGIN_AS_NORMAL_USER: 'authenticationService/public/loginAsNormalUser',
        LOGIN_AS_GROUPUSER: 'authenticationService/public/loginAsGroupUser',
        LAST_LOGIN_ACTIVITY: 'authenticationService/private/lastLoginActivity',
        GET_MENU: 'menuService/public/getMenus',
        GET_SCREEN_CONTENT: 'contentManagementService/public/login/getScreenContent',
        GET_OFFLINE_BROADCAST_MSG: 'broadcastMessageService/public/getOfflineBroadcastMessages',
        HARDTOKEN: '/validateHardToken',
        SOFTTOKEN: '/validateOTP',
        SET_LOGIN_TYPE: "trade/corporateMainService//private/setLoggedinAs"
    };
    getTitle = (): string => 'Login pages';

    getAllThemes = (): Array<any> => {
        return [
            {url: 'login/0', title: 'Login + logo 1', theme: 'layout1'},
            {url: 'login/1', title: 'Login + logo 2', theme: 'layout2'}
        ];
    };

    getDataForTheme = (menuItem: any): Array<any> => {
        return this[
        'getDataFor' +
        menuItem.theme.charAt(0).toUpperCase() +
        menuItem.theme.slice(1)
            ]();
    };

    // * Data Set for page 1
    getDataForLayout1 = (): any => {
        return {
            headerTitle: 'Login + logo 1',
            // background: "assets/imgs/" + environment.themeCategory + "/Login_Screen.jpg",
            //logo: "assets/imgs/logo/2.png",
            skip: "Skip",
            username: "Enter your username",
            password: "Enter your password",
            labelUsername: "USERNAME",
            labelPassword: "PASSWORD",
            forgotPassword: "Forgot password?",
            facebookLogin: "Login with",
            login: "Proceed",
            title: "Login to your account",
            activationKey: "Activation Key"
        };
    };

    // * Data Set for page 2
    getDataForLayout2 = (): any => {
        return {
            headerTitle: 'Login + logo 2',
            // background: "assets/imgs/background/29.jpg",
            image: "assets/imgs/color-images/0.png",
            forgotPassword: "Forgot password?",
            labelUsername: "USERNAME",
            labelPassword: "PASSWORD",
            title: "Login to your account",
            subtitle: "Welcome",
            username: "Enter your username",
            password: "Enter your password",
            login: "Log In",
            register: "Register",
            facebookLogin: "Login with",
            //logo: "assets/imgs/logo/2.png",
        };
    };

    load(item: any): Observable<any> {
        // this.loadingService.show();
        return new Observable(observer => {
            // this.loadingService.hide();
            observer.next(this.getDataForTheme(item));
            observer.complete();
        });
    }

    basicAuthentication(loginReq) {
        this.disableLoginClick$.next(true);

        return this.deviceDetailsSrv.basicAuthentication(loginReq)
            .pipe(map((response: any) => {
                this.disableLoginClick$.next(false);
                return response;
            }),
            catchError((err) => {
                this.disableLoginClick$.next(false);
                return of(err);
            })
            );
    }

    activateDevice(activationReq) {
        this.deviceDetailsSrv.activateDevice(activationReq);
    }

    loginAsNormalOrGroupUser(selectedGroup) {
        let url = this.CONSTANTS.LOGIN_AS_NORMAL_USER;
        let data = {};
        if (selectedGroup && selectedGroup.id) {
            url = this.CONSTANTS.LOGIN_AS_GROUPUSER;
            data = {
                dataMap: {
                    groupId: selectedGroup.id
                }
            };
        }
        return this.ajaxService.sendAjaxRequest(url, data)
            .pipe(map(value => {
                this.userService.selectedGroup = selectedGroup;
            }))
            .pipe(
                switchMap(value => {
                    return this.ajaxService.sendAjaxRequest(this.CONSTANTS.GET_MENU, {})
                        .pipe(map((menuReponse) => {
                                this.getLastLoginActivity();
                                this.userService.setMenu(menuReponse.modules);
                                // this.createRoles(menuReponse)
                            }
                        ));
                })
            );

    }

    validateToken(data) {
        this.disableLoginClick$.next(true);
        const url = this.CONSTANTS.VALIDATE_TOKEN + this.CONSTANTS[data.authType];
        console.log('url', url);
        return this.ajaxService.sendAjaxRequest(url, data)
            .pipe(
                map((response: any) => {
                    if (response.securityId) {
                        return this.userService.setSecurityId(response.securityId);
                        // this.loginAsNormalOrGroupUser();
                    }
                    return of(false);
                }),
                catchError(err => {
                    this.disableLoginClick$.next(false);
                    return err;
                }));
    }


    generateOTP() {
        this.ajaxService.sendAjaxRequest(this.CONSTANTS.GENERATE_OTP, {}).subscribe((response) => {
            this.toastCtrl.presentToast("OTP sent to your registered mobile number");
            const otpTimeoutSeconds = appConstants.otpTimeOutInSec;
            const destroy$ = new Subject();
            interval(1000)
                .pipe(takeUntil(destroy$))
                .subscribe(value => {
                    const seconds = (otpTimeoutSeconds - value) ;
                    const timeObj = new Date(1970, 0, 1).setSeconds(seconds);
                    this.resendOTPTImer$.next(timeObj);
                    if (seconds === 0) {
                        this.resendOTPTImer$.next(null);
                        destroy$.next();
                        destroy$.complete();
                    }
                });
        });
    }

    getGroups() {
        return this.ajaxService.sendAjaxRequest(this.CONSTANTS.GET_GROUPS, {}).subscribe(response => {
            console.log(response.dataList);
            this.userService.setAvaliableGroups(response.dataList);
        });
    }

    getLastLoginActivity() {
        this.ajaxService.sendAjaxRequest(this.CONSTANTS.LAST_LOGIN_ACTIVITY, {}).subscribe((response: any) => {
            if (response) {
                this.userService.addDataInUserDetails('currentLogin', response.currentLogin);
                this.userService.addDataInUserDetails('lastFailedLogin', response.lastFailedLogin);
            }
        });
    }

    getScreenContent() {
        this.ajaxService.sendAjaxRequest(this.CONSTANTS.GET_SCREEN_CONTENT, {}).subscribe(response => {
            if (response.loginDetails && response.loginDetails.linksDetailsList) {
                this.screenContent$.next(response.loginDetails.linksDetailsList);
                console.log('screenContent$ ', this.screenContent$.getValue());
            }
        });
    }

    getOfflineBroadcastMessages() {
        return this.ajaxService.sendAjaxRequest(this.CONSTANTS.GET_OFFLINE_BROADCAST_MSG,
            {versionDetails: {version: "1"}, clientDetails: {source: "WEB"}});
    }

    showFingerprintAuthPopup() {

    }

  setTradeLoginType(moduleType) {
    const data = {
       dataMap: {
         tradeLoginType: moduleType
       }
     };
    return this.ajaxService.sendAjaxRequest(this.CONSTANTS.SET_LOGIN_TYPE, data).subscribe(res => {
        this._tradeLoginType.next(res.dataMap.TRADE_SELECTDED_LOGIN);
        console.log('Trade Selected Login: ' + res.dataMap.TRADE_SELECTDED_LOGIN);
    });
   }

   showBiomatric() {
       this.deviceDetailsSrv.loginWithBiometric();
   }

    ngOnDestroy(): void {
        console.log('Destroing Login Service');
        this.disableLoginClick$.next(false);
        this.disableLoginClick$.complete();
    }
}
