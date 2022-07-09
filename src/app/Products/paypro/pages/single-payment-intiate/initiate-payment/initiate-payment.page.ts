import {BehaviorSubject, interval, of, Subject} from 'rxjs';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren
} from "@angular/core";
import {FormArray, FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ActivatedRoute} from "@angular/router";
import {AlertController, ModalController, NavController} from "@ionic/angular";
import * as _ from "lodash";
import {ToastService} from "src/app/services/aps-services/toast-service";
import {UserService} from "src/app/services/aps-services/user.service";
import {ObjTransferService} from 'src/app/services/aps-services/obj-transfer.service';
import {SelectAuthorizerComponent} from 'src/app/components/select-authorizer/select-authorizer/select-authorizer.component';
import {PaymentRequestModel} from "./paymentRequestModel";
import {PaymentRequestDetails, PaymentRequestView, SinglePaymentService} from "../single-payment.service";
import {ExchangeRateService} from "../../payment-request-service/exchange-rate.service";
import {DatePipe} from '@angular/common';
import {catchError, map, takeUntil} from 'rxjs/operators';
import {TranslatePipe} from '@ngx-translate/core';
import {environment} from "../../../../../../environments/environment";
import {appConstants} from "../../../../../appConstants";
import {FileValidatorService} from "../../../../../services/file-validator.service";
import {HelpPageService} from "../../../../../components/help-page/help-page.service";
import {InputFieldValidationService} from "../../../../../directives/input-field-validation.directive";
import {TransactionCommonService} from "../../../../transaction-common.service";
import {AllBeneficiaryPage} from "../all-beneficiary/all-beneficiary.page";
import {GeneralService} from "../../../../../services/general.service";

@Component({
  selector: "app-initiate-payment",
  templateUrl: "./initiate-payment.page.html",
  styleUrls: ["./initiate-payment.page.scss"],
  providers: [TranslatePipe]
})
export class InitiatePaymentPage implements OnInit, AfterViewInit, OnDestroy {
  data;
  @ViewChild("wizardSlider", { static: false }) slider;
  @ViewChild('contentBox' , { static: false}) contentBox: ElementRef;
  @ViewChildren('receiptEl') receiptEl: QueryList<ElementRef>;
  public beneDetailsForm: FormGroup;
  public paymentDetailsForm: FormGroup;
  sliderOptions = { pager: true };
  activeTabIndex = 0;
  entityName;
  activeColor = "var(--cs-text-accent)";
  normalColor = "rgb(153, 153, 153)";
  ionSegmentArray = [
    {
      displayName: this.translate.transform("lbl_beneficiary_details"), // "Beneficiary Details",
      sectionNo: "1",
      color: this.normalColor,
    },
    {
      displayName: this.translate.transform("lbl_payment_details"), // "Payment Details",
      sectionNo: "2",
      color: this.normalColor,
    },
    {
      displayName: this.translate.transform("lbl_confirmation_details"), // "Confirmation Details",
      sectionNo: "3",
      color: this.normalColor,
    },
  ];
  setValueDate: any;
  paymentMethods: any = [];
  selectedBeneficiary: any = {};
  globalDateFormat = appConstants.dateFormat;
  isFromFrequentlyUsedBeneficiary = false;
  creditCurrencies: any;
  corporateAccounts: any;
  selectedCorporateAccount: any;
  beneficiaryPaymentMethodMapDetails: any;
  selectedCorporateAccountBalance: any = "-";
  supportingDocApplicable = false;
  paymentRequestEnrichmentObj: any = {};
  fxRateApplicable = false;
  fxRate: any = "";
  selectedCreditCurrency: any;
  isDealNoMandatory = false;
  isDealNoApplicable = false;
  paymenthandlerobj: any = {};
  changedAmount: any = this.exchangeRateSrv.CONSTANTS.DEBITAMOUNTTYPE;
  dealNumber: any;
  tokenNumber;
  paymentRequestModel: PaymentRequestModel;
  selectedAuthType: any;
  tokenRequired: boolean;
  enrichmentObj: any = {};
  enrichmentsArray: any = [];
  paymentRequest: any = {};
  public recordSubmitted = false;
  creatingRecord = false;
  chargesUrl;
  remittanceUrl;
  environment = environment;
  makerRemarksApplicable = appConstants.authRemarksApplicableEntities.includes("BSINGLEPAYMENTREQUEST");
  minDate: string;
  maxDate: string;
  showDebitAmount: any;
  showPayableAmount: any;
  private resendOTPTImer$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  unsub$ = new Subject();
  destroyOtp$ = new Subject();
  viewPaymentRequest: PaymentRequestView;
  viewPaymentRequestDet: PaymentRequestDetails;
  mode: string;
  transactionEditing = false;

  constructor(
      private objTransSrv: ObjTransferService,
      private singlePaymentService: SinglePaymentService,
      private tostSrv: ToastService,
      private formBuilder: FormBuilder,
      private alertCtrl: AlertController,
      public usrSrv: UserService,
      private navCtrl: NavController,
      private exchangeRateSrv: ExchangeRateService,
      private route: ActivatedRoute,
      private modalController: ModalController,
      private datePipe: DatePipe,
      private fileValiator: FileValidatorService,
      private translate: TranslatePipe,
      private helpSrv: HelpPageService,
      private inputFieldValidator: InputFieldValidationService,
      private transactionCommonService: TransactionCommonService,
      private cdref: ChangeDetectorRef,
      private genericService: GeneralService
  ) {
    this.entityName = this.singlePaymentService.CONSTANTS.ENTITY_NAME;
    this.chargesUrl = this.singlePaymentService.CONSTANTS.GET_CHARGE_TYPES;
    this.remittanceUrl = this.singlePaymentService.CONSTANTS.GET_REMITTANCE_PURPOSE;

  }

  identify(index, item) {
    return item.id;
  }
  getPaymentMethods(beneId) {
    const inputData = {
      filters: [
        {
          name: "moduleCode",
          value: this.entityName,
          type: "String",
        },
        {
          displayName: "Beneficiary Id",
          name: "beneficiaryId",
          type: "String",
          value: beneId,
        },
      ],
    };

    this.singlePaymentService
      .getPaymentMethods(inputData)
      .subscribe((payMethods) => {
        this.paymentMethods = payMethods.dataList;
        if (this.isFromFrequentlyUsedBeneficiary || this.mode === "edit") {
          this.beneDetailsForm.controls.selectedPaymentMethod.setValue(
            _.find(this.paymentMethods, [
              "id",
              this.selectedBeneficiary.mostlyUsedPaymentMethodId,
            ]),
            { emitEvent: false }
          );
          if (this.mode === "edit") {
            this.beneDetailsForm.controls.selectedPaymentMethod.setValue(
                _.find(this.paymentMethods, [
                  "id",
                  this.viewPaymentRequest.paymentMethodId,
                ]),
                {emitEvent: false}
            );
          }
          console.log(
            "getPaymentMethods",
            this.beneDetailsForm.controls.selectedPaymentMethod.value
          );
          this.onChangePaymentMethod();
        }
      });
  }

  getCorporateAccounts(paymentMethodId, corporateProductId) {
    const inputData = {
      filters: [
        {
          name: "corporateProductId",
          value: corporateProductId,
          type: "String",
        },
        {
          name: "paymentMethodId",
          value: paymentMethodId,
          type: "String",
        },
      ],
    };
    this.singlePaymentService
      .getCorporateAccounts(inputData)
        .pipe(map(value => {
          const acc = value.dataMap.debitAccounts;
          const dataList = this.genericService.groupAccountsWithCorporateId(acc);
          const response = value;
          response.dataMap.debitAccounts = dataList;
          return response;
        }))
      .subscribe((response) => {
        this.creditCurrencies = response.dataMap.creditCurrencies;
        this.corporateAccounts = response.dataMap.debitAccounts;

        if (this.isFromFrequentlyUsedBeneficiary || this.mode === "edit") {
          let currentDebitAccountId;
          if (this.mode === "edit") {
            currentDebitAccountId = this.viewPaymentRequest.debitAccountId;
            this.paymentDetailsForm.controls.selectedCreditCurrency.patchValue(
                _.find(this.creditCurrencies, ["displayName", this.viewPaymentRequest.payableCurrencyName]),
                {emitEvent: false}
            );
            // this.paymentDetailsForm.controls.payableAmount.setValue(this.viewPaymentRequestDet.payableAmount);
            // this.paymentDetailsForm.controls.debitAmount.setValue(this.viewPaymentRequestDet.debitAmount);
            console.log("creditCurrencies "); // nilesh
          } else {
            currentDebitAccountId = this.beneDetailsForm.controls.selectedPaymentMethod.value.enrichments.mostlyUsedDebitAccountId;
          }
          this.paymentDetailsForm.controls.selectedCorporateAccount.patchValue(
            _.find(this.corporateAccounts, ["id", currentDebitAccountId]),
              {emitEvent: false}
          );
          this.onChangeDebitAccount();
        }

      });
  }

  getBeneficiaryDetails(paymentMethodId) {
    const inputData = {
      filters: [
        {
          name: "beneficiaryId",
          value: this.selectedBeneficiary.beneficiaryId,
          type: "String",
        },
        {
          name: "paymentMethodId",
          value: paymentMethodId,
          type: "String",
        },
        {
          name: "accountNo",
          value: "",
          type: "String",
        },
      ],
      searchType: "BENEFICIARYDETAILSEARCH",
    };
    this.singlePaymentService
      .getBeneficiaryDetails(inputData)
      .subscribe((data) => {
        console.log("getBeneficiaryDetails");
        this.beneficiaryPaymentMethodMapDetails = data;
         // tslint:disable-next-line: forin
        for (const i in this.beneficiaryPaymentMethodMapDetails) {
          this.beneficiaryPaymentMethodMapDetails[i] = this.getValue(this.beneficiaryPaymentMethodMapDetails[i]);
        }
        this.beneficiaryPaymentMethodMapDetails.intermediaryBranchName = this.beneficiaryPaymentMethodMapDetails.intermediaryBranch;
      });
  }
  getValue(value) {
    if (typeof value === "string" && value.indexOf('-') === 0) {
      return null;
    }
    return value;
  }
  getCorporateAccountBalance() {
    const account = this.paymentDetailsForm.get("selectedCorporateAccount")
      .value;
    const accountNo = account.displayName.split("-")[0];
    const inputData = {
      filters: [
        {
          name: "accountNo",
          value: accountNo,
          type: "String",
        },
        {
          name: "currencyCode",
          value: account.enrichments.currencyCode,
          type: "String",
        },
        {
          name: "accountId",
          value: account.id,
          type: "String",
        },
      ],
    };
    this.singlePaymentService
      .getCorporateAccountBalance(inputData)
      .subscribe((response) => {
        try {
          this.selectedCorporateAccountBalance =
              response.dataList[0].enrichments.balance;
        } catch (e) {
          console.log(e);
        }

      });
  }

  onChangePaymentMethod() {
    this.supportingDocApplicable = false;
    this.beneDetailsForm.removeControl("uploadFileDataName");
    console.log("onchange payment");
    const paymentMethod = this.beneDetailsForm.get("selectedPaymentMethod").value;
    if (paymentMethod) {
    const suppDoc = paymentMethod ? paymentMethod.enrichments.supportingdocument : undefined;
    if (suppDoc === "true" || suppDoc === "y") {
      if (
        paymentMethod.enrichments
          .paymentMethodCode === "EP5" && !(this.viewPaymentRequestDet && this.viewPaymentRequestDet.supportingDocFilename)
      ) {
        this.beneDetailsForm.addControl(
            "uploadFileDataName",
            this.formBuilder.control(null, [
              Validators.required,
              this.fileValiator.validateFile(paymentMethod.enrichments)
            ])
        );
      } else {
        this.beneDetailsForm.addControl(
          "uploadFileDataName",
          this.formBuilder.control(null, [
            this.fileValiator.validateFile(paymentMethod.enrichments)
          ])
        );
      }
      this.supportingDocApplicable = true;
    } else {
      this.supportingDocApplicable = false;
    }
    this.getBeneficiaryDetails(
      paymentMethod.id
    );
    this.getCorporateAccounts(
      paymentMethod.id,
      paymentMethod.enrichments
        .corporateProductId
    );
    this.getEnrichments(
      paymentMethod.enrichments
        .corporateProductId
    );
   }
    this.corporateAccounts = [];
    this.selectedCorporateAccountBalance = undefined;
    this.paymentDetailsForm.controls.selectedCorporateAccount.reset();

    this.beneDetailsForm.removeControl("paymentMethodGroup");
    this.beneDetailsForm.addControl(
      "paymentMethodGroup",
      this.formBuilder.group({})
    );
  }

  getEnrichments(corpProductId) {
    const dataToBeSent = {
      filters: []
    };
    dataToBeSent.filters.push({
      name: "corporateProductId",
      value: corpProductId,
      type: "String",
    });

    dataToBeSent.filters.push({
      name: "corporateId",
      value: this.usrSrv.getUserDetails()
        ? this.usrSrv.getUserDetails().corporateId
        : undefined,
      type: "String",
    });

    this.singlePaymentService
      .getEnrichments(dataToBeSent)
      .subscribe((response) => {
        this.paymentRequestEnrichmentObj = response;
        const enrichmentFormArr = this.paymentDetailsForm
        .controls.enrichmentArray as FormArray;

        if (this.paymentRequestEnrichmentObj.enrichmentMappingDetails) {
          const encrichIndex = 0;
          for (const i of this.paymentRequestEnrichmentObj.enrichmentMappingDetails) {
            if (this.mode === "edit"
                && this.viewPaymentRequestDet.enrichments && this.viewPaymentRequestDet.enrichments.length) {
              const enrichmentsFromView = this.viewPaymentRequestDet.enrichments[0];
              if (enrichmentsFromView) {
                const value = enrichmentsFromView["enrichment" + i.enrichmentSequenceNo];
                enrichmentFormArr.push(this.formBuilder.control(value));
              }
            } else {
              enrichmentFormArr.push(this.formBuilder.control(null));
            }
          }
        }
      });
  }
  onChangeDebitAccount() {
    // this.resetCcy();
    console.log("in onchange acc");
    if (this.paymentDetailsForm.controls.selectedCorporateAccount.value) {
      this.getCorporateAccountBalance();
      this.changedAmount = this.exchangeRateSrv.CONSTANTS.DEBITAMOUNTTYPE;
      this.isFxRateApplicable();
      // this.calculateDrCrAmount(this.changedAmount);
    }
  }
  addPaymentInstruction() {
    const instructionArr = this.paymentDetailsForm.controls.paymentInstructions as FormArray;
    if (this.paymentDetailsForm.controls.paymentInstructions.valid) {
      instructionArr.push(this.formBuilder.control(null, Validators.required));
    } else {
      this.paymentDetailsForm.controls.paymentInstructions.markAsTouched();
    }
  }
  removePaymentInstruction(index) {
    const instructionArr = this.paymentDetailsForm.controls.paymentInstructions as FormArray;
    instructionArr.removeAt(index);
  }

  private isFxRateApplicable() {
    if ( this.paymentDetailsForm.controls.selectedCreditCurrency.value && this.paymentDetailsForm.controls.selectedCorporateAccount.value) {
      this.selectedCreditCurrency = this.paymentDetailsForm.get("selectedCreditCurrency").value;
      if ( this.selectedCreditCurrency.id !== this.paymentDetailsForm.controls.selectedCorporateAccount.value.enrichments.currencyId) {
        this.fxRateApplicable = true;
      } else {
        this.fxRateApplicable = false;
      }
      this.calculateDrCrAmount(this.changedAmount);
    }
  }

  changeCreditCurrencies() {
    console.log("changeCreditCurrencies");
    // this.resetAmoutDetails();
    this.changedAmount = this.exchangeRateSrv.CONSTANTS.CREDITAMOUNTTYPE;
    this.isFxRateApplicable();
  }

  changePayableAmount() {
    if (
      this.paymentDetailsForm.controls.payableAmount.invalid ||
      this.paymentDetailsForm.controls.selectedCorporateAccount.invalid ||
      this.paymentDetailsForm.controls.selectedCreditCurrency.invalid
    ) {
      this.paymentDetailsForm.controls.payableAmount.setValue(null);
      this.paymentDetailsForm.controls.debitAmount.setValue(null);
      return;
    }
    if (
      this.isDealNoApplicable &&
      this.isDealNoMandatory &&
      !this.dealNumber &&
      this.dealNumber === ""
    ) {
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
  /*******************************/

  ngOnInit() {
    console.log("init");
    const currentDate = this.datePipe.transform(this.usrSrv.getPaymentApplicationDate(), appConstants.requestDateFormat);
    this.minDate = new Date(this.usrSrv.formatDate(currentDate)).toISOString();
    this.maxDate = (new Date(currentDate).getFullYear() + 10).toString();

    this.beneDetailsForm = this.formBuilder.group({
      valueDate: [this.usrSrv.getPaymentApplicationDate(), Validators.required],
      beneficiaryName: [null, Validators.required],
      selectedPaymentMethod: [null, Validators.required],
      paymentMethodGroup: this.formBuilder.group({}, Validators.required),
      uploadFileDataName: [null],
    });

    this.paymentDetailsForm = this.formBuilder.group({
      selectedCorporateAccount: [null, Validators.required],
      corporateRefNo: [null, Validators.required],
      paymentInstructions: this.formBuilder.array([
        this.formBuilder.control(null, Validators.required),
      ]),
      selectedCreditCurrency: [null, Validators.required],
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
      remarks: [null],
      enrichmentArray: this.formBuilder.array([]),
      makerRemarks: [null]
    });

    this.paymentDetailsForm.controls.payableAmount.valueChanges
        .subscribe(value => {
          this.showPayableAmount = this.formatAmount(value);
        });

    this.paymentDetailsForm.controls.debitAmount.valueChanges
        .subscribe(value => {
          this.showDebitAmount = this.formatAmount(value);
        });
  }

  ionViewDidEnter() {
    console.log("ion did enter");
    this.route.data.subscribe((viewData) => {
      console.log("data", viewData);
      this.intitalizeData(viewData);
    });

  }

  setBeneObj() {
    this.selectedBeneficiary.accountNo = this.viewPaymentRequestDet.paymentRequestAdditionalDetail.beneficiaryAccountNo;
    this.selectedBeneficiary.beneficiaryName = this.viewPaymentRequestDet.beneficiaryName;
    this.selectedBeneficiary.beneficiaryId = this.viewPaymentRequestDet.beneficiaryId;
    this.selectedBeneficiary.beneficiaryCode = this.viewPaymentRequestDet.beneficiaryCode;
    this.selectedBeneficiary.address1 = this.viewPaymentRequestDet.beneficiaryAddress1;
    this.selectedBeneficiary.address2 = this.viewPaymentRequestDet.beneficiaryAddress2;
    this.selectedBeneficiary.address3 = this.viewPaymentRequestDet.beneficiaryAddress3;

    this.selectedBeneficiary.beneficiaryType = this.viewPaymentRequestDet.beneficiaryType;
    this.selectedBeneficiary.payeeName = this.viewPaymentRequestDet.payeeName;
    // this.selectedBeneficiary.city = response
    // this.selectedBeneficiary.locationId = response
    // this.selectedBeneficiary.stateId = response.
    // this.selectedBeneficiary.countryId = response.
    this.selectedBeneficiary.pinCode = this.viewPaymentRequestDet.pinCode;
    this.selectedBeneficiary.phoneNo = this.viewPaymentRequestDet.phoneNo;
    this.selectedBeneficiary.email = this.viewPaymentRequestDet.email;

    /* this.singlePaymentService.getBeneficiary(this.viewPaymentRequestDet.beneficiaryId)
        .subscribe((response) => {

          this.selectedBeneficiary.beneficiaryType = response.beneficiaryType;
          this.selectedBeneficiary.payeeName = response.payeeName;
          // this.selectedBeneficiary.city = response
          // this.selectedBeneficiary.locationId = response
          // this.selectedBeneficiary.stateId = response.
          // this.selectedBeneficiary.countryId = response.
          this.selectedBeneficiary.pinCode = response.pinCode;
          this.selectedBeneficiary.phoneNo = response.phoneNo;
          this.selectedBeneficiary.email = response.email;
        });*/
  }

  intitalizeData(viewData?) {

    if (this.objTransSrv.getObjData("beneData")) {
      this.selectedBeneficiary = this.objTransSrv.getObjData("beneData").bene;
      this.isFromFrequentlyUsedBeneficiary = this.objTransSrv.getObjData("beneData")
          .isFromFrequentlyUsedBeneficiary;
      // this.mode = "";
      // this.viewPaymentRequest = null;
      // this.viewPaymentRequestDet = null;
    } else {
      this.objTransSrv.removeObj('editData');
      this.mode = "edit";
      this.transactionEditing = true;
      this.viewPaymentRequest = viewData.editTransactionData;
      this.viewPaymentRequestDet = this.viewPaymentRequest.paymentRequestDetails[0];
      this.setBeneObj();
      this.paymentDetailsForm.controls.corporateRefNo.patchValue(this.viewPaymentRequestDet.corporateRefNo);
      if (this.viewPaymentRequestDet.paymentDetails1) {
        const instructionArr = this.paymentDetailsForm.controls.paymentInstructions as FormArray;
        instructionArr.at(0).patchValue(this.viewPaymentRequestDet.paymentDetails1);
        if (this.viewPaymentRequestDet.paymentDetails2) {
          instructionArr.push(this.formBuilder.control(this.viewPaymentRequestDet.paymentDetails2, Validators.required));
        }
        if (this.viewPaymentRequestDet.paymentDetails3) {
          instructionArr.push(this.formBuilder.control(this.viewPaymentRequestDet.paymentDetails3, Validators.required));
        }
        if (this.viewPaymentRequestDet.paymentDetails4) {
          instructionArr.push(this.formBuilder.control(this.viewPaymentRequestDet.paymentDetails4, Validators.required));
        }
      }
      this.paymentDetailsForm.controls.remarks.patchValue(this.viewPaymentRequestDet.paymentRequestAdditionalDetail.remarks);
      // this.paymentDetailsForm.controls.enrichmentArray.patchValue(this.viewPaymentRequestDet.);// TODO:enrichmentArray
      this.paymentDetailsForm.controls.makerRemarks.patchValue(this.viewPaymentRequest.makerRemarks);
      this.paymentDetailsForm.controls.payableAmount.setValue(this.viewPaymentRequestDet.payableAmount, {emitEvent: false});
      this.paymentDetailsForm.controls.debitAmount.setValue(this.viewPaymentRequestDet.debitAmount, {emitEvent: false});
      this.beneDetailsForm.controls.valueDate.setValue(this.viewPaymentRequestDet.valueDate);
      this.beneDetailsForm.controls.uploadFileDataName.patchValue(this.viewPaymentRequestDet.uploadFileDataName);

    }
    // this.selectedBeneficiary.beneficiaryId = editData.beneficiaryId;
    this.beneDetailsForm.controls.beneficiaryName.setValue(this.selectedBeneficiary.beneficiaryName);
    this.setValueDate = this.beneDetailsForm.controls.valueDate.value;

    this.objTransSrv.removeObj('beneData');
    this.getPaymentMethods(this.selectedBeneficiary.beneficiaryId);
    this.slider.lockSwipes(true);
    this.exchangeRateSrv.checkDealNo().subscribe((response) => {
      this.isDealNoApplicable = response.dataMap &&
          response.dataMap.ISDEAL &&
          response.dataMap.ISDEAL === "Y";
      if (
          response.dataMap.ISDEALSETYES &&
          response.dataMap.ISDEALSETYES === "Y"
      ) {
        this.isDealNoMandatory = true;
      }
    });
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
    console.log("ion view init");
  }

  onFinishFunc() {
  }

  onNextFunc() {
    // this.presentSelectAuthorizer(null);
    console.log(this.beneDetailsForm);
    console.log(this.paymentDetailsForm);
    const invalidData = this.translate.transform("lbl_invalid_data");
    const dealNoRequired = this.translate.transform("lbl_deal_no_required");
    if (this.activeTabIndex === 0 && this.beneDetailsForm.invalid) {
      this.tostSrv.presentToast(invalidData);
      this.beneDetailsForm.markAllAsTouched();
      return;
    }
    if (this.activeTabIndex === 1 && this.paymentDetailsForm.invalid) {
      this.tostSrv.presentToast(invalidData);
      this.paymentDetailsForm.markAllAsTouched();
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
    if (this.activeTabIndex === 1 && this.fxRateApplicable && !this.fxRate) {
      this.tostSrv.presentToast(this.translate.transform("lbl_fx_rate_not_found."));
      return;
    }
    this.slider.lockSwipes(false);
    this.slider.slideNext(300);
    this.activeTabIndex ++;

  }

  onPreviousFunc() {
    this.slider.lockSwipes(false);
    this.slider.slidePrev(300);
  }

  ionSlideReachStart($event: CustomEvent<any>) {}

  ionSlideReachEnd($event: CustomEvent<any>) {}

  ionSlideDidChange($event: CustomEvent<any>) {
    this.slider.lockSwipes(true);
    this.slider.getActiveIndex().then((val) => {
      this.activeTabIndex = val;
    });
  }

  calculateDrCrAmount(type) {
    const obj = {
      type: '',
      dealNumber: this.dealNumber,
      fxRate: this.fxRate,
      entityName: this.entityName,
      changedAmount: this.changedAmount,
      paymenthandlerobj: this.paymenthandlerobj,
      valueDate: this.beneDetailsForm.controls.valueDate,
      debitAmount: this.paymentDetailsForm.controls.debitAmount,
      payableAmount: this.paymentDetailsForm.controls.payableAmount,
      selectedPaymentMethod: this.beneDetailsForm.controls.selectedPaymentMethod,
      selectedCreditCurrency: this.paymentDetailsForm.controls.selectedCreditCurrency.value,
      selectedCorporateAccount: this.paymentDetailsForm.controls.selectedCorporateAccount,
    };

    obj.type = type;

    const amountDetails = this.exchangeRateSrv.calculateDrCrAmount(obj);
    if (amountDetails) {
      amountDetails
          .pipe(catchError((err) => {
            console.log(err);
            if (err.originalError.status === 1) {
              this.fxRate = undefined;
            }
            throw err;
          }))
          .subscribe((successResponse) => {
            obj.payableAmount.setValue(successResponse.dataMap.creditAmount);
            obj.debitAmount.setValue(successResponse.dataMap.debitAmount);
            this.fxRate = successResponse.dataMap.fxRate;
            this.changedAmount = successResponse.changedAmountType;
            this.paymenthandlerobj.lastDebitAmt = successResponse.dataMap.debitAmount;
            this.paymenthandlerobj.lastDebitCCYId = obj.selectedCorporateAccount.value.enrichments.currencyId;
            this.paymenthandlerobj.lastCreditCCYId = obj.selectedCreditCurrency.id;
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
          handler: () => {},
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
              entityName: this.entityName,
              changedAmount: this.changedAmount,
              paymenthandlerobj: this.paymenthandlerobj,
              valueDate: this.beneDetailsForm.controls.valueDate,
              debitAmount: this.paymentDetailsForm.controls.debitAmount,
              payableAmount: this.paymentDetailsForm.controls.payableAmount,
              selectedPaymentMethod: this.beneDetailsForm.controls.selectedPaymentMethod,
              selectedCreditCurrency: this.paymentDetailsForm.controls.selectedCreditCurrency.value,
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
      message: "<p class='ion-margin-top ion-no-margin'>Batch No. " + data.responseData.dataMap.batchNo + " "
      + this.paymentDetailsForm.controls.selectedCreditCurrency.value.displayName + " "
          + this.paymentDetailsForm.controls.payableAmount.value + "</p>",
      buttons: [
        {
          text: this.translate.transform("lbl_ok"),
          handler: () => {
            this.alertCtrl.dismiss({ successResponse: data });
          }
        },
      ],
    });

    alert.onWillDismiss().then((res) => {
      this.recordSubmitted = true;
      const navigateLink = "menu/paypro/listing/paypro";
      this.objTransSrv.setObjData('state', { page: { entityName: "TRANSACTIONS"} });
      this.objTransSrv.setObjData('tabEntityName', this.singlePaymentService.CONSTANTS.ENTITY_NAME);
      if ((data.responseData.dataMap.displaySelectVerifierScreen
        || data.responseData.dataMap.displaySelectAuthScreen) && !this.paymentRequest.isSelfAuth &&
                (data.responseData.dataMap.authLevel === "B" || data.responseData.dataMap.authLevel === "T" )) {
          const inputData = {
            submitResponse: data.responseData,
            dataFrom: 'INIT',
            getLink: this.singlePaymentService.CONSTANTS.GET_SELECT_AUTHORIZER,
            setLink: this.singlePaymentService.CONSTANTS.SET_SELECT_AUTHORIZER,
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
        text: '',
        handler: () => {
          if (this.resendOTPTImer$.value) {
            return false;
          }
          this.generateOTP(true);
          return false;
        },
        cssClass: 'optTimer'
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
            if (this.inputFieldValidator.validateInput(data.OTP)) {
              return false;
            }
            this.tokenNumber = data.OTP;
            if (
              this.paymentRequest.uploadFileDataName &&
              this.paymentRequest.uploadFileDataName.length > 0
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
  updateOTPBtnText() {
    const el: any = document.querySelector('.optTimer');
    if (el) {
      el.innerHTML = this.resendOTPTImer$.value ? this.resendOTPTImer$.value : this.translate.transform('lbl_resend_otp');
      el.disabled = this.resendOTPTImer$.value ? true : false;
    }
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
              this.resendOTPTImer$.next('<ion-icon name="stopwatch-outline"></ion-icon> ' + this.datePipe.transform(timeObj, 'mm:ss'));
              this.updateOTPBtnText();
            }
        });
  }
  fileuploadToServer() {
    this.singlePaymentService.uploadFile(this.beneDetailsForm.get('uploadFileDataName').value, this.entityName)
    .pipe(catchError((err) => {
      this.creatingRecord = false;
      return of(false);
    }))
    .subscribe(response => {
      if (!response) {
        return;
      }
      this.paymentRequest.uploadFileName = response.dataMap.uploadFileName;
      this.paymentRequest.systemFileName = response.dataMap.systemFileName;
      delete this.paymentRequest.uploadFileDataName;
      console.log("file uploaded", this.paymentRequest.uploadFileDataName);
      this.sendRecordToServer(this.tokenNumber, this.tokenRequired);
    });
  }

  sendRecordToServer(tokenNo, selfAuth) {
    this.paymentRequest.isSelfAuth = false;
    if (selfAuth === true) {
      if (tokenNo) {
        this.paymentRequest.tokenNo = tokenNo;
        this.paymentRequest.isSelfAuth = selfAuth;
      } else {
        return;
      }
    }
    this.submitRecord();
  }
 submitRecord() {
    this.singlePaymentService
      .submitToServer(this.paymentRequest, this.mode)
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
        } else if (response && response.responseStatus.status === "4") {
         this.showWarningAlert(response.responseStatus.message);
        }
      });
}
  async showWarningAlert(message) {
    const alert = await this.alertCtrl.create({
      header: this.translate.transform("lbl_cut_off_time"),
      message:
        "<p class='ion-margin-top ion-no-margin'>" + message + "</p>",
      cssClass: "alert-subscribe",
      buttons: [
        {
          text: this.translate.transform("lbl_cancel"),
          role: "cancel",
          handler: () => {
          }
        },
        {
          text:  this.translate.transform("lbl_ok"),
          handler: () => {
            this.paymentRequest.cutOffTime = 'Y';
            this.submitRecord();
          }
        }
      ]
    });

    await alert.present();
  }
  verifyDetails() {
    this.creatingRecord = true;
    let paymentRequest: any = {};
    const paymentRequestObj = {
      formData: {
        ...this.beneDetailsForm.value,
        ...this.paymentDetailsForm.value,
      },
      beneDetails: {
        ...this.beneficiaryPaymentMethodMapDetails
      },
      beneficiary: {
        ...this.selectedBeneficiary
      },
      amountDetailsObj: {
        changedAmount: this.changedAmount,
        debitAmount: this.paymentDetailsForm.value.debitAmount,
        payableAmount: this.paymentDetailsForm.value.payableAmount,
        fxRate: this.fxRate,
        dealNumber: this.dealNumber,
      },
      entityName: this.entityName,
    };
    console.log("merged form", paymentRequestObj);
    this.paymentRequestModel = new PaymentRequestModel({
      ...paymentRequestObj,
    }, this.datePipe, this.usrSrv, this.mode, this.viewPaymentRequest);

    paymentRequest = this.paymentRequestModel.getPaymentRequestObj();
    const data: any = {};
    data.dataMap = {};
    data.dataMap.paybleCurrencyId = paymentRequest.creditCurrencyId;
    data.dataMap.debitCurrencyId = paymentRequest.debitCurrencyId;
    data.dataMap.payableAmount = paymentRequest.payableAmount;
    data.dataMap.debitAmount = paymentRequest.debitAmount;
    data.dataMap.valueDate = paymentRequest.valueDate;
    data.dataMap.corpDebitAccountNo = paymentRequest.debitAccountNo;
    delete paymentRequest.debitAccountNo;
    if (paymentRequest.fxRate) {
      data.dataMap.fxRate = paymentRequest.fxRate;
    } else {
      data.dataMap.fxRate = "1.0";
    }

    if (
      paymentRequest.paymentRequestDetails &&
      paymentRequest.paymentRequestDetails[0] &&
      paymentRequest.paymentRequestDetails[0].changedAmount
    ) {
      data.dataMap.changedAmount =
        paymentRequest.paymentRequestDetails[0].changedAmount;
    }

    this.setEnrichments(paymentRequest);

    this.paymentRequest = paymentRequest;

    this.singlePaymentService.checkSelfAuth(data)
    .pipe(catchError((err) => {
      this.creatingRecord = false;
      return of(false);
    }))
    .subscribe((response) => {
      if (!response) {
        return;
      }
      const selfAuthFlag = response.dataMap.isUserSelfAuth;
      this.selectedAuthType = response.dataMap.selectedAuthType;
      if (selfAuthFlag === true && this.selectedAuthType === "SOFTTOKEN") {
        this.tokenRequired = true;
        this.generateOTP();
      } else {
        this.tokenRequired = false;
      }
      if (this.tokenRequired === false) {
        if (
          this.paymentRequest.uploadFileDataName &&
          this.paymentRequest.uploadFileDataName.length > 0
        ) {
          this.fileuploadToServer();
        } else {
          this.sendRecordToServer("", this.tokenRequired);
        }
      }
      if (
        response.dataMap.isHoliday &&
        this.beneDetailsForm.get("selectedPaymentMethod").value.enrichments
          .paymentMethodCode !== "EP18" &&
        this.beneDetailsForm.get("selectedPaymentMethod").value.enrichments
          .paymentMethodCode !== "EP1"
      ) {
        // $('#valueDateHoliday').modal('show');
      }
    });
  }

  private setEnrichments(paymentRequest: any) {
    paymentRequest.paymentRequestDetails[0].enrichments = [];

    const paymentRequestEnrichment: any = {};
    paymentRequestEnrichment.type = "Paypro-PaymentRequestEnrichment";
    const enrichmentFormArr = this.paymentDetailsForm.controls.enrichmentArray.value as [];
    for (let i = 0; i < enrichmentFormArr.length; i++) {
      paymentRequestEnrichment["enrichment" + (i + 1)] =
          enrichmentFormArr[i];
    }
    if (this.mode === 'edit' && this.viewPaymentRequestDet.enrichments && this.viewPaymentRequestDet.enrichments.length) {
      const enrichmentsFromView = this.viewPaymentRequestDet.enrichments[0];
      if (enrichmentsFromView && enrichmentsFromView.hasOwnProperty('id')) {
        paymentRequestEnrichment.id = enrichmentsFromView.id;
        paymentRequestEnrichment.version = enrichmentsFromView.version;
        paymentRequestEnrichment.lastAction = enrichmentsFromView.lastAction;
        paymentRequestEnrichment.modifiedBy = enrichmentsFromView.modifiedBy;
        paymentRequestEnrichment.modifiedOn = enrichmentsFromView.modifiedOn;
        paymentRequestEnrichment.checkedBy = enrichmentsFromView.checkedBy;
        paymentRequestEnrichment.checkedOn = enrichmentsFromView.checkedOn;
      }
      if (enrichmentsFromView && enrichmentsFromView.hasOwnProperty('transactionId')) {
        paymentRequestEnrichment.transactionId = enrichmentsFromView.transactionId;
      }
    }
    paymentRequest.paymentRequestDetails[0].enrichments.push(
        paymentRequestEnrichment
    );
  }

  generateOTP(isResendOtp?) {
    if (this.resendOTPTImer$.value) {
      this.showConfirmAlert();
      return;
    }
    this.setOtpTimer();
    const data = { pageFrom: "AUTHORIZATION" };
    this.singlePaymentService.generateOTP(data)
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

  onSelectBicCode(item) {
    this.beneficiaryPaymentMethodMapDetails.intermediaryBankName = item.bankName;
    this.beneficiaryPaymentMethodMapDetails.intermediaryBranchName = item.branchName;
    this.beneficiaryPaymentMethodMapDetails.intermediaryBankBicCode = item.bicCode;
    this.beneficiaryPaymentMethodMapDetails.intermediaryBankAddress1 = item.address1;
    this.beneficiaryPaymentMethodMapDetails.intermediaryBankAddress2 = item.address2;
    this.beneficiaryPaymentMethodMapDetails.intermediaryBankAddress3 = item.address3;
    this.beneficiaryPaymentMethodMapDetails.intermediaryBicCode = item.bicCode;
    console.log("biccode - ", item);
    this.cdref.detectChanges();
  }

  onFileSelect(event) {
    /*if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.beneDetailsForm.get('uploadFileDataName').setValue(file);
      console.log(this.beneDetailsForm.get('uploadFileDataName').value);
    }*/
  }

  showHelp() {
    const labelArray = [
      {name: 'valueDate', text: 'Value Date'},
      {name: 'paymentMethod', text: 'Payment Method'},
      {name: 'beneficiaryName', text: 'Beneficiary'},
      {name: 'debitAccount', text: 'Debit Account'},
      {name: 'debitAmount', text: 'Debit Amount'},
      {name: 'creditAccount', text: 'Credit Account'},
      {name: 'payableAmount', text: 'Payable Amount'},
    ];
    this.helpSrv.showHelpPage({
      elArray: this.receiptEl.toArray(),
      elParent: this.contentBox,
      labelArray
    });
  }

  ngOnDestroy(): void {
    this.destroyOtp$.next();
    this.destroyOtp$.complete();
    this.destroyOtp$.unsubscribe();
    this.resendOTPTImer$.next(null);
    this.resendOTPTImer$.complete();
    this.resendOTPTImer$.unsubscribe();
  }

  donloadFile() {
    if (this.viewPaymentRequestDet && this.viewPaymentRequestDet.supportingDocSysfilename
        && this.viewPaymentRequestDet.supportingDocFilename) {
      this.transactionCommonService.downloadFile(this.singlePaymentService.CONSTANTS.DOWNLOAD_FILE,
          this.viewPaymentRequestDet.supportingDocFilename, this.viewPaymentRequestDet.supportingDocSysfilename);
    }
  }

  async showAllBeneModal() {
    const modal = await this.modalController.create({
      component: AllBeneficiaryPage,
      componentProps: {
        modalView: true,
      },
    });

    modal.onDidDismiss().then((obj) => {
      // this.ngOnInit();
      this.intitalizeData();
    });
    return await modal.present();
  }

  removeFile() {
    if (
        this.beneDetailsForm.controls.selectedPaymentMethod.value.enrichments.paymentMethodCode === "EP5") {
      this.beneDetailsForm.controls.uploadFileDataName.setValidators(Validators.required);
    }
    delete this.viewPaymentRequestDet.supportingDocFilename;
  }
}
