import { InputFieldValidationService } from './../../../../directives/input-field-validation.directive';
import {ObjTransferService} from 'src/app/services/aps-services/obj-transfer.service';
import {AfterViewInit, Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren} from "@angular/core";
import {FormArray, FormBuilder, FormGroup, Validators} from "@angular/forms";
import {DatePipe} from '@angular/common';
import {ActivatedRoute, Router} from "@angular/router";
import {ActionSheetController, AlertController, MenuController, ModalController, NavController} from "@ionic/angular";
import * as _ from "lodash";
import {OwnAccountSummaryService} from "./own-account-summary.service";
import {ToastService} from "src/app/services/aps-services/toast-service";
import {environment} from "../../../../../environments/environment";
import {UserService} from "src/app/services/aps-services/user.service";
import {ExchangeRateService} from "../payment-request-service/exchange-rate.service";
import {SelectAuthorizerComponent} from 'src/app/components/select-authorizer/select-authorizer/select-authorizer.component';
import {OatRequestModel} from "./oatRequestModel";
import {BehaviorSubject, interval, of, Subject} from "rxjs";
import {catchError, map, takeUntil} from "rxjs/operators";
import {BicCodeSearchService} from "../../../../components/bic-code-search/bic-code-search.service";
import {TranslatePipe} from '@ngx-translate/core';
import {appConstants} from "../../../../appConstants";
import {FileUploadComponent} from "../../../../components/file-upload/file-upload.component";
import {FileValidatorService} from "../../../../services/file-validator.service";
import {HelpPageService} from "../../../../components/help-page/help-page.service";
import {GeneralService} from "../../../../services/general.service";

@Component({
    selector: "app-own-account-transfer-initiate",
    templateUrl: "./own-account-transfer-initiate.page.html",
    styleUrls: ["./own-account-transfer-initiate.page.scss"],
    providers: [TranslatePipe]
})
export class OwnAccountTransferInitiatePage implements OnInit, AfterViewInit {
    // data;
    @ViewChild("wizardSlider", {static: false}) slider;
    @ViewChild('contentBox' , { static: false}) contentBox: ElementRef;
    @ViewChildren('receiptEl') receiptEl: QueryList<ElementRef>;
    public paymentDetailsForm: FormGroup;
    public beneDetailsForm: FormGroup;
    unsub$ = new Subject();
    destroyOtp$ = new Subject();
    showMandatory = false;
    activeTabIndex = 0;
    activeColor = "var(--cs-text-accent)";
    normalColor = "rgb(153, 153, 153)";
    ionSegmentArray = [
        {
            displayName: this.translate.transform("lbl_payment_details"),
            sectionNo: 1,
            color: this.normalColor
        },
        {
            displayName: this.translate.transform("lbl_payment_method"),
            sectionNo: 2,
            color: this.normalColor
        },
        {
            displayName: this.translate.transform("lbl_confirmation_details"),
            sectionNo: 3,
            color: this.normalColor
        },
    ];
    public recordSubmitted = false;
    isSelfAuth = false;
    selectedPaymentmethodCode = "";
    paymentMethodList: any[];
    debitAccountsList: any[];
    creditAccountsList: any[];
    debitbalance: '';
    creditbalance: '';
    creditcurrrencycode: "";
    creditCurrency = {};
    creatingRecord = false;

    bicCodeDetails: any = {};
    changesList: any[] = [];
    remittancePurposeList: any[] = [];

    globalDateFormat = appConstants.dateFormat;
    minDate;

    fxRateApplicable = false;
    fxRate: any = "";

    selectedCreditCurrency: any;
    selectedDebitCurrency: any;

    isDealNoMandatory = false;
    isDealNoApplicable = false;

    paymenthandlerobj: any = {};
    changedAmount: any = "debit";
    dealNumber: any;
    supportingDocApplicable = false;
    // beneficiaryPaymentMethodMapDetails: any;
    oatRequest: any = {};
    tokenNumber;
    selectedAuthType: any;
    tokenRequired: boolean;
    oatRequestModel: OatRequestModel;
    oatPaymentMethodApplicable: boolean;
    environment = environment;
    makerRemarksApplicable = appConstants.authRemarksApplicableEntities.includes("OWNACCOUNTTRANSFER");
    maxDate: any;
    showDebitAmount: string;
    showPayableAmount: string;
    private resendOTPTImer$:BehaviorSubject<any>= new BehaviorSubject<any>(null);

    constructor(
        public formBuilder: FormBuilder,
        private oatService: OwnAccountSummaryService,
        private actionSheetCtrl: ActionSheetController,
        private tostSrv: ToastService,
        private userSrv: UserService,
        private router: Router,
        private route: ActivatedRoute,
        private exchangeRateSrv: ExchangeRateService,
        private alertCtrl: AlertController,
        private modalController: ModalController,
        private menu: MenuController,
        private bicCodeSrv: BicCodeSearchService, private datePipe: DatePipe,
        private translate: TranslatePipe,
        private objTransSrv: ObjTransferService,
        private fileValiator: FileValidatorService,
        private helpSrv: HelpPageService,
        private navCtrl: NavController,
        private genericService: GeneralService,
        private inputFieldValidator: InputFieldValidationService
    ) {
    }

    get pForm() {
        return this.paymentDetailsForm.controls;
    }

    get paymentMethodDetForm() {
        // @ts-ignore
        return this.beneDetailsForm.controls.paymentMethodGroup.controls;
    }

    identify(index, item) {
        return item.id;
    }
    ngOnInit() {
        const currentDate = this.datePipe.transform(this.userSrv.getPaymentApplicationDate(), appConstants.requestDateFormat);
        this.minDate = new Date(this.userSrv.formatDate(currentDate)).toISOString();
        this.maxDate = (new Date(currentDate).getFullYear() + 10).toString();
        console.log(this.minDate);

        this.paymentDetailsForm = this.formBuilder.group({
            valueDate: [null, Validators.required],
            corpRefNo: [null, Validators.required],
            selectedPaymentMethod: [null, Validators.required],
            selectedCorporateAccount: [{value: null, disabled: true}, Validators.required],
            creditAccount: [null, Validators.required],
            payableAmount: [
                null,
                [
                    Validators.required,
                    Validators.pattern("^\\d+(,\\d+)*?(\\.\\d{1,2})?$"),
                    Validators.maxLength(14),
                ],
            ],
            debitAmount: [
                null,
                [
                    Validators.required,
                    Validators.pattern("^\\d+(,\\d+)*?(\\.\\d{1,2})?$"),
                    Validators.maxLength(14),
                ],
            ],
            selectedCreditCurrency: [null],
            selectedDebitCurrency: [null],

        });
        this.paymentDetailsForm.controls.valueDate.setValue(this.userSrv.getPaymentApplicationDate());


        this.beneDetailsForm = this.formBuilder.group({
            remarks: [null],
            selectedPaymentMethodBenificiary: [null],
           /* paymentInstructions: this.formBuilder.array([
                this.formBuilder.control(null, Validators.required),
            ]),*/
            paymentMethodGroup: this.formBuilder.group({}),
            uploadFileDataName: [null],
            makerRemarks: [null]
        });


        this.getPaymentMethods();
        this.getDebitAccounts();
        this.getCheckDealNo();

        this.pForm.selectedPaymentMethod.valueChanges.subscribe(value => {
            console.log('selectedPaymentMethod', value);
            this.beneDetailsForm.removeControl("paymentMethodGroup");
            this.beneDetailsForm.removeControl("paymentInstructions");
            switch (value.enrichments.paymentMethodCode) {
                case 'EP3':
                case 'EP5': {
                    this.beneDetailsForm.addControl(
                        "paymentMethodGroup",
                        this.formBuilder.group({
                            bicCode: [null, Validators.required],
                            selectedChargeTypes: [null, Validators.required],
                            selectedRemittancePurpose: [null, Validators.required],
                            beneficiaryBank: [null, Validators.required],
                            beneficiaryBankBranch: [null, Validators.required]
                        })
                    );
                    this.addPaymentInstructionsControl();
                    break;

                }
                case 'EP17': {
                    this.beneDetailsForm.addControl(
                        "paymentMethodGroup",
                        this.formBuilder.group({
                            // bicCode: [null, Validators.required],
                            beneficiaryBank: [null, Validators.required],
                            beneficiaryBankBranch: [null, Validators.required],
                            selectedRemittancePurpose: [null, Validators.required]
                        })
                    );
                    this.addPaymentInstructionsControl();
                    break;
                }
                case 'EP18': {
                    this.beneDetailsForm.addControl(
                        "paymentMethodGroup",
                        this.formBuilder.group({
                            // bicCode: [null, Validators.required],
                            beneficiaryBank: [null, Validators.required],
                            beneficiaryBankBranch: [null, Validators.required]
                        })
                    );
                    this.addPaymentInstructionsControl();
                    break;
                }
                default: {
                    break;
                }
            }
        });

        this.pForm.payableAmount.valueChanges
            .pipe(takeUntil(this.unsub$))
            .subscribe(value => {
                this.showPayableAmount = this.formatAmount(value);
            });

        this.pForm.debitAmount.valueChanges
            .pipe(takeUntil(this.unsub$))
            .subscribe(value => {
                this.showDebitAmount = this.formatAmount(value);
            });

    }

    addPaymentInstructionsControl() {
        this.beneDetailsForm.addControl(
            "paymentInstructions",
            this.formBuilder.array([
                this.formBuilder.control(null, Validators.required),
            ])
        );
    }

    formatAmount(value: string) {
        let newAmtStr = value;
        if (value) {
            const strSplitedAmt = value.split('.');
            if (strSplitedAmt.length > 1) {
                const wholeAmt = strSplitedAmt[0];
                const decAmt = strSplitedAmt[1];
                newAmtStr = `${wholeAmt}.<small>${decAmt}</small>`;
            }
        }
        return newAmtStr;
    }
    ngAfterViewInit() {
        this.slider.lockSwipes(true);
    }

    getCheckDealNo() {
        this.exchangeRateSrv.checkDealNo().subscribe((response) => {
            if (
                response.dataMap &&
                response.dataMap.ISDEAL &&
                response.dataMap.ISDEAL === "Y"
            ) {
                this.isDealNoApplicable = true;
            } else {
                this.isDealNoApplicable = false;
            }
            if (
                response.dataMap.ISDEALSETYES &&
                response.dataMap.ISDEALSETYES === "Y"
            ) {
                this.isDealNoMandatory = true;
            }
        });
    }

    getPaymentMethods() {

        this.oatService
            .getPaymentMethods()
            .subscribe((response) => {
                this.paymentMethodList = response.dataList;
                this.oatPaymentMethodApplicable = this.paymentMethodList[0].enrichments.oatPaymentMethodApplicable === 'Y';
                if (this.oatPaymentMethodApplicable === false) {
                    this.paymentDetailsForm.controls.selectedPaymentMethod.setValue(_.filter(this.paymentMethodList, (o) => {
                        return o.enrichments.paymentMethodCode === 'EP1';
                    }));
                }
            });
    }

    getDebitAccounts() {
        this.oatService
            .getDebitAccounts()
            .pipe(map(value => {
                const acc = value.dataList;
                const dataList = this.genericService.groupAccountsWithCorporateId(acc);
                const response = value;
                response.dataList = dataList;
                return response;
            }))
            .subscribe((response) => {
                // tslint:disable-next-line:max-line-length
                this.debitAccountsList = this.createActionList(response.dataList, this.paymentDetailsForm.controls.selectedCorporateAccount);
            });
    }

    addPaymentInstruction() {
        const instructionArr = this.beneDetailsForm.controls.paymentInstructions as FormArray;
        if (this.beneDetailsForm.controls.paymentInstructions.valid) {
            instructionArr.push(this.formBuilder.control(null, Validators.required));
        } else {
            this.beneDetailsForm.controls.paymentInstructions.markAsTouched();
        }
    }

    removePaymentInstruction(index) {
        const instructionArr = this.beneDetailsForm.controls.paymentInstructions as FormArray;
        instructionArr.removeAt(index);
    }

    createActionList(availableLists, selectedObj) {
        const actionListData = [];
        for (const obj of availableLists) {
            const btn = {
                id: obj.id,
                displayName: obj.displayName + ' - ' + (obj.enrichments && obj.enrichments.currencyCode) || '',
                enrichments: obj.enrichments,
                cssClass:
                    selectedObj.id === obj.id ? "selected-list-type" : "",
                handler: () => {
                    selectedObj.value = obj;
                    for (const btn1 of actionListData) {
                        if (btn === btn1) {
                            btn1.cssClass = "selected-list-type";
                        } else {
                            delete btn1.cssClass;
                        }
                    }
                },
            };
            actionListData.push(btn);
        }
        return actionListData;
    }

    async presentActionSheet(actionSheetData, title) {
        const actionSheet = await this.actionSheetCtrl.create({
            header: title,
            cssClass: "select-listing-action-sheet",
            buttons: actionSheetData,
        });
        await actionSheet.present();
        return await actionSheet.onWillDismiss();
    }

    onFinishFunc($event: MouseEvent) {
        if ($event) {
            $event.stopPropagation();
        }
    }

    onNextFunc() {
        // console.log(this.paymentDetailsForm);
        const invalidData = this.translate.transform("lbl_invalid_data");
        const dealNoRequired = this.translate.transform("lbl_deal_no_required");
        console.log("beneDetailsForm", this.beneDetailsForm);
        if (this.activeTabIndex === 0 && this.paymentDetailsForm.invalid) {
            this.tostSrv.presentToast(invalidData);
            this.paymentDetailsForm.markAllAsTouched();
            return;
        }
        if (this.activeTabIndex === 1 && this.beneDetailsForm.invalid) {
            this.tostSrv.presentToast(invalidData);
            this.beneDetailsForm.markAllAsTouched();
            return;
        }
        if (
            this.activeTabIndex === 1 &&
            this.isDealNoApplicable &&
            this.isDealNoMandatory &&
            (!this.dealNumber || this.dealNumber === "")
        ) {
            this.showDealNoAlert();
            this.tostSrv.presentToast(dealNoRequired);
            return;
        }
        this.slider.lockSwipes(false)
        this.slider.slideNext(300);
        this.activeTabIndex++;
    }

    onPreviousFunc() {
        this.slider.lockSwipes(false);
        this.slider.slidePrev(300);
    }

    ionSlideReachStart($event: CustomEvent<any>) {
    }

    ionSlideReachEnd($event: CustomEvent<any>) {
    }

    ionSlideDidChange($event: CustomEvent<any>) {
        this.slider.lockSwipes(true);
        this.slider.getActiveIndex().then((val) => {
            this.activeTabIndex = val;
        });
    }


    onChangePaymentMethod() {
        this.paymentDetailsForm.controls.selectedCorporateAccount.reset();
        this.paymentDetailsForm.controls.selectedCorporateAccount.enable();
        this.paymentDetailsForm.controls.creditAccount.reset();
        this.selectedDebitCurrency = "";
        this.debitbalance = '';
        this.creditcurrrencycode = "";
        this.creditbalance = '';
        this.resetAmoutDetails();
        const selectedPayment = this.paymentDetailsForm.controls.selectedPaymentMethod;
        // tslint:disable-next-line:max-line-length
        this.beneDetailsForm.controls.selectedPaymentMethodBenificiary.setValue(this.paymentDetailsForm.controls.selectedPaymentMethod.value);

        this.getSupportingDocApplicable();
        this.selectedPaymentmethodCode = selectedPayment.value.enrichments.paymentMethodCode;
        const paymentValid = this.translate.transform("lbl_payment_instruction_valid");
        if (this.selectedPaymentmethodCode === 'EP5') {
            this.showMandatory = true;
            this.tostSrv.presentToast(paymentValid);
        } else {
            this.showMandatory = false;
        }
        this.bicCodeSrv.setBicCodeType(this.selectedPaymentmethodCode);
        this.getChargeTypeAndRemittancePurpose();
    }

    getChargeTypeAndRemittancePurpose() {
        if (['EP17', 'EP5', 'EP3'].includes(this.selectedPaymentmethodCode)) {
            this.changesList = [];
            this.remittancePurposeList = [];
            this.oatService.getChargeType(this.selectedPaymentmethodCode)
                .pipe(takeUntil(this.unsub$))
                .subscribe(value => {
                    this.changesList = value.dataList;
                });
            this.oatService.getRemittancePurpose(this.selectedPaymentmethodCode)
                .pipe(takeUntil(this.unsub$))
                .subscribe(value => {
                    this.remittancePurposeList = value.dataList;
                });
        }
    }

    getSupportingDocApplicable() {

        this.beneDetailsForm.removeControl("uploadFileDataName");

        const benificarySupoortDoc = this.beneDetailsForm.controls.selectedPaymentMethodBenificiary;
        const suppDoc = benificarySupoortDoc.value.enrichments.supportingdocument;
        if (suppDoc === "true" || suppDoc === "y") {
            if (this.paymentDetailsForm.get("selectedPaymentMethod").value.enrichments.paymentMethodCode === "EP5") {
                this.beneDetailsForm.addControl(
                    "uploadFileDataName",
                    this.formBuilder.control(null, [
                        Validators.required,
                        this.fileValiator.validateFile(benificarySupoortDoc.value.enrichments)
                    ])
                );
            } else {
                this.beneDetailsForm.addControl(
                    "uploadFileDataName",
                    this.formBuilder.control(null, [
                        this.fileValiator.validateFile(benificarySupoortDoc.value.enrichments)
                    ])
                );
            }
            this.supportingDocApplicable = true;
        } else {
            this.supportingDocApplicable = false;
        }

        /*if (benificarySupoortDoc.value.enrichments.paymentMethodCode == 'EP1') {
            this.showBenificaryDetails = true;
        } else {
            this.showBenificaryDetails = false;
        }*/
        /*this.beneDetailsForm.removeControl("paymentMethodGroup");
        this.beneDetailsForm.addControl(
          "paymentMethodGroup",
          this.formBuilder.group({})
        );*/
    }

    onChangeDebitAccounts() {
        if (!this.paymentDetailsForm.controls.selectedCorporateAccount.value) {
            return;
        }
        this.paymentDetailsForm.controls.creditAccount.reset();
        this.creditcurrrencycode = "";
        this.creditbalance = '';
        this.resetAmoutDetails();
        const updateDebitDetailsData = this.paymentDetailsForm.controls.selectedCorporateAccount;
        if (updateDebitDetailsData && updateDebitDetailsData.value.id) {
            this.oatService.getOnlineBalance(updateDebitDetailsData.value).subscribe(response => {
                this.debitbalance = response.dataList[0].enrichments.balance;
            });
            this.paymentDetailsForm.controls.selectedDebitCurrency.setValue(updateDebitDetailsData.value.enrichments.currencyCode);

            this.getCreditAccounts();
        }
    }

    getCreditAccounts() {
        if (!this.paymentDetailsForm.controls.selectedCorporateAccount.value
            && !this.paymentDetailsForm.controls.selectedPaymentMethod.value) {
            return;
        }
        this.oatService.getCreditAccounts(
            this.paymentDetailsForm.controls.selectedCorporateAccount.value,
            this.paymentDetailsForm.controls.selectedPaymentMethod.value)
            .subscribe(data => {
                if (data.dataList && data.dataList.length > 0) {
                    this.creditAccountsList = this.createActionList(data.dataList, this.paymentDetailsForm.controls.creditAccount);

                }
            });
    }


    onChangeCreditAccounts() {
        if (!this.paymentDetailsForm.controls.creditAccount.value) {
            return;
        }
        const selectedCreditAccount = this.paymentDetailsForm.controls.creditAccount.value;
        if (selectedCreditAccount) {

            this.paymentDetailsForm.controls.selectedCreditCurrency.setValue(selectedCreditAccount.enrichments.currencyCode);
            this.creditcurrrencycode = selectedCreditAccount.enrichments.currencyCode;
            this.oatService.getOnlineBalance(selectedCreditAccount).subscribe(response => {
                this.creditbalance = response.dataList[0].enrichments.balance;
            });

            this.creditCurrency = {
                displayName: selectedCreditAccount.enrichments.currencyCode,
                id: selectedCreditAccount.enrichments.currencyId
            };

            this.changeCreditCurrencies();

            const bicCodeData: any = {};
            if (this.selectedPaymentmethodCode !== 'EP1') {
                bicCodeData.bicCode = selectedCreditAccount.enrichments.BicCode;
                bicCodeData.bankName = selectedCreditAccount.enrichments.bankName;
                bicCodeData.branchName = selectedCreditAccount.enrichments.branchName;
                bicCodeData.address1 = selectedCreditAccount.enrichments.address1;
                bicCodeData.address2 = selectedCreditAccount.enrichments.address2;
                bicCodeData.address3 = selectedCreditAccount.enrichments.address3;
                bicCodeData.country = selectedCreditAccount.enrichments.country;
                bicCodeData.location = selectedCreditAccount.enrichments.location;
                bicCodeData.state = selectedCreditAccount.enrichments.state;
                bicCodeData.city = selectedCreditAccount.enrichments.city;

                if (this.selectedPaymentmethodCode === "EP17"
                    || this.selectedPaymentmethodCode === "EP18") {
                    bicCodeData.bankName = selectedCreditAccount.enrichments.slipsCeftBankName;
                    bicCodeData.branchName = selectedCreditAccount.enrichments.slipsCeftBranchName;
                    bicCodeData.bankCode = selectedCreditAccount.enrichments.slipsCeftBankCode;
                    bicCodeData.branchCode = selectedCreditAccount.enrichments.slipsCeftBranchCode;
                }
                this.onSelectBicCode(bicCodeData);
            }
        }
    }

    changeCreditCurrencies() {
        this.resetAmoutDetails();
        if (this.pForm.selectedCreditCurrency && this.pForm.selectedCreditCurrency.value
                && this.pForm.selectedDebitCurrency && this.pForm.selectedDebitCurrency.value) {
            this.fxRateApplicable = this.pForm.selectedCreditCurrency.value !== this.pForm.selectedDebitCurrency.value;
        } else {
            this.fxRateApplicable = false;
        }
    }

    changePayableAmount($event: string) {
        if (
            this.paymentDetailsForm.controls.payableAmount.invalid ||
            this.paymentDetailsForm.controls.selectedCorporateAccount.invalid ||
            this.paymentDetailsForm.controls.selectedCreditCurrency.invalid
        ) {
            this.paymentDetailsForm.controls.payableAmount.setValue(null);
            this.paymentDetailsForm.controls.debitAmount.setValue(null);
            return;
        }
        if (this.isDealNoApplicable && this.isDealNoMandatory && !this.dealNumber && this.dealNumber === "") {
            this.showDealNoAlert();
        }
        this.calculateDrCrAmount(this.exchangeRateSrv.CONSTANTS.CREDITAMOUNTTYPE);
    }

    changeDebitAmount() {
        if (
            this.paymentDetailsForm.controls.debitAmount.invalid ||
            this.paymentDetailsForm.controls.selectedCorporateAccount.invalid ||
            this.paymentDetailsForm.controls.selectedCreditCurrency.invalid
        ) {
            this.paymentDetailsForm.controls.payableAmount.setValue(null);
            this.paymentDetailsForm.controls.debitAmount.setValue(null);
            return;
        }
        this.calculateDrCrAmount(this.exchangeRateSrv.CONSTANTS.DEBITAMOUNTTYPE);
    }

    resetCcy() {
        this.paymentDetailsForm.controls.selectedCreditCurrency.reset();
        this.resetAmoutDetails();
    }

    resetAmoutDetails() {
        this.paymentDetailsForm.controls.debitAmount.reset();
        this.paymentDetailsForm.controls.payableAmount.reset();
        this.dealNumber = undefined;
    }


    calculateDrCrAmount(type) {
        const obj = {
            type: '',
            dealNumber: this.dealNumber,
            fxRate: this.fxRate,
            entityName: "OWNACCOUNTTRANSFER",
            changedAmount: this.changedAmount,
            paymenthandlerobj: this.paymenthandlerobj,
            valueDate: this.paymentDetailsForm.controls.valueDate,
            debitAmount: this.paymentDetailsForm.controls.debitAmount,
            payableAmount: this.paymentDetailsForm.controls.payableAmount,
            selectedPaymentMethod: this.paymentDetailsForm.controls.selectedPaymentMethod,
            selectedCreditCurrency: this.creditCurrency,
            selectedCorporateAccount: this.paymentDetailsForm.controls.selectedCorporateAccount,
        };

        obj.type = type;

        const amountDetails = this.exchangeRateSrv.calculateDrCrAmount(obj);
        if (amountDetails) {
            amountDetails.subscribe((successResponse) => {
                obj.payableAmount.setValue(successResponse.dataMap.creditAmount);
                obj.debitAmount.setValue(successResponse.dataMap.debitAmount);
                this.fxRate = successResponse.dataMap.fxRate;
                this.changedAmount = successResponse.changedAmountType;
                this.paymenthandlerobj.lastDebitAmt =
                    successResponse.dataMap.debitAmount;
                this.paymenthandlerobj.lastPayableAmt =
                    successResponse.dataMap.creditAmount;
                if (this.dealNumber && this.dealNumber !== "") {
                    this.paymenthandlerobj.lastDealNo = this.dealNumber;
                    this.paymenthandlerobj.lastValueDate = obj.valueDate.value;
                }
            });
        }
    }

    async showDealNoAlert() {

        const dealNoAlert = await this.alertCtrl.create({
            header: this.translate.transform("lbl_enter_deal_number"), // "Enter Deal Number",
            inputs: [
                {
                    name: "dealNumber",
                    placeholder: this.translate.transform("lbl_enter_deal_number"),
                    value: this.dealNumber,
                },
            ],
            cssClass: "alert-subscribe",
            backdropDismiss: false,
            buttons: [
                {
                    text: this.translate.transform("lbl_cancel"),
                    role: "cancel",
                    handler: () => {
                    },
                },
                {
                    text: this.translate.transform("lbl_ok"),
                    handler: (data) => {
                        if (data.dealNumber === undefined || data.dealNumber === "") {
                            return false;
                        }
                        if (this.inputFieldValidator.validateInput(data.dealNumber)) {
                            return false;
                        }
                        this.dealNumber = data.dealNumber;
                        const obj = {
                            dealNumber: this.dealNumber,
                            fxRate: this.fxRate,
                            entityName: "OWNACCOUNTTRANSFER",
                            changedAmount: this.changedAmount,
                            paymenthandlerobj: this.paymenthandlerobj,
                            valueDate: this.paymentDetailsForm.controls.valueDate,
                            debitAmount: this.paymentDetailsForm.controls.debitAmount,
                            payableAmount: this.paymentDetailsForm.controls.payableAmount,
                            selectedPaymentMethod: this.paymentDetailsForm.controls.selectedPaymentMethod,
                            selectedCreditCurrency: this.selectedCreditCurrency,
                            selectedCorporateAccount: this.paymentDetailsForm.controls.selectedCorporateAccount,
                        };
                        const amountDetails = this.exchangeRateSrv.calculateAmountForDealNo(
                            obj
                        );
                        if (amountDetails) {
                            amountDetails.subscribe((successResponse) => {
                                obj.payableAmount.setValue(
                                    successResponse.dataMap.creditAmount
                                );
                                obj.debitAmount.setValue(successResponse.dataMap.debitAmount);
                                this.fxRate = successResponse.dataMap.fxRate;
                                this.changedAmount = successResponse.changedAmountType;
                                this.paymenthandlerobj.lastDebitAmt =
                                    successResponse.dataMap.debitAmount;
                                this.paymenthandlerobj.lastPayableAmt =
                                    successResponse.dataMap.creditAmount;
                                if (this.dealNumber && this.dealNumber !== "") {
                                    this.paymenthandlerobj.lastDealNo = this.dealNumber;
                                    this.paymenthandlerobj.lastValueDate = obj.valueDate.value;
                                }
                            });
                        }
                    },
                },
            ],
        });

        await dealNoAlert.present();
    }

    async successAlert(data) {
        const alert = await this.alertCtrl.create({
            header: this.translate.transform("lbl_successfully_initiated"),
            // tslint:disable-next-line:max-line-length
            message: "<p class='ion-margin-top ion-no-margin'>Batch No. " + data.responseData.dataMap.batchNo + ", " + data.responseData.dataMap.payableCurrencyName + " " + data.responseData.dataMap.payableAmount + "</p>",
            buttons: [
                {
                    text: this.translate.transform("lbl_ok"),
                    handler: () => {
                        this.alertCtrl.dismiss({successResponse: data});
                    }
                },
            ],
        });

        alert.onWillDismiss().then((res) => {
            this.recordSubmitted = true;
            const navigateLink = "menu/paypro/listing/paypro";
            this.objTransSrv.setObjData('state', { page: { entityName: "TRANSACTIONS"} });
            this.objTransSrv.setObjData('tabEntityName', this.oatService.CONSTANTS.ENTITY_NAME);
            if ((data.responseData.dataMap.displaySelectVerifierScreen
                || data.responseData.dataMap.displaySelectAuthScreen) && !this.oatRequest.isSelfAuth &&
                (data.responseData.dataMap.authLevel === "B" || data.responseData.dataMap.authLevel === "T" )) {
                const inputData = {
                    submitResponse: data.responseData,
                    dataFrom: 'INIT',
                    getLink: this.oatService.CONSTANTS.GET_SELECT_AUTHORIZER,
                    setLink: this.oatService.CONSTANTS.SET_SELECT_AUTHORIZER,
                    recordListType: 'SINGLE',
                    navigateLink
                };
                this.presentSelectAuthorizer(inputData);
            } else {
                this.navCtrl.navigateRoot(navigateLink);
            }
        });

        await alert.present();

    }

    async presentSelectAuthorizer(inputData) {
        console.log("res data", inputData);
        const modal = await this.modalController.create({
            component: SelectAuthorizerComponent,
            cssClass: "select-authorizer-modal",
            componentProps: {
                inputData,
            },
            backdropDismiss: false,
        });
        await modal.present();
        modal.onDidDismiss().then(() => {
            console.log("modal close");
        });
    }

    async showConfirmAlert() {
        const confirmAlert = await this.alertCtrl.create({
            header: this.translate.transform("lbl_enter_otp"),
            inputs: [
                {
                    name: "OTP",
                    type: "password",
                    placeholder: this.translate.transform("lbl_enter_otp"),
                },
            ],
            cssClass: "alert-subscribe",
            backdropDismiss: false,
            buttons: [{
                text: this.resendOTPTImer$.value,
                handler: () => {
                  if(this.resendOTPTImer$.value){
                    return false;
                  }
                  this.generateOTP(true);
                  return false;
                },
                cssClass:'oatOptTimer'
              },
                {
                    text: this.translate.transform("lbl_cancel"),
                    role: "cancel",
                    handler: () => {
                        this.creatingRecord = false;
                        this.destroyOtp$.next();
                        this.destroyOtp$.complete();
                        this.destroyOtp$.unsubscribe();
                        this.resendOTPTImer$.next(null);
                    },
                },
                {
                    text: this.translate.transform("lbl_ok"),
                    handler: (data) => {
                        if (data.OTP === undefined || data.OTP === "") {
                            return false;
                        }
                        if(this.inputFieldValidator.validateInput(data.OTP)){
                            return false;
                          }
                        this.tokenNumber = data.OTP;
                        if (
                            this.oatRequest.uploadFileDataName &&
                            this.oatRequest.uploadFileDataName.length > 0
                        ) {
                            this.fileuploadToServer();
                        } else {
                            this.sendRecordToServer(data.OTP, this.tokenRequired);
                        }
                    },
                },
            ],
        });

        await confirmAlert.present();
        await this.updateOTPBtnText();
    }

    updateOTPBtnText(){
        const el: any = document.querySelector('.oatOptTimer');
          if(el){
            el.innerHTML = this.resendOTPTImer$.value?this.resendOTPTImer$.value:this.translate.transform('lbl_resend_otp');
            el.disabled = this.resendOTPTImer$.value?true:false;
          }
      }
    setOtpTimer(){
        const otpTimeoutSeconds = appConstants.otpTimeOutInSec;
        this.destroyOtp$ = new Subject();
        interval(1000)
            .pipe(takeUntil(this.destroyOtp$))
            .subscribe(value => {
                const seconds = (otpTimeoutSeconds - value) ;
                if (seconds === 0) {
                    this.resendOTPTImer$.next(null);
                    this.updateOTPBtnText()
                    this.destroyOtp$.next();
                    this.destroyOtp$.complete();
                }else{
                  const timeObj = new Date(1970, 0, 1).setSeconds(seconds);
                  this.resendOTPTImer$.next('<ion-icon name="stopwatch-outline"></ion-icon> '+this.datePipe.transform(timeObj,'mm:ss'));
                  this.updateOTPBtnText()  
                }
            });
      }
    fileuploadToServer() {
        this.oatService.uploadFile(this.beneDetailsForm.get('uploadFileDataName').value, this.oatService.CONSTANTS.ENTITY_NAME)
        .pipe(catchError((err) => {
            this.creatingRecord = false;
            return of(false);
        }))
        .subscribe(response => {
            if (!response) { return; }
            this.oatRequest.supportingMSTFileName = response.dataMap.uploadFileName;
            this.oatRequest.supportingMSTSysFileName = response.dataMap.systemFileName;
            delete this.oatRequest.uploadFileDataName;
            console.log("file uploaded", this.oatRequest.supportingMSTFileName);
            this.sendRecordToServer(this.tokenNumber, this.tokenRequired);
        });
    }

    sendRecordToServer(tokenNo, selfAuth) {
        if (selfAuth === true) {
            if (tokenNo) {
                this.oatRequest.tokenNo = tokenNo;
                this.oatRequest.isSelfAuth = selfAuth;
            } else {
                return;
            }
        }
        this.oatService
            .submitToServer(this.oatRequest)
            .pipe(catchError((err) => {
                this.creatingRecord = false;
                return of(false);
            }))
            .subscribe((response) => {
                console.log(response);
                this.creatingRecord = false;
                if (response && response.responseStatus.status === "0") {
                    this.successAlert({
                        responseData: response
                    });
                    console.log("uploadfileresponse", response);
                } else if (response && response.responseStatus.status === "4") {
                    this.showWarningAlert(response.responseStatus, tokenNo, selfAuth);
                }
            });
    }
    async showWarningAlert(responseStatus, tokenNo, selfAuth) {
        const alert = await this.alertCtrl.create({
            header: this.translate.transform("lbl_cut_off_time"),
            message: "<p class='ion-margin-top ion-no-margin'>" + responseStatus.message + "</p>",
            subHeader: "",
            cssClass: "info-dialog",
            buttons: [
                {
                    text: this.translate.transform("lbl_cancel"),
                    role: "cancel",
                    handler: () => {
                        console.log('cancel');
                    }
                },
                {
                    text: this.translate.transform("lbl_ok"),
                    handler: () => {
                        this.oatRequest.cutOffTime = "Y";
                        this.sendRecordToServer(tokenNo, selfAuth);
                        console.log("warning accepted");
                    }
                }
            ]
        });

        await alert.present();
    }

    verifyDetails() {
        this.creatingRecord = true;
        let oatRequest: any = {};
        this.paymentDetailsForm.value.valueDate = this.datePipe.transform(this.paymentDetailsForm.value.valueDate, 'dd-MMM-yyyy');
        const oatRequestObj = {
            formData: {
                ...this.beneDetailsForm.value,
                ...this.paymentDetailsForm.value,
            },
            beneDetails: {
                /*...this.selectedBeneficiary,
                ...this.beneficiaryPaymentMethodMapDetails,*/
            },
            amountDetailsObj: {
                changedAmount: this.changedAmount,
                debitAmount: this.paymentDetailsForm.value.debitAmount,
                payableAmount: this.paymentDetailsForm.value.payableAmount,
                fxRate: this.fxRate,
                dealNumber: this.dealNumber,
            },
            entityName: "OWNACCOUNTTRANSFER",
            bicCodeDetails : this.bicCodeDetails

        };
        console.log("oatRequestObj", oatRequestObj);

        this.oatRequestModel = new OatRequestModel({
            ...oatRequestObj,
        });

        oatRequest = this.oatRequestModel.getOatRequestObj();

        const data: any = {};
        data.dataMap = {};
        data.dataMap.paybleCurrencyId = oatRequest.creditCurrencyId;
        data.dataMap.debitCurrencyId = oatRequest.debitCurrencyId;
        data.dataMap.payableAmount = oatRequest.creditAmount;
        data.dataMap.debitAmount = oatRequest.debitAmount;
        data.dataMap.valueDate = oatRequest.valueDate;
        data.dataMap.corpDebitAccountNo = oatRequest.debitAccountNo;
        delete oatRequest.debitAccountNo;
        if (oatRequest.fxRate) {
            data.dataMap.fxRate = oatRequest.fxRate;
        } else {
            data.dataMap.fxRate = "1.0";
        }
        data.dataMap.batchstatus = "PENDING";
        data.dataMap.changedAmount = this.changedAmount;
        console.log("datacheckSelfAuth", data);
        this.oatRequest = oatRequest;

        this.oatService.checkSelfAuth(data)
        .pipe(catchError((err) => {
            this.creatingRecord = false;
            return of(false);
        }))
        .subscribe((response) => {
            if (!response) { return; }
            const selfAuthFlag = response.dataMap.isSingleMakerChecker;
            this.selectedAuthType = response.dataMap.selectedAuthType;
            this.oatRequest.isSelfAuth = selfAuthFlag;
            console.log("selfAuthFlag", selfAuthFlag);
            if (selfAuthFlag === true && this.selectedAuthType === "SOFTTOKEN") {
                this.tokenRequired = true;
                this.generateOTP();
            } else {
                this.tokenRequired = false;
            }
            if (this.tokenRequired === false) {
                if (this.oatRequest.uploadFileDataName && this.oatRequest.uploadFileDataName.length > 0) {
                    this.fileuploadToServer();
                } else {
                    this.sendRecordToServer("", this.tokenRequired);
                }
            }
            // if (
            //     response.dataMap.isHoliday &&
            //     this.beneDetailsForm.get("selectedPaymentMethod").value.enrichments
            //         .paymentMethodCode !== "EP18" &&
            //     this.beneDetailsForm.get("selectedPaymentMethod").value.enrichments
            //         .paymentMethodCode !== "EP1"
            // ) {
            //     // $('#valueDateHoliday').modal('show');
            // }
        });
    }

    generateOTP(isResendOtp?) {
        if(this.resendOTPTImer$.value){
            this.showConfirmAlert();
            return;
        }
        this.setOtpTimer()
        const data = {pageFrom: "AUTHORIZATION"};
        this.oatService.generateOTP(data)
        .pipe(catchError((err) => {
            this.creatingRecord = false;
            return of(false);
        }))
        .subscribe((response) => {
            if (response && !isResendOtp) {
                this.showConfirmAlert();
            }
        });
    }

    onChangeChargeType() {

    }

    onChangeRemittance() {

    }

    openBicCode() {
        this.menu.open('bicCodeMenuId');
    }

    onSelectBicCode(item) {
        this.bicCodeDetails.bankId = item.id;
        this.bicCodeDetails.swiftCode = item.bicCode;
        this.bicCodeDetails.bankCode = item.bankCode;
        this.bicCodeDetails.branchCode = item.branchCode;
        this.bicCodeDetails.bankName = item.bankName;
        this.bicCodeDetails.branchName = item.branchName;
        this.bicCodeDetails.bankAdress1 = item.address1;
        this.bicCodeDetails.bankAdress2 = item.address2;
        this.bicCodeDetails.bankAdress3 = item.address3;
        this.bicCodeDetails.bankCountry = item.country;
        this.bicCodeDetails.bankState = item.state;
        this.bicCodeDetails.bankLocation = item.location;
        this.bicCodeDetails.bankCity = item.city;


        console.log("biccode - ", item);
    }

    onFileSelect(event) {
        console.log(this.beneDetailsForm.get('uploadFileDataName').value);
        /*if (this.beneDetailsForm.get('uploadFileDataName').errors) {
            this.beneDetailsForm.get('uploadFileDataName').patchValue(null);
            console.log('patchValue', this.beneDetailsForm.get('uploadFileDataName').value);
        }*/
        /*if (event.target.files.length > 0) {
          const file = event.target.files[0];
          this.beneDetailsForm.get('uploadFileDataName').setValue(file);
          console.log(this.beneDetailsForm.get('uploadFileDataName').value);
        }*/
      }

    showHelp() {
        this.helpSrv.showHelpPage({
            elArray: this.receiptEl.toArray(),
            elParent: this.contentBox,
            labelArray: [{
                name: 'valueDate',
                text: 'Value Date'
            }, {
                name: 'paymentMethod',
                text: 'Payment Method'
            }, {
                name: 'debitAccount',
                text: 'Debit Account'
            }, {
                name: 'debitAmount',
                text: 'Debit Amount'
            }, {
                name: 'creditAccount',
                text: 'Credit Account'
            }, {
                name: 'transferAmount',
                text: 'Transfer Amount'
            }, {
                name: 'corpRefNo',
                text: 'Corporate Reference No'
            }]
        });
    }
    ngOnDestroy(): void {
        this.unsub$.next();
        this.unsub$.complete();
        this.unsub$.unsubscribe();
        this.destroyOtp$.next();
        this.destroyOtp$.complete();
        this.destroyOtp$.unsubscribe();
        this.resendOTPTImer$.next(null);
        this.resendOTPTImer$.complete();
        this.resendOTPTImer$.unsubscribe(); 
    }
}

