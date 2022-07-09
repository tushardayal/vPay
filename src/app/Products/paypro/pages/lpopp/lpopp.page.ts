import {Component, OnDestroy, OnInit, Renderer2, ViewChild} from '@angular/core';
import {TranslatePipe} from "@ngx-translate/core";
import {environment} from "../../../../../environments/environment";
import {UserService} from "../../../../services/aps-services/user.service";
import {ModalController} from "@ionic/angular";
import {appConstants} from "../../../../appConstants";
import {DatePipe} from "@angular/common";
import {LpoppService} from "./lpopp.service";
import {Observable, Subject} from "rxjs";
import {shareReplay, takeUntil} from "rxjs/operators";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";

@Component({
    selector: 'app-lpopp',
    templateUrl: './lpopp.page.html',
    styleUrls: ['./lpopp.page.scss'],
})
export class LpoppPage implements OnInit, OnDestroy {

    @ViewChild("wizardSlider", {static: false}) slider;
    @ViewChild('selectedInstitutionType', {static: false}) selectedInstitutionType;
    @ViewChild('selectedInstitutionSearchForm', {static: false}) selectedInstitutionSearchForm;
    // @ViewChild("header", {static: false}) header: HTMLElement;
    activeTabIndex = 0;
    activeColor = "var(--cs-text-accent)";
    normalColor = "rgb(153, 153, 153)";
    environment = environment;
    globalDateFormat = appConstants.dateFormat;
    currentDate = this.datePipe.transform(this.usrSrv.getPaymentApplicationDate(), appConstants.requestDateFormat);
    ionSegmentArray = [
        {
            displayName: this.translate.transform("lbl_payment_details"),
            sectionNo: 1,
            color: this.normalColor
        },
        {
            displayName: this.translate.transform("lbl_institution_details"),
            sectionNo: 2,
            color: this.normalColor
        },
        {
            displayName: this.translate.transform("lbl_confirmation_details"),
            sectionNo: 3,
            color: this.normalColor
        },
    ];
    institutionTypeList: any[];
    debitAccountList$: Observable<any[]>;
    taxTypeList: any[];
    transactionData: any;
    institution: any;
    cictpSearchByList: any[];
    cictpSearchBy: any;
    cictpTransactionTotal = 0;

    headerText;
    // institutionType: any;
    institutionTypeList$;
    unsub$ = new Subject();
    disabledSlide2NextBtn = true;
    paymentDetailsForm: FormGroup;

    constructor(private translate: TranslatePipe,
                public modalController: ModalController,
                private datePipe: DatePipe,
                public usrSrv: UserService,
                private formBuilder: FormBuilder,
                public renderer: Renderer2,
                public lpoppService: LpoppService) {
    }

    get institutionType() {
        return this.paymentDetailsForm.controls.institutionType.value;
    }

    ngOnInit() {
        this.lpoppService.disableSlide2.pipe(takeUntil(this.unsub$)).subscribe(isDisable => this.disabledSlide2NextBtn = isDisable);
        // this.getInstitutionTypes();
        this.createPaymentDetailsForm();
        this.lpoppService.institutionTypeList$
            .pipe(takeUntil(this.unsub$))
            .subscribe(institutionTypes => {
                this.institutionTypeList = institutionTypes;
                const institutionType = this.institutionTypeList.find(a => a.id === this.lpoppService.lpoppData.institutionType);
                this.paymentDetailsForm.controls.institutionType.patchValue(institutionType);
                this.setHeaderText(institutionType.displayName);
            });
        this.getDebitAccountList();
        this.getTaxTypeList();
        this.getCictpSearchByList();
    }

    ionViewDidEnter() {
        this.slider.lockSwipes(true);
    }

    setHeaderText(value) {
        this.headerText = value;
        try {
            const s = this.headerText;
            if (s) {
                this.headerText = s.slice(s.indexOf('(') + 1).replaceAll(')', '');
            }
        } catch (e) {
        }
    }

    createPaymentDetailsForm() {
        this.lpoppService.lpoppData.valueDate = this.currentDate;
        this.paymentDetailsForm = this.formBuilder.group({
            valueDate: [this.currentDate, Validators.required],
            institutionType: [null, Validators.required],
            debitAccount: [null, Validators.required]
        });
    }

    getDebitAccountList() {
        this.debitAccountList$ = this.lpoppService.getDebitAccount().pipe(takeUntil(this.unsub$), shareReplay());
        /*.subscribe((response) => {
            if (response) {
                this.debitAccountList = response.dataList;
            }
        });*/
    }

    getTaxTypeList() {
        this.taxTypeList = [
            {
                id: '1',
                displayName: 'PAYE'
            }
        ];
    }

    ionSlideDidChange($event: CustomEvent<any>) {
        this.slider.lockSwipes(true);
        this.slider.getActiveIndex().then((val) => {
            this.activeTabIndex = val;
        });
    }

    ionSlideReachStart($event: CustomEvent<any>) {
    }

    ionSlideReachEnd($event: CustomEvent<any>) {
    }

    onFinishFunc($event: MouseEvent) {
        if ($event) {
            $event.stopPropagation();
        }
    }

    onNextFunc() {
        console.log('onNextFunc');
        if (this.activeTabIndex === 0) {
            this.paymentDetailsForm.markAllAsTouched();
            if (this.paymentDetailsForm.invalid
                || (this.selectedInstitutionSearchForm
                    && this.selectedInstitutionSearchForm.validateSearchForm())) {
                return;
            }
        } else if (this.activeTabIndex === 1) {
            if (this.selectedInstitutionType.validate2ndSlide) {
                this.selectedInstitutionType.validate2ndSlide();
            }
            if (this.disabledSlide2NextBtn) {
                return;
            }
            this.selectedInstitutionType.setTotalAmountChild();
            this.selectedInstitutionType.setFinalData();
        }
        /*if (this.validatedNxtBtn()) {
            return;
        }*/
        /*if (this.institutionType.id === 'IRDP') {
            this.getOutstandingPaymentDetails();
        } else if (this.institutionType.id === 'CICTP') {
            this.getContainersList();
        }*/
        this.slider.lockSwipes(false);
        this.slider.slideNext(300);
    }

    onPreviousFunc() {
        this.slider.lockSwipes(false);
        this.slider.slidePrev(300);
    }

    onChangeInstitution() {
        const institutionType: any = this.institutionType;
        this.lpoppService.lpoppData.institutionType = institutionType.id;
        this.lpoppService.lpoppData.institutionTypeValue = institutionType.displayName;
        this.lpoppService.lpoppRequestDet = institutionType.id;
        this.transactionData = null;
        this.setHeaderText(institutionType.displayName);
    }

    onChangeDebitAccount() {
        const account = this.paymentDetailsForm.controls.debitAccount.value;
        if (account) {
            this.lpoppService.lpoppData.debitAccountId = account.id;
            this.lpoppService.lpoppData.debitAccountNo = account.displayName + "-" + account.enrichments.currencyCode;
        }
    }

    getOutstandingPaymentDetails() {
        // this.fetchDetails();
    }

    async fetchDetails() {
        /*const modal = await this.modalController.create({
            component: LpoppModalComponent,
            cssClass: 'my-custom-class',
            componentProps: {
                institution: this.institution
            }
        });
        modal.onWillDismiss().then(data => {
            this.transactionData = data.data.data;
            console.log('onWillDismiss', this.transactionData );
            this.cictpTransactionTotal = 0;
            if (this.institution.id === 'CICTP') {
                for (const txn of this.transactionData) {
                    this.cictpTransactionTotal += txn[7].value;
                }
            }
        });
        return await modal.present();*/
    }

    refetch() {
        this.transactionData = null;
    }

    setTransactionData(data) {
        this.transactionData = data;
        console.log('onWillDismiss', this.transactionData);
        this.cictpTransactionTotal = 0;
        if (this.institution.id === 'CICTP') {
            for (const txn of this.transactionData) {
                this.cictpTransactionTotal += txn[7].value;
            }
        }
    }

    getCictpSearchByList() {
        this.cictpSearchByList = [
            {
                id: 'containerNo',
                displayName: 'Container No'
            },
            {
                id: 'CustdecNo ',
                displayName: 'Custdec No'
            }
        ];
    }

    getContainersList() {
        // this.fetchDetails();
    }

    /*validatedNxtBtn() {
        if (this.activeTabIndex === 0) {
            this.paymentDetailsForm.markAllAsTouched();
            return this.paymentDetailsForm.invalid;
        } else if (this.activeTabIndex === 1) {
            return this.disabledSlide2NextBtn;
        }
    }*/

    verifyDetails() {
        this.lpoppService.checkSelfAuth();
    }

    ngOnDestroy(): void {
        this.unsub$.next(null);
        this.unsub$.complete();
        this.unsub$.unsubscribe();
    }
}
