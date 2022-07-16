import {Component, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {takeUntil} from "rxjs/operators";
import {AngularAjaxService} from "../../../../../../services/aps-services/ajaxService/angular-ajax.service";
import {AlertController} from "@ionic/angular";
import {TranslatePipe} from "@ngx-translate/core";
import {LpoppService} from "../../lpopp.service";
import {Subject} from "rxjs";
import {GeneralService} from "../../../../../../services/general.service";

@Component({
    selector: 'app-irdp',
    templateUrl: './irdp.component.html',
    styleUrls: ['./irdp.component.scss'],
})
export class IRDPComponent implements OnInit {

    public childForm: FormGroup;
    unsub$ = new Subject();
    @ViewChild('detListingComponent', {static: false}) detListingComponent;
    constructor(private formBuilder: FormBuilder,
                private angularAjxService: AngularAjaxService,
                private generalService: GeneralService,
                private translate: TranslatePipe,
                private lpoppService: LpoppService) { }

    ngOnInit() {

        this.childForm = this.formBuilder.group({
            taxPaymentAmount: [null],
            penaltyAmount: [null],
            interestAmount: [null],
        }, { validators: this.generalService.atLeastOneValidator });

        /*this.irdpForm.valueChanges.pipe(takeUntil(this.unsub$))
            .subscribe(res => {
                console.log('this.irdpForm.valid ', this.irdpForm.valid);
                this.lpoppService.disableSlide2.next(true);
            });*/
    }

    /*isChildValid() {
        this.lpoppService.disableSlide2.next(this.childForm.invalid);
        return this.childForm.valid;
    }*/

    markFormAsTouched() {
        // this.childForm.markAllAsTouched();
        // this.childForm.updateValueAndValidity();
    }

    /*validateForm() {
        return this.detListingComponent.isCardValid();
    }*/

    setTotalAmountChild() {
        // this.detListingComponent.getFormData();
        let totalAmount = 0;
        const formValue = this.detListingComponent.getFormData(); // this.childForm.value;
        if (formValue.taxPaymentAmount) {
            totalAmount += this.lpoppService.getAmount(formValue.taxPaymentAmount);
        }
        if (formValue.penaltyAmount) {
            totalAmount += this.lpoppService.getAmount(formValue.penaltyAmount);
        }
        if (formValue.interestAmount) {
            totalAmount += this.lpoppService.getAmount(formValue.interestAmount);
        }
        this.lpoppService.lpoppData.totalAmount = totalAmount;
        console.log('irdp', 'this.lpoppService.lpoppData.totalAmount)');
    }

    setFinalData() {
        this.detListingComponent.setFinalData();
    }
}
