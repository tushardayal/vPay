import { Component, OnInit } from '@angular/core';
import {environment} from "../../../../../../../environments/environment";
import {TranslatePipe} from "@ngx-translate/core";
import {ModalController} from "@ionic/angular";
import {DatePipe} from "@angular/common";
import {UserService} from "../../../../../../services/aps-services/user.service";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {LpoppService} from "../../lpopp.service";
import {Observable} from "rxjs";
import {shareReplay} from "rxjs/operators";

@Component({
    selector: 'app-irdp-form',
    templateUrl: './irdp-form.component.html',
    styleUrls: ['./irdp-form.component.scss'],
})
export class IrdpFormComponent implements OnInit {

    environment = environment;
    taxTypes$: Observable<any[]>;
    taxablePeriodList$: Observable<any[]>;
    paymentTypeList$: Observable<any[]>;

    public irdpSearchForm: FormGroup;
    constructor(private translate: TranslatePipe,
                public modalController: ModalController,
                private datePipe: DatePipe,
                public usrSrv: UserService,
                private formBuilder: FormBuilder,
                public lpoppService: LpoppService ) { }

    ngOnInit() {
        this.taxTypes$ = this.lpoppService.getTaxType().pipe(shareReplay());
        // this.taxablePeriodList$ = this.lpoppService.getTaxablePeriod().pipe(shareReplay());
        this.paymentTypeList$ = this.lpoppService.getpaymentType().pipe(shareReplay());

        this.lpoppService.lpoppData.lpoppRequestDets = [];
        this.lpoppService.lpoppDetailData = {};
        this.irdpSearchForm = this.formBuilder.group({
            tin: [null, [Validators.required, Validators.pattern(this.lpoppService.onlyAlphanumeric)]],
            taxType: [null, Validators.required],
            taxablePeriod: [null, Validators.required],
            paymentType: [null, Validators.required]
        });
    }

    onChangeTaxType() {
        const taxablePeriod = this.irdpSearchForm.controls.taxType.value;
        this.lpoppService.lpoppDetailData.taxType = taxablePeriod.id;
        this.lpoppService.lpoppDetailData.taxTypeVal = taxablePeriod.displayName;
    }

    onChangeTaxablePeriod() {
        const taxablePeriod = this.irdpSearchForm.controls.taxablePeriod.value;
        this.lpoppService.lpoppDetailData.taxablePeriod = taxablePeriod.id;
        this.lpoppService.lpoppDetailData.taxablePeriodVal = taxablePeriod.displayName;
    }

    onChangepaymentType() {
        const paymentType = this.irdpSearchForm.controls.paymentType.value;
        this.lpoppService.lpoppDetailData.paymentType = paymentType.id;
        this.lpoppService.lpoppDetailData.paymentTypeVal = paymentType.displayName;
    }

    validateSearchForm() {
        this.irdpSearchForm.markAllAsTouched();
        if (this.irdpSearchForm.valid) {
            this.getInstitutionList();
        }
        return this.irdpSearchForm.invalid;
    }

    getInstitutionList() {
        console.log('get data ', this.irdpSearchForm.value);
        this.lpoppService.singleSelection = true;
        this.lpoppService.lpoppDetailData = this.irdpSearchForm.value;
        this.onChangeTaxType();
        // this.onChangeTaxablePeriod();
        this.onChangepaymentType();
        this.lpoppService.getListingData();
    }
}
