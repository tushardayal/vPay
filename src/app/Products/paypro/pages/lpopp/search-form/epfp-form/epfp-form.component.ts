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
    selector: 'app-epfp-form',
    templateUrl: './epfp-form.component.html',
    styleUrls: ['./epfp-form.component.scss'],
})
export class EpfpFormComponent implements OnInit {

    environment = environment;
    epfPaymentRefNo = "[a-zA-Z]{1}[0-9]{14}";
    public epfpSearchForm: FormGroup;

    constructor(private translate: TranslatePipe,
                public modalController: ModalController,
                private datePipe: DatePipe,
                public usrSrv: UserService,
                private formBuilder: FormBuilder,
                public lpoppService: LpoppService ) { }

    ngOnInit() {

        this.lpoppService.lpoppData.lpoppRequestDets = [];
        this.lpoppService.lpoppDetailData = {};
        this.epfpSearchForm = this.formBuilder.group({
            paymentIdNo: [null, [Validators.required, Validators.pattern(this.epfPaymentRefNo)]],
        });
    }

    validateSearchForm() {
        this.epfpSearchForm.markAllAsTouched();
        if (this.epfpSearchForm.valid) {
            this.getInstitutionList();
        }
        return this.epfpSearchForm.invalid;
    }

    getInstitutionList() {
        this.lpoppService.singleSelection = false;
        // this.lpoppService.lpoppDetailData = this.epfpSearchForm.value;
        this.getEpfDetails();
    }

    private getEpfDetails() {
        const paymentNo = this.epfpSearchForm.controls.paymentIdNo.value;
        Object.assign(this.lpoppService.lpoppDetailData, this.epfpSearchForm.value);

        const zoneCode = paymentNo.substring(0, 1);
        const employerNumber = paymentNo.substring(1, 7);
        const contributionPeriod = paymentNo.substring(7, 13);
        const submissionNumber = paymentNo.substring(13, 15);

        this.lpoppService.lpoppDetailData.zoneCode = zoneCode;
        this.lpoppService.lpoppDetailData.employerNumber = employerNumber;
        this.lpoppService.lpoppDetailData.contributionPeriod = contributionPeriod;
        this.lpoppService.lpoppDetailData.submissionNumber = submissionNumber;

        this.lpoppService.lpoppDetailData.voucherAmount = undefined;
        this.lpoppService.lpoppDetailData.paymentReferenceNo = undefined;

        const dataMap: any = {};
        dataMap.zoneCode = zoneCode;
        dataMap.employerNumber = employerNumber;
        dataMap.contributionPeriod = contributionPeriod;
        dataMap.submissionNumber = submissionNumber;
        const data = {dataMap};
        this.lpoppService.getEpfDetails(data);

    }
}
