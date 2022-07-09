import {Component, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {shareReplay, takeUntil} from "rxjs/operators";
import {AngularAjaxService} from "../../../../../../services/aps-services/ajaxService/angular-ajax.service";
import {AlertController} from "@ionic/angular";
import {TranslatePipe} from "@ngx-translate/core";
import {LpoppService} from "../../lpopp.service";
import {Observable, Subject} from "rxjs";
import {GeneralService, LoadingStatus} from "../../../../../../services/general.service";
import {environment} from "../../../../../../../environments/environment";

@Component({
    selector: 'app-slpap',
    templateUrl: './slpap.component.html',
    styleUrls: ['./slpap.component.scss'],
})
export class SLPAPComponent implements OnInit {

    public childForm: FormGroup;
    unsub$ = new Subject();
    typeOfPaymentList$: Observable<any[]>;
    billTypeFullList: any[];
    @ViewChild('detListingComponent', {static: false}) detListingComponent;
    environment = environment;

    constructor(private formBuilder: FormBuilder,
                private angularAjxService: AngularAjaxService,
                private generalService: GeneralService,
                private translate: TranslatePipe,
                public lpoppService: LpoppService) { }

    ngOnInit() {
        this.typeOfPaymentList$ = this.lpoppService.getTypeOfPaymentList().pipe(shareReplay());
        this.lpoppService.getbillTypeFullList()
            .pipe(shareReplay())
            .subscribe(res => this.billTypeFullList = res);

        this.childForm = this.formBuilder.group({
            typeOfPayment: [null, Validators.required],
            billTypeFull: [null],
            totalAmount: [null],
        });

        this.childForm.valueChanges.pipe(takeUntil(this.unsub$))
            .subscribe(res => {
                this.lpoppService.disableSlide2.next(this.childForm.invalid);
            });
    }

    get typeOfPayment() {
       return  this.childForm.controls.typeOfPayment ? this.childForm.controls.typeOfPayment.value : undefined;
    }

    onChangebBillTypeFull() {
        const data = this.childForm.controls.billTypeFull.value;
        if (data) {
            this.lpoppService.lpoppDetailData.billTypeFull = data.id;
            this.lpoppService.lpoppDetailData.billTypeFullValue = data.displayName;
        }
    }

    resetData() {
        this.childForm.controls.billTypeFull.reset();
        this.childForm.controls.totalAmount.reset();
        if (this.typeOfPayment.id === 'FULLPAYMENT') {
            this.childForm.controls.billTypeFull.setValidators(Validators.required);
            this.childForm.controls.totalAmount.setValidators(Validators.required);
        } else {
            this.childForm.controls.billTypeFull.clearValidators();
            this.childForm.controls.totalAmount.clearValidators();
        }
        this.childForm.controls.billTypeFull.updateValueAndValidity();
        this.childForm.controls.totalAmount.updateValueAndValidity();

        this.lpoppService.lpoppData.lpoppRequestDets = undefined;
        if (this.lpoppService.lpoppRequestDetObj.listingObjCopy) {
            this.lpoppService.lpoppRequestDetObj = JSON.parse(JSON.stringify(this.lpoppService.lpoppRequestDetObj.listingObjCopy));
            this.lpoppService._lodingDetObj.next(LoadingStatus.COMPLETE);
        }
    }
    onChangeTypeOfPayments() {
        const payType = this.childForm.controls.typeOfPayment.value;
        if (payType) {
            this.lpoppService.lpoppDetailData.typeOfPayment = payType.id;
            this.lpoppService.lpoppDetailData.typeOfPaymentValue = payType.displayName;
        }
    }

    isChildValid() {
        const isValid = this.typeOfPayment.id === 'FULLPAYMENT' ? this.childForm.valid
            : this.childForm.valid && this.detListingComponent.lpoppRequestDetObj.dataList.some(data => data.selected === 'Y' && data[3]);
        this.lpoppService.disableSlide2.next(!isValid);
        return this.childForm.valid;
    }

    validate2ndSlide() {
        this.childForm.markAllAsTouched();
        // this.isChildValid(); // as validation is already thr in detlisting
    }

    setTotalAmountChild() {
        if (this.childForm.invalid) {
            return;
        }
        if (this.typeOfPayment.id === 'FULLPAYMENT') {
            this.lpoppService.lpoppDetailData.totalAmount = this.childForm.controls.totalAmount.value;
            this.lpoppService.lpoppData.totalAmount = this.childForm.controls.totalAmount.value;
        } else {
            this.lpoppService.lpoppDetailData.totalAmount = this.detListingComponent.lpoppRequestDetObj.dataList
                .reduce((acc, data) => {
                    return data.selected === 'Y' ? acc + this.lpoppService.getAmount(data[3]) : acc;
                }, 0);
            this.lpoppService.lpoppData.totalAmount = this.lpoppService.lpoppDetailData.totalAmount;
            console.log('SLpap totalAmount', this.lpoppService.lpoppData.totalAmount);

        }
    }

    setFinalData() {
        this.onChangeTypeOfPayments();
        this.onChangebBillTypeFull();

        if (this.detListingComponent) {
            this.detListingComponent.setFinalData();
        } else {
            this.lpoppService.modifyRequestDetListing(this.lpoppService.lpoppRequestDetObj);
            this.lpoppService.modifyRequestDetObj();
        }
    }
}
