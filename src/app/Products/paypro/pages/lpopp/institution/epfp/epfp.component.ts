import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {takeUntil} from "rxjs/operators";
import {LpoppService} from "../../lpopp.service";
import {Subject} from "rxjs";
import {environment} from "../../../../../../../environments/environment";

@Component({
    selector: 'app-epfp',
    templateUrl: './epfp.component.html',
    styleUrls: ['./epfp.component.scss'],
})
export class EPFPComponent implements OnInit {

    public childForm: FormGroup;
    unsub$ = new Subject();
    environment = environment;

    constructor(private formBuilder: FormBuilder,
                public lpoppService: LpoppService) {
    }

    ngOnInit() {
        this.childForm = this.formBuilder.group({
            voucherAmount: [null, Validators.required],
            paymentReferenceNo: [null, Validators.required],
            transactionIdNo: [null]
        });

        this.lpoppService.epfDetails.subscribe(data => {
            this.childForm.controls.voucherAmount.patchValue(data.voucherAmount);
            this.childForm.controls.paymentReferenceNo.patchValue(data.paymentReferenceNo);
            this.childForm.controls.transactionIdNo.patchValue(data.transactionIdNo);
        });
        this.childForm.valueChanges.pipe(takeUntil(this.unsub$))
            .subscribe(res => {
                this.lpoppService.disableSlide2.next(this.childForm.invalid);
            });
    }

    setTotalAmountChild() {
        this.lpoppService.lpoppData.totalAmount = this.childForm.controls.voucherAmount.value;
        Object.assign(this.lpoppService.lpoppDetailData, this.childForm.value);
    }

    setFinalData() {
        // this.lpoppService.modifyRequestDetListing(this.lpoppService.lpoppRequestDetObj);
        this.lpoppService.modifyRequestDetObj();
    }
}
