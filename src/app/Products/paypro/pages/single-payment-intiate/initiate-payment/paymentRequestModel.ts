import { UserService } from "src/app/services/aps-services/user.service";
import { DatePipe } from '@angular/common';
import { appConstants } from 'src/app/appConstants';
import {PaymentRequestView} from "../single-payment.service";

export interface PaymentRequest {
  type: string;
  remarks: string;
  transactionDate: string;
  valueDate: string;
  uploadStatus: string;
  corporateProductId: string;
  debitAccountId: string;
  debitAccountNo: string;
  paymentMethodId: string;
  creditCurrencyId: string;
  creditCurrencyCode: string;
  debitCurrencyId: string;
  debitCurrencyCode: string;
  debitAmount: string;
  payableAmount: string;
  dealNumber: string;
  totalRequest: string;
  totalRequestAmount: string;
  entryType: string;
  entryMode: string;
  requestBy: string;
  uploadFileDataName: any;
  corporateRefNo: string;
  paymentRequestDetails: PaymentRequestDetail[];
  makerRemarks?: string;
  id?: string;
  version?: string;
  lastAction?: string;
  batchNo?: string;
  modifiedBy?: string;
  modifiedOn?: string;
  checkedBy?: string;
  checkedOn?: string;
}

export interface PaymentRequestDetail {
  paymentRequestAdditionalDetail: PaymentRequestAdditionalDetail;
  beneficiaryId: string;
  beneficiaryCode: string;
  beneficiaryName: string;
  beneficiaryType: string;
  accountNo: string;
  payeeName: string;
  beneficiaryAddress1: string;
  beneficiaryAddress2: string;
  beneficiaryAddress3: string;
  city: string;
  locationId: string;
  stateId: string;
  countryId: string;
  pinCode: string;
  phoneNo: string;
  faxNo: string;
  email: string;
  paymentMethodId: string;
  debitCurrencyId: string;
  corporateProductId: string;
  changedAmount: string;
  instrumentNo: string;
  instrumentDate: string;
  debitAmount: string;
  payableAmount: string;
  creditCurrencyId: string;
  dealNumber: string;
  fxRate: string;
  type: string;
  valueDate: string;
  transactionDate: string;
  debitAccountId: string;
  paymentDetails1: string;
  paymentDetails2: string;
  paymentDetails3: string;
  paymentDetails4: string;
  corporateRefNo: string;
  paymentType: string;
  selectedAccountType: string;
  chargeTo: string;
  remittancePurpose: string;
  remittancePurposeId: string;
  remittanceDetailsId: string;
  remittanceDetails: string;
  printBranchId: string;
  printBranchName: string;
  documentBranchId: string;
  documentBranchName: string;
  id?: string;
  version?: string;
  lastAction?: string;
  requestBatchId?: string;
  batchNo?: string;
  modifiedBy?: string;
  modifiedOn?: string;
  checkedBy?: string;
  checkedOn?: string;
}
export interface PaymentRequestAdditionalDetail {
  type: string;
  remarks: string;
  beneficiaryAccountNo: string;
  collectorName: string;
  collectorIdType: string;
  collectorIdNumber: string;
  paymentType: string;
  beneDispatchMode: string;
  dispatchTo: string;
  instrumentDispatchMode: string;
  swiftCode: string;
  bankName: string;
  branchName: string;
  bankAddress1: string;
  bankAddress2: string;
  bankAddress3: string;
  countryId: string;
  stateId: string;
  locationId: string;
  bankSortCode: string;
  bankCode: string;
  branchCode: string;
  intermediaryBankBicCode: string;
  intermediaryBankSortCode: string;
  intermediaryBank: string;
  intermediaryBankBranch: string;
  intermediaryBankAddress1: string;
  intermediaryBankAddress2: string;
  intermediaryBankAddress3: string;
  id: string;
  version: string;
  lastAction: string;
  transactionId: string;
  modifiedBy: string;
  modifiedOn: string;
  checkedBy: string;
  checkedOn: string;
}

export class PaymentRequestModel {
  private paymentRequest: PaymentRequest;
  // private userSrv: UserService;
  private mode: string;
  private objFromServer: PaymentRequestView;

  constructor(private dataObj, private datePipe: DatePipe, private userSrv: UserService, mode?, objFromServer?) {
    this.paymentRequest = {} as PaymentRequest;
    // this.userSrv = new UserService();
    this.setPaymentRequest();
    console.log("req", this.paymentRequest);
    this.mode = mode;
    if (this.mode === "edit") {
      this.setEditData(objFromServer);
    }
  }
  private setPaymentRequest() {
    this.paymentRequest.type = "Paypro-SinglePaymentDetail";
    this.paymentRequest.transactionDate = this.datePipe.transform(this.userSrv.getPaymentApplicationDate(), appConstants.requestDateFormat);
    this.paymentRequest.valueDate = this.datePipe.transform( this.dataObj.formData.valueDate, appConstants.requestDateFormat) ;
    this.paymentRequest.uploadStatus = "S";
    this.paymentRequest.corporateProductId = this.dataObj.formData.selectedPaymentMethod.enrichments.corporateProductId;
    this.paymentRequest.debitAccountId = this.dataObj.formData.selectedCorporateAccount.id;
    this.paymentRequest.debitAccountNo = this.dataObj.formData.selectedCorporateAccount.displayName.split(
      "-"
    )[0];
    this.paymentRequest.paymentMethodId = this.dataObj.formData.selectedPaymentMethod.id;
    this.paymentRequest.creditCurrencyId = this.dataObj.formData.selectedCreditCurrency.id;
    this.paymentRequest.creditCurrencyCode = this.dataObj.formData.selectedCreditCurrency.displayName;
    this.paymentRequest.debitCurrencyId = this.dataObj.formData.selectedCorporateAccount.enrichments.currencyId;
    this.paymentRequest.debitCurrencyCode = this.dataObj.formData.selectedCorporateAccount.enrichments.currencyCode;
    this.paymentRequest.debitAmount = this.dataObj.amountDetailsObj.debitAmount ? this.dataObj.amountDetailsObj.debitAmount.replaceAll(',', '') : this.dataObj.amountDetailsObj.debitAmount;
    this.paymentRequest.payableAmount = this.dataObj.amountDetailsObj.payableAmount ? this.dataObj.amountDetailsObj.payableAmount.replaceAll(',', '') : this.dataObj.amountDetailsObj.payableAmount;
    this.paymentRequest.dealNumber = this.dataObj.amountDetailsObj.dealNumber || "";
    this.paymentRequest.remarks = this.dataObj.formData.remarks;
    this.paymentRequest.totalRequest = "1";
    this.paymentRequest.totalRequestAmount = this.dataObj.amountDetailsObj.payableAmount ? this.dataObj.amountDetailsObj.payableAmount.replaceAll(',', '') : this.dataObj.amountDetailsObj.payableAmount;
    this.paymentRequest.entryType = "SINGLE";
    this.paymentRequest.entryMode = "MANUAL";
    this.paymentRequest.requestBy = "CORPORATE";
    this.paymentRequest.paymentRequestDetails = [];
    if (this.dataObj.formData.uploadFileDataName && this.dataObj.formData.uploadFileDataName.name) {
      this.paymentRequest.uploadFileDataName = this.dataObj.formData.uploadFileDataName.name;
    }
    this.paymentRequest.corporateRefNo = this.dataObj.formData.corporateRefNo;
    this.paymentRequest.makerRemarks = this.dataObj.formData.makerRemarks;

    this.setPaymentRequestDetails();
  }

  private setPaymentRequestDetails() {
    const paymentRequestDetail = {} as PaymentRequestDetail;
    paymentRequestDetail.paymentRequestAdditionalDetail = {} as PaymentRequestAdditionalDetail;
    paymentRequestDetail.beneficiaryId = this.dataObj.beneficiary.beneficiaryId;
    paymentRequestDetail.beneficiaryCode = this.dataObj.beneficiary.beneficiaryCode;
    paymentRequestDetail.beneficiaryName = this.dataObj.beneficiary.beneficiaryName;
    paymentRequestDetail.beneficiaryType = this.dataObj.beneficiary.beneficiaryType;
    paymentRequestDetail.payeeName = this.dataObj.beneficiary.payeeName;
    paymentRequestDetail.beneficiaryAddress1 = this.dataObj.beneficiary.address1;
    paymentRequestDetail.beneficiaryAddress2 = this.dataObj.beneficiary.address2;
    paymentRequestDetail.beneficiaryAddress3 = this.dataObj.beneficiary.address3;
    paymentRequestDetail.city = this.dataObj.beneficiary.city || '-';
    paymentRequestDetail.locationId = this.dataObj.beneficiary.locationId || '-';
    paymentRequestDetail.stateId = this.dataObj.beneficiary.stateId || '-';
    paymentRequestDetail.countryId = this.dataObj.beneficiary.countryId || '-';
    paymentRequestDetail.pinCode = this.dataObj.beneficiary.pinCode;
    paymentRequestDetail.phoneNo = this.dataObj.beneficiary.phoneNo;
    paymentRequestDetail.faxNo = this.dataObj.beneficiary.faxNo;
    paymentRequestDetail.email = this.dataObj.beneficiary.email;
    paymentRequestDetail.accountNo = this.dataObj.beneficiary.accountNo;

    paymentRequestDetail.paymentMethodId = this.dataObj.formData.selectedPaymentMethod.id;
    paymentRequestDetail.debitCurrencyId = this.dataObj.formData.selectedCorporateAccount.enrichments.currencyId;
    paymentRequestDetail.corporateProductId = this.dataObj.formData.selectedPaymentMethod.enrichments.corporateProductId;
    paymentRequestDetail.changedAmount = this.dataObj.amountDetailsObj.changedAmount ?this.dataObj.amountDetailsObj.changedAmount.replaceAll(',',''):this.dataObj.amountDetailsObj.changedAmount;

    if (this.dataObj.amountDetailsObj) {
      paymentRequestDetail.debitAmount = this.dataObj.amountDetailsObj.debitAmount ? this.dataObj.amountDetailsObj.debitAmount.replaceAll(',', '') : this.dataObj.amountDetailsObj.debitAmount;
      paymentRequestDetail.payableAmount = this.dataObj.amountDetailsObj.payableAmount ? this.dataObj.amountDetailsObj.payableAmount.replaceAll(',', '') : this.dataObj.amountDetailsObj.payableAmount;
      paymentRequestDetail.creditCurrencyId = this.dataObj.formData.selectedCreditCurrency.id;
      paymentRequestDetail.debitCurrencyId = this.dataObj.formData.selectedCorporateAccount.enrichments.currencyId;
      if (
        paymentRequestDetail.creditCurrencyId !==
        paymentRequestDetail.debitCurrencyId
      ) {
        paymentRequestDetail.dealNumber = this.dataObj.amountDetailsObj.dealNumber;
        paymentRequestDetail.fxRate = this.dataObj.amountDetailsObj.fxRate;
      }
    }
    paymentRequestDetail.creditCurrencyId = this.dataObj.formData.selectedCreditCurrency.id;
    paymentRequestDetail.type = "Paypro-PaymentRequestDetail";
    paymentRequestDetail.valueDate = this.datePipe.transform(this.dataObj.formData.valueDate, appConstants.requestDateFormat);
    paymentRequestDetail.transactionDate =  this.datePipe.transform(this.userSrv.getPaymentApplicationDate(), appConstants.requestDateFormat);
    paymentRequestDetail.debitAccountId = this.dataObj.formData.selectedCorporateAccount.id;
    paymentRequestDetail.paymentDetails1 = this.dataObj.formData.paymentInstructions[0];
    paymentRequestDetail.paymentDetails2 = this.dataObj.formData.paymentInstructions[1] || "";
    paymentRequestDetail.paymentDetails3 = this.dataObj.formData.paymentInstructions[2] || "";
    paymentRequestDetail.paymentDetails4 = this.dataObj.formData.paymentInstructions[3] || "";
    paymentRequestDetail.corporateRefNo = this.dataObj.formData.corporateRefNo;

    paymentRequestDetail.paymentType = this.dataObj.beneDetails.paymentType || '-';

    if (this.dataObj.beneDetails.accountType) {
      paymentRequestDetail.selectedAccountType = this.dataObj.beneDetails.accountType;
    }
    if (this.dataObj.formData.paymentMethodGroup.selectedChargeTypes) {
      paymentRequestDetail.chargeTo = this.dataObj.formData.paymentMethodGroup.selectedChargeTypes.id;
    }
    if (this.dataObj.formData.paymentMethodGroup.selectedRemittancePurpose) {
      paymentRequestDetail.remittancePurpose = this.dataObj.formData.paymentMethodGroup.selectedRemittancePurpose.displayName;
      paymentRequestDetail.remittancePurposeId = this.dataObj.formData.paymentMethodGroup.selectedRemittancePurpose.id;
    }
    if (this.dataObj.beneDetails.remittanceDetails) {
      paymentRequestDetail.remittanceDetailsId = this.dataObj.beneDetails.remittanceDetails.id;
      paymentRequestDetail.remittanceDetails = this.dataObj.beneDetails.remittanceDetails.displayName;
    }
    if (this.dataObj.beneDetails.printBranchDetails) {
      this.dataObj.paymentRequest.printBranchId = this.dataObj.beneDetails.printBranchDetails.id;
      paymentRequestDetail.printBranchId = this.dataObj.beneDetails.printBranchDetails.id;
      paymentRequestDetail.printBranchName = this.dataObj.beneDetails.printBranchDetails.branchName;
    }
    if (this.dataObj.beneDetails.documentBranchDetails) {
      paymentRequestDetail.documentBranchId = this.dataObj.beneDetails.documentBranchDetails.id;
      paymentRequestDetail.documentBranchName = this.dataObj.beneDetails.documentBranchDetails.branchName;
    }

    paymentRequestDetail.paymentRequestAdditionalDetail.type = "Paypro-PaymentRequestAdditionalDetail";
    paymentRequestDetail.paymentRequestAdditionalDetail.remarks = this.dataObj.formData.remarks;
    paymentRequestDetail.paymentRequestAdditionalDetail.beneficiaryAccountNo = this.dataObj.beneDetails.accountNo;
    paymentRequestDetail.paymentRequestAdditionalDetail.collectorName = this.dataObj.beneDetails.collectorName;
    paymentRequestDetail.paymentRequestAdditionalDetail.collectorIdType =
      this.dataObj.beneDetails.collectorIdType === undefined
        ? this.dataObj.beneDetails.collectorIdType
        : this.dataObj.beneDetails.collectorIdType.id;
    paymentRequestDetail.paymentRequestAdditionalDetail.collectorIdNumber = this.dataObj.beneDetails.collectorIdNumber;


    paymentRequestDetail.paymentRequestAdditionalDetail.paymentType = this.dataObj.beneDetails.paymentType || '-';
  //
    if (this.dataObj.beneDetails.beneficiaryDispatchNumber) {
      paymentRequestDetail.paymentRequestAdditionalDetail.beneDispatchMode = this.dataObj.beneDetails.beneficiaryDispatchNumber;

      if (paymentRequestDetail.paymentRequestAdditionalDetail.beneDispatchMode === ''
          || !paymentRequestDetail.paymentRequestAdditionalDetail.beneDispatchMode
        || paymentRequestDetail.paymentRequestAdditionalDetail.beneDispatchMode === '-') {
          paymentRequestDetail.paymentRequestAdditionalDetail.beneDispatchMode = 'M';
      }
      paymentRequestDetail.paymentRequestAdditionalDetail.dispatchTo = this.dataObj.beneDetails.dispatchTo;
      // tslint:disable-next-line:max-line-length
      if (paymentRequestDetail.paymentRequestAdditionalDetail.dispatchTo === ''
          || !paymentRequestDetail.paymentRequestAdditionalDetail.dispatchTo
          || paymentRequestDetail.paymentRequestAdditionalDetail.dispatchTo === '-') {
          paymentRequestDetail.paymentRequestAdditionalDetail.dispatchTo = 'BENEFICIARY';
      }
      paymentRequestDetail.paymentRequestAdditionalDetail.instrumentDispatchMode = this.dataObj.beneDetails.instrumentDispatchMode;
      if (this.dataObj.beneDetails.instrumentDispatchMode && this.dataObj.beneDetails.instrumentDispatchMode === '-') {
          paymentRequestDetail.paymentRequestAdditionalDetail.instrumentDispatchMode = 'EMAIL';
      }
  }
    if (this.dataObj.beneDetails) {
      paymentRequestDetail.paymentRequestAdditionalDetail.swiftCode = this.dataObj.beneDetails.bicCode || '-';
      paymentRequestDetail.paymentRequestAdditionalDetail.bankName = this.dataObj.beneDetails.bank;
      paymentRequestDetail.paymentRequestAdditionalDetail.branchName = this.dataObj.beneDetails.branchName || this.dataObj.beneDetails.branch;
      paymentRequestDetail.paymentRequestAdditionalDetail.bankAddress1 = this.dataObj.beneDetails.address1;
      paymentRequestDetail.paymentRequestAdditionalDetail.bankAddress2 = this.dataObj.beneDetails.address2;
      paymentRequestDetail.paymentRequestAdditionalDetail.bankAddress3 = this.dataObj.beneDetails.address3;
      paymentRequestDetail.paymentRequestAdditionalDetail.countryId = this.dataObj.beneDetails.countryId;
      paymentRequestDetail.paymentRequestAdditionalDetail.stateId = this.dataObj.beneDetails.stateName || '-';
      paymentRequestDetail.paymentRequestAdditionalDetail.locationId = this.dataObj.beneDetails.locationName || '-';
      paymentRequestDetail.paymentRequestAdditionalDetail.bankSortCode =
       this.dataObj.formData.paymentMethodGroup['beneficiaryPaymentMethodMapDetails.sortCode'] || null;

      if (this.dataObj.beneDetails.bankCode && this.dataObj.beneDetails.bankCode.trim() !== "") {
        paymentRequestDetail.paymentRequestAdditionalDetail.bankCode = this.dataObj.beneDetails.bankCode;
      }
      if (this.dataObj.beneDetails.branchCode && this.dataObj.beneDetails.branchCode.trim() !== "") {
        paymentRequestDetail.paymentRequestAdditionalDetail.branchCode = this.dataObj.beneDetails.branchCode;
        }
      }
    if (this.dataObj.beneDetails) {
      paymentRequestDetail.paymentRequestAdditionalDetail.intermediaryBankBicCode = this.dataObj.beneDetails.intermediaryBicCode;
      paymentRequestDetail.paymentRequestAdditionalDetail.intermediaryBankSortCode =
        this.dataObj.formData.paymentMethodGroup['beneficiaryPaymentMethodMapDetails.intermediarySortCode'] || null;
      paymentRequestDetail.paymentRequestAdditionalDetail.intermediaryBank = this.dataObj.beneDetails.intermediaryBank;
      paymentRequestDetail.paymentRequestAdditionalDetail.intermediaryBankBranch = this.dataObj.beneDetails.intermediaryBranch;
      paymentRequestDetail.paymentRequestAdditionalDetail.intermediaryBankAddress1 = this.dataObj.beneDetails.intermediaryBankAddress1;
      paymentRequestDetail.paymentRequestAdditionalDetail.intermediaryBankAddress2 = this.dataObj.beneDetails.intermediaryBankAddress2;
      // paymentRequestDetail.paymentRequestAdditionalDetail.intermediaryBankAddress3 = this.dataObj.beneDetails.intermediaryBankAddress3;
  }

    this.paymentRequest.paymentRequestDetails.push(paymentRequestDetail);

  }

  setEditData(paymentRequestObjFromServer) {
    const paymentRequestDetail = this.paymentRequest.paymentRequestDetails.pop();
    if (paymentRequestObjFromServer) {
      if (paymentRequestObjFromServer.hasOwnProperty('id')) {
        this.paymentRequest.id = paymentRequestObjFromServer.id;
        this.paymentRequest.version = paymentRequestObjFromServer.version;
        this.paymentRequest.lastAction = paymentRequestObjFromServer.lastAction;
        this.paymentRequest.batchNo = paymentRequestObjFromServer.batchNo;
        this.paymentRequest.modifiedBy = paymentRequestObjFromServer.modifiedBy;
        this.paymentRequest.modifiedOn = paymentRequestObjFromServer.modifiedOn;
        this.paymentRequest.checkedBy = paymentRequestObjFromServer.checkedBy;
        this.paymentRequest.checkedOn = paymentRequestObjFromServer.checkedOn;
      }

      if (paymentRequestObjFromServer.hasOwnProperty('paymentRequestDetails')) {
        if (paymentRequestObjFromServer.paymentRequestDetails.length > 0
            && paymentRequestObjFromServer.paymentRequestDetails[0].hasOwnProperty('id')) {
          const paymentRequestDetailsFromServer = paymentRequestObjFromServer.paymentRequestDetails.at(-1); // .pop();
          paymentRequestDetail.id = paymentRequestDetailsFromServer.id;
          paymentRequestDetail.version = paymentRequestDetailsFromServer.version;
          paymentRequestDetail.lastAction = paymentRequestDetailsFromServer.lastAction;
          paymentRequestDetail.requestBatchId = paymentRequestDetailsFromServer.requestBatchId;
          paymentRequestDetail.batchNo = paymentRequestDetailsFromServer.batchNo;

          paymentRequestDetail.modifiedBy = paymentRequestDetailsFromServer.modifiedBy;
          paymentRequestDetail.modifiedOn = paymentRequestDetailsFromServer.modifiedOn;
          paymentRequestDetail.checkedBy = paymentRequestDetailsFromServer.checkedBy;
          paymentRequestDetail.checkedOn = paymentRequestDetailsFromServer.checkedOn;

          if (paymentRequestDetailsFromServer.hasOwnProperty('paymentRequestAdditionalDetail')) {
            if (paymentRequestDetailsFromServer.paymentRequestAdditionalDetail.hasOwnProperty('id')) {
              const additionalDetail = paymentRequestDetailsFromServer.paymentRequestAdditionalDetail;
              paymentRequestDetail.paymentRequestAdditionalDetail.id = additionalDetail.id;
              paymentRequestDetail.paymentRequestAdditionalDetail.version = additionalDetail.version;
              paymentRequestDetail.paymentRequestAdditionalDetail.lastAction = additionalDetail.lastAction;
              paymentRequestDetail.paymentRequestAdditionalDetail.transactionId = additionalDetail.transactionId;

              paymentRequestDetail.paymentRequestAdditionalDetail.modifiedBy = additionalDetail.modifiedBy;
              paymentRequestDetail.paymentRequestAdditionalDetail.modifiedOn = additionalDetail.modifiedOn;
              paymentRequestDetail.paymentRequestAdditionalDetail.checkedBy = additionalDetail.checkedBy;
              paymentRequestDetail.paymentRequestAdditionalDetail.checkedOn = additionalDetail.checkedOn;
            }
          }
        }
      }
      this.paymentRequest.paymentRequestDetails.push(paymentRequestDetail);
    }
  }
  public getPaymentRequestObj() {
    return this.paymentRequest;
  }
}
