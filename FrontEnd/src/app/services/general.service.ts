import { Injectable } from '@angular/core';
import {appConstants} from "../appConstants";
import {AlertController} from "@ionic/angular";
import {BehaviorSubject, interval, Observable, Subject} from "rxjs";
import {AngularAjaxService} from "./aps-services/ajaxService/angular-ajax.service";
import {InputFieldValidationService} from "../directives/input-field-validation.directive";
import {map, takeUntil} from "rxjs/operators";
import {ToastService} from "./aps-services/toast-service";
import {DatePipe} from "@angular/common";
import {FormGroup, ValidationErrors, ValidatorFn} from "@angular/forms";
import {UserService} from "./aps-services/user.service";

export enum LoadingStatus {
    LOADING, COMPLETE
}
@Injectable({
    providedIn: 'root'
})
export class GeneralService {

    resendOTPTImer$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
    destroyOtp$ = new Subject();

    constructor(private alertCtrl: AlertController,
                private inputFieldValidator: InputFieldValidationService,
                private toastService: ToastService,
                private datePipe: DatePipe,
                private usrSrv: UserService,
                private ajaxService: AngularAjaxService) {
    }

    generateOTP() {
        if (this.resendOTPTImer$.value) {
            return new Observable(observer => {
                observer.next(null);
            });
        }
        this.setOtpTimer();
        const data = { pageFrom: "AUTHORIZATION" };
        return this.ajaxService
            .sendAjaxRequest(appConstants.GEN_AUTHOTP, appConstants.GEN_AUTHOTPDATA)
            .pipe(
                map(value => {
                    this.toastService.presentToast(
                        "OTP sent to your registered mobile number"
                    );
                    return value;
                })
            );
    }
    setOtpTimer() {
        const otpTimeoutSeconds = appConstants.otpTimeOutInSec;
        this.destroyOtp$ = new Subject();
        interval(1000)
            .pipe(takeUntil(this.destroyOtp$))
            .subscribe(value => {
                const seconds = (otpTimeoutSeconds - value) ;
                if (seconds === 0) {
                    this.resendOTPTImer$.next(null);
                    this.updateOTPBtnText();
                    this.destroyOtp$.next();
                    this.destroyOtp$.complete();
                } else {
                    const timeObj = new Date(1970, 0, 1).setSeconds(seconds);
                    // tslint:disable-next-line:max-line-length
                    this.resendOTPTImer$.next('<ion-icon name="stopwatch-outline"></ion-icon> ' + this.datePipe.transform(timeObj, 'mm:ss'));
                    this.updateOTPBtnText();
                }
            });
    }
    updateOTPBtnText() {
        const el: any = document.querySelector('.authOptTimer');
        if (el) {
            el.innerHTML = this.resendOTPTImer$.value ? this.resendOTPTImer$.value : 'Resend OTP';
            el.disabled = this.resendOTPTImer$.value ? true : false;
        }
    }
    async showOtpAlert(inputData, entityName, url?) {
        const fieldsArray = [];
        fieldsArray.push({
            name: "OTP",
            type: "password",
            placeholder: "Enter OTP"
        });
        if (appConstants.authRemarksApplicableEntities.includes(entityName) && !inputData.isConfirm) {
            fieldsArray.push({
                name: "Remarks",
                type: 'textarea',
                placeholder: "Remarks"
            });
        }
        const otpAlert = await this.alertCtrl.create({
            header: "Validate OTP",
            inputs: [
                ...fieldsArray
            ],
            cssClass: "alert-subscribe",
            backdropDismiss: false,
            buttons: [
                {
                    text: '',
                    handler: () => {
                        if (this.resendOTPTImer$.value) {
                            return false;
                        }
                        this.generateOTP().subscribe(value => console.log("resend"));
                        return false;
                    },
                    cssClass: 'authOptTimer'
                },
                {
                    text: "Cancel",
                    role: "cancel",
                    handler: () => {
                        this.destroyOtp$.next();
                        this.destroyOtp$.complete();
                        this.destroyOtp$.unsubscribe();
                        this.resendOTPTImer$.next(null);
                        console.log("close");
                    }
                },
                {
                    text: "Ok",
                    handler: (data) => {
                        if (data.OTP === undefined || data.OTP === '') {
                            return false;
                        }
                        if (this.inputFieldValidator.validateInput(data.OTP) || this.inputFieldValidator.validateInput(data.Remarks)) {
                            return false;
                        }
                        inputData.OTP = data.OTP;
                        inputData.authRemarks = data.Remarks;
                    }
                }
            ]
        });

        await this.updateOTPBtnText();
        await otpAlert.present();
        return otpAlert.onDidDismiss();
    }

    public atLeastOneValidator: ValidatorFn = (control: FormGroup): ValidationErrors | null => {
        const controls = control.controls;
        if (controls) {
            const theOne = Object.keys(controls).findIndex(key => controls[key].value);
            if (theOne === -1) {
                return {
                    atLeastOneRequired: {
                        text: 'At least one should be selected'
                    }
                };
            }
        }
    }

    public addFilters(genericFilters) {
        let filters = [];
        for (const obj of genericFilters) {
            if (obj.rangeFilter) {
                obj.childFilters = [
                    {
                        name: obj.name + "Start",
                        displayName: "Start " + obj.displayName,
                        type: obj.type,
                        rangeFilter: obj.rangeFilter
                    },
                    {
                        name: obj.name + "End",
                        displayName: "End " + obj.displayName,
                        type: obj.type,
                        rangeFilter: obj.rangeFilter
                    }
                ];
            }
            /*obj.urlData = {};
            if (obj.fieldType === "select" && (obj.url.includes("getApplicableCurrency"))) {
                obj.urlData = {
                    dataMap: {
                        entityKey: this.selectedProduct
                    }
                };
            }*/
            if (obj.fieldType === 'radio') {
                obj._type = obj.type;
                obj.type = obj.fieldType;
            }
            if (obj.fieldType === 'select') {
                obj._type = obj.type;
                obj.type = 'select';
                obj.urlData = obj.urlData ? obj.urlData : {};
                this.ajaxService.sendAjaxRequest(obj.url, obj.urlData)
                    .subscribe(value => {
                        obj.options = value.dataList;
                    });
            }
        }
        filters.push(...genericFilters);
        return filters;
    }

    public groupAccountsWithCorporateId(accounts): any[] {
        const data = accounts;
        let dataList = accounts;
        if (data && this.usrSrv.isGroupSelected) {
            data.sort((a, b) => a.group < b.group ? -1 : (a.group > b.group ? 1 : 0));
            const groups = new Set();
            for (const obj of data) {
                if (obj.enrichments.group) {
                    groups.add(obj.enrichments.group);
                }
            }
            dataList = [];
            if (groups.size > 0) {
                for (const grp of groups) {
                    const tempData = [{
                        id: undefined,
                        displayName: grp
                    }, ...data.filter(a => a.enrichments.group === grp)];
                    dataList.push(...tempData);
                }
            }
        }
        return dataList;
    }
}
export function typeFilterData(data) {
    return {
        filters: [
            {name: "typeId", value: data, type: "String"},
            {name: "productIdAppend", value: "Y", type: "String"}]
    };
}
