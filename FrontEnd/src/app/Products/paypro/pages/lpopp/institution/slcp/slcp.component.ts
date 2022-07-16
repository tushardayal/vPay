import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, MinLengthValidator, Validators} from "@angular/forms";
import {ApsTraslatePipe} from "../../../../../../components/pipes/aps-traslate.pipe";
import {LpoppService} from "../../lpopp.service";
import {AngularAjaxService} from "../../../../../../services/aps-services/ajaxService/angular-ajax.service";
import {catchError, min, takeUntil} from "rxjs/operators";
import {Subject} from "rxjs";
import {AlertController} from "@ionic/angular";
import {TranslatePipe} from "@ngx-translate/core";

@Component({
    selector: 'app-slcp',
    templateUrl: './slcp.component.html',
    styleUrls: ['./slcp.component.scss'],
})
export class SLCPComponent implements OnInit, OnDestroy {

    public slcpForm: FormGroup;
    isValidatedFromAPI = false;
    unsub$ = new Subject();

    constructor(private formBuilder: FormBuilder,
                private angularAjxService: AngularAjaxService,
                private alertCtrl: AlertController,
                private translate: TranslatePipe,
                private lpoppService: LpoppService) {}

    ngOnInit() {
        this.slcpForm = this.formBuilder.group({
            // custdecNo: [null, [ Validators.required, Validators.pattern(this.lpoppService.onlyAlphanumeric)]],
            amountToBePaid: [null, Validators.required],
            officeCode: [null, [ Validators.required, Validators.pattern(this.lpoppService.onlyAlphanumeric)]],
            declarationCode: [null, [Validators.required, Validators.pattern(this.lpoppService.onlyAlphanumeric)]],
            registrationYear: [null, Validators.required, Validators.min(4)],
            registrationSerial: [null, [Validators.required, Validators.pattern(this.lpoppService.onlyAlphanumeric)]],
            registrationNo: [null, [Validators.required, Validators.pattern(this.lpoppService.onlyAlphanumeric)]],
            checkReference: [{value: null, disabled: true}, [Validators.pattern(this.lpoppService.onlyAlphanumeric)]],
            companyCode: [null, [Validators.pattern(this.lpoppService.onlyAlphanumeric)]]
        });

        this.slcpForm.valueChanges.pipe(takeUntil(this.unsub$))
            .subscribe(res => {
                this.isValidatedFromAPI = false;
                this.lpoppService.disableSlide2.next(true);
            });
    }

    async showValidationAlert(message, isError) {
        const errorClass = isError ? 'error-color' : '';
        const msg = `<p class='ion-margin-top ion-no-margin ${errorClass}'>${message}</p>`;
        const validationAlert = await this.alertCtrl.create({
            header: this.translate.transform("lbl_sl_custom_payments_validate"),
            message: msg,
            cssClass: "alert-subscribe",
            buttons: [
                {
                    text: this.translate.transform("lbl_ok"),
                    role: "cancel",
                    handler: () => {
                    }
                }
            ]
        });

        await validationAlert.present();
    }

    validatePayment() {
        if (this.slcpForm.valid) {
            // const detData = {...this.lpoppService.lpoppRequestDet, ...this.slcpForm.value};
            this.lpoppService.lpoppRequestDet = this.slcpForm.value;
            this.lpoppService.lpoppData.lpoppRequestDets = [];
            this.lpoppService.lpoppData.lpoppRequestDets.push(this.lpoppService.lpoppRequestDet);
            const data = this.lpoppService.lpoppData;
            this.angularAjxService.sendAjaxRequest(this.lpoppService.CONSTANTS.VALID_SLCP_REQUEST, data)
                .subscribe(response => {
                    if (response) {
                        const dataMap = response.dataMap;
                        let isError = false;
                        // tslint:disable-next-line:triple-equals
                        if (dataMap.isSuccess == "0") {
                            this.isValidatedFromAPI = true;
                            isError = false;
                            this.lpoppService.lpoppRequestDet.checkReference = dataMap.checkReference;
                            // this.slcpForm.controls.checkReference.patchValue(dataMap.checkReference);
                            this.lpoppService.lpoppRequestDet.transactionIdNo = dataMap.transactionIdNo;
                        } else {
                            // alert("Error in Validation");
                            isError = true;
                        }
                        this.showValidationAlert(dataMap.errorDesc, isError);
                    }
                    this.lpoppService.disableSlide2.next(!this.isValidatedFromAPI);
                });
        }
    }

    validate2ndSlide() {
        this.lpoppService.disableSlide2.next(!this.isValidatedFromAPI);
    }

    setTotalAmountChild() {
        this.lpoppService.lpoppData.totalAmount = this.lpoppService.lpoppRequestDet.amountToBePaid;
    }

    setFinalData() {
        // this.lpoppService.lpoppData;
    }

    ngOnDestroy(): void {
        this.unsub$.next();
        this.unsub$.complete();
        this.unsub$.unsubscribe();
    }
}
