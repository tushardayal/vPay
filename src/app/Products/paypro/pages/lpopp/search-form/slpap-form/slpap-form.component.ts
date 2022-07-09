import {Component, OnDestroy, OnInit} from '@angular/core';
import {environment} from "../../../../../../../environments/environment";
import {TranslatePipe} from "@ngx-translate/core";
import {ModalController} from "@ionic/angular";
import {DatePipe} from "@angular/common";
import {UserService} from "../../../../../../services/aps-services/user.service";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {LpoppService} from "../../lpopp.service";
import {Observable, Subject} from "rxjs";
import {shareReplay, takeUntil} from "rxjs/operators";

@Component({
    selector: 'app-slpap-form',
    templateUrl: './slpap-form.component.html',
    styleUrls: ['./slpap-form.component.scss'],
})
export class SlpapFormComponent implements OnInit, OnDestroy {

    environment = environment;
    paymentsTypeList$: Observable<any[]>;
    unsub$ = new Subject();

    public slpapSearchForm: FormGroup;
    constructor(private translate: TranslatePipe,
                public modalController: ModalController,
                private datePipe: DatePipe,
                public usrSrv: UserService,
                private formBuilder: FormBuilder,
                public lpoppService: LpoppService ) { }

    ngOnInit() {
        this.paymentsTypeList$ = this.lpoppService.getPaymentsTypeList().pipe(takeUntil(this.unsub$), shareReplay());

        this.lpoppService.lpoppData.lpoppRequestDets = [];
        this.lpoppService.lpoppDetailData = {};
        this.slpapSearchForm = this.formBuilder.group({
            paymentsType: [null, Validators.required],
            agentCode: [null, [Validators.required, Validators.pattern(this.lpoppService.onlyAlphanumeric)]],
            vesselReferenceNo: [null, [Validators.required, Validators.pattern(this.lpoppService.onlyAlphanumeric)]]
        });
    }

    onChangePaymentsType() {
        const data = this.slpapSearchForm.controls.paymentsType.value;
        this.lpoppService.lpoppDetailData.paymentsType = data.id;
        this.lpoppService.lpoppDetailData.paymentsTypeValue = data.displayName;
    }

    validateSearchForm() {
        this.slpapSearchForm.markAllAsTouched();
        if (this.slpapSearchForm.valid) {
            this.getInstitutionList();
        }
        return this.slpapSearchForm.invalid;
    }

    getInstitutionList() {
        console.log('get data ', this.slpapSearchForm.value);
        this.lpoppService.singleSelection = false;
        this.lpoppService.lpoppDetailData = this.slpapSearchForm.value;
        this.onChangePaymentsType();
        this.lpoppService.getListingData();
    }
    ngOnDestroy(): void {
        this.unsub$.next(null);
        this.unsub$.complete();
        this.unsub$.unsubscribe();
    }
}
