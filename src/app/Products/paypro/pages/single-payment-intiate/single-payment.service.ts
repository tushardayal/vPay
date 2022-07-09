import { Injectable } from '@angular/core';
import {AngularAjaxService} from "../../../../services/aps-services/ajaxService/angular-ajax.service";

@Injectable({
  providedIn: 'root'
})
export class SinglePaymentService {

  CONSTANTS = {
    ENTITY_NAME: "BSINGLEPAYMENTREQUEST",
    GET_ALL_BENEFICIARIESFORMOBILE: 'payPro/searchService/private/getAllBeneficiariesForMobile',
    GET_MOSTLYUSED_BENEFICIARIES: 'singlePaymentService/private/getMostlyUsedBeneficiaries',
    GET_PAYMENT_METHODS: 'singlePaymentService/private/getPaymentMethods',
    GET_CORPORATE_ACCOUNTS : "singlePaymentService/private/getDebitAccounts",
    GET_BENEFICIARY_DETAILS_FOR_MOBILE : "payPro/searchService/private/getBeneficiaryDetailsForMobile",
    // GET_BENEFICIARY_DETAILS_FOR_MOBILE : "payPro/searchService/private/getBeneficiaryDetails",
    GET_CORPORATE_ACCOUNT_BALANCE : 'corporateAccountService/private/getOnlineBalance',
    CREATE: 'singlePaymentService/private/create',
    UPDATE: 'singlePaymentService/private/update',
    GET_ENRICHMENTS: 'singlePaymentService/private/getEnrichmentMapping',
    CHECK_SELFAUTH: 'singlePaymentService/private/checkSelfAuth',
    GENERATE_OTP: "authenticationService/private/generateOTP",
    GET_CHARGE_TYPES : "singlePaymentService/private/getChargeTypes",
    GET_REMITTANCE_PURPOSE : "singlePaymentService/private/getRemittancePurpose",
    GET_SELECT_AUTHORIZER : "singlePaymentService/private/getAuthorizerToSelect",
    SET_SELECT_AUTHORIZER : "singlePaymentService/private/setAuthorizerToSelect",
    FILE_UPLOAD_URL : "paypro/fileUploadService/private/upload",
    DOWNLOAD_FILE :  'singlePaymentService/private/getSupportingDocDownload',
    VIEW :  'singlePaymentService/private/view',
    BENEFICIARY_VIEW: "beneficiaryService/private/view"
  };
  constructor(private ajaxService: AngularAjaxService) { }

  getAllBene() {
    const data = {searchType: "BENEFICIARYSEARCHAll", filters: []};
    return this.ajaxService.sendAjaxRequest(this.CONSTANTS.GET_ALL_BENEFICIARIESFORMOBILE, data);
  }

  getMostlyUsedBene() {
    return this.ajaxService.sendAjaxRequest(this.CONSTANTS.GET_MOSTLYUSED_BENEFICIARIES, {});
  }

  getPaymentMethods(data) {
    console.log(data);
    return this.ajaxService.sendAjaxRequest(this.CONSTANTS.GET_PAYMENT_METHODS, data);
  }

  getCorporateAccounts(data) {
    console.log(data);
    return this.ajaxService.sendAjaxRequest(this.CONSTANTS.GET_CORPORATE_ACCOUNTS, data);
  }

  getBeneficiaryDetails(data) {
    console.log(data);
    return this.ajaxService.sendAjaxRequest(this.CONSTANTS.GET_BENEFICIARY_DETAILS_FOR_MOBILE, data);
  }

  getCorporateAccountBalance(data) {
    console.log(data);
    return this.ajaxService.sendAjaxRequest(this.CONSTANTS.GET_CORPORATE_ACCOUNT_BALANCE, data);
  }

  submitToServer(data, mode?) {
    const url = mode === "edit" ? this.CONSTANTS.UPDATE : this.CONSTANTS.CREATE;
    console.log(data);
    return this.ajaxService.sendAjaxRequest(url, data);
  }

  getEnrichments(data) {
    console.log(data);
    return this.ajaxService.sendAjaxRequest(this.CONSTANTS.GET_ENRICHMENTS, data);
  }

  checkSelfAuth(data) {
    console.log(data);
    return this.ajaxService.sendAjaxRequest(this.CONSTANTS.CHECK_SELFAUTH, data);
  }

  generateOTP(data) {
    console.log(data);
    return this.ajaxService.sendAjaxRequest(this.CONSTANTS.GENERATE_OTP, data);
  }
  uploadFile(fileData, entityKey) {
    return this.ajaxService.uploadFileToServer(this.CONSTANTS.FILE_UPLOAD_URL, fileData, entityKey);
  }

  view(data) {
    return this.ajaxService.sendAjaxRequest(this.CONSTANTS.VIEW, data);
  }

  getBeneficiary(beneficiaryId) {
    const data = {dataMap: {id: beneficiaryId, viewPreviousDetail: "Y"}};
    return this.ajaxService.sendAjaxRequest(this.CONSTANTS.BENEFICIARY_VIEW, data);
  }
}

export interface PaymentRequestView {
  type: string;
  isLoggable: boolean;
  responseStatus: ResponseStatus;
  id: string;
  version: number;
  authorized: boolean;
  callMakerCheckerStrategy: boolean;
  entityIdentifier: string;
  lastAction: string;
  modifiedAtOUId: string;
  modifiedBy: string;
  enabled: boolean;
  active: boolean;
  modifiedOn: string;
  modifiedSysOn: string;
  makerName: string;
  makerChannel: string;
  isAuthorizeReject: boolean;
  isViewAuthorizer: boolean;
  processingBranchId: string;
  paymentRequestDetails?: (PaymentRequestDetails)[] | null;
  isSelfAuth: boolean;
  entryMode: string;
  entryType: string;
  requestBy: string;
  baseTotalCurrencyAmount: string;
  batchStatus: string;
  corporateBranchId: string;
  encryptionType: string;
  encryptionKey: string;
  funded: boolean;
  authorize: boolean;
  h2hAuthorize: boolean;
  countRecords: number;
  requestStatus: string;
  activationDate: string;
  entryDate: string;
  corporateId: string;
  totalCancelledAmount: string;
  payableCurrencyName: string;
  bankRefNo: string;
  singleMakerChecker: boolean;
  batchNo: string;
  corporateRefNo: string;
  debitAccountId: string;
  debitAccountNo: string;
  totalRequest: number;
  totalCancelledRequest: number;
  markAsSIorTemplete: string;
  corporateProductId: string;
  paymentMethodId: string;
  totalRequestAmount: string;
  uploadStatus: string;
  valueDate: string;
  totalRejectRequest: string;
  totalRejectRequestAmount: string;
  source: string;
  entity: string;
  makerRemarks?: string;
}
export interface ResponseStatus {
  message: string;
  status: string;
}
export interface PaymentRequestDetails {
    beneficiaryType: string | any;
    enrichments: any[];
  uploadFileDataName: string;
  type: string;
  isLoggable: boolean;
  responseStatus: ResponseStatus;
  id: string;
  version: number;
  authorized: boolean;
  callMakerCheckerStrategy: boolean;
  entityIdentifier: string;
  lastAction: string;
  modifiedAtOUId: string;
  modifiedBy: string;
  enabled: boolean;
  active: boolean;
  modifiedOn: string;
  modifiedSysOn: string;
  makerName: string;
  makerChannel: string;
  isAuthorizeReject: boolean;
  isViewAuthorizer: boolean;
  paymentRequestAdditionalDetail: PaymentRequestAdditionalDetail;
  requestBatchId: string;
  batchNo: string;
  paymentMethodCode: string;
  paymentMethodName: string;
  payableCurrencyCode: string;
  accountTitle: string;
  accountNo: string;
  beneficiaryId: string;
  debitCurrencyCode: string;
  beneficiaryName: string;
  beneficiaryAddress1: string;
  beneficiaryAddress2: string;
  beneficiaryAddress3: string;
  printBranchId: string;
  payeeName: string;
  city: string;
  debitAccountNo: string;
  beneficiaryCode: string;
  pinCode: string;
  phoneNo: string;
  faxNo: string;
  email: string;
  printBranchName: string;
  systemRequestStatus: string;
  changedAmount: string;
  activationDate: string;
  valueDate: string;
  fundingDate: string;
  corporateProductId: string;
  paymentMethodId: string;
  debitAccountId: string;
  payableCurrencyId: string;
  sellCurrencyId: string;
  payableAmount: string;
  debitAmount: string;
  buyCurrencyId: string;
  corporateRefNo: string;
  fxRate: string;
  paymentDetails1: string;
  paymentDetails2: string;
  paymentDetails3: string;
  paymentDetails4: string;
  transactionRefNo: number;
  fxRateApply: boolean;
  entity: string;
  chargeTo?: string;
  remittancePurpose?: string;
  supportingDocFilename?: string;
  supportingDocSysfilename?: string;
}
export interface PaymentRequestAdditionalDetail {
  type: string;
  id: string;
  version: number;
  authorized: boolean;
  callMakerCheckerStrategy: boolean;
  lastAction: string;
  modifiedAtOUId: string;
  modifiedBy: string;
  enabled: boolean;
  active: boolean;
  modifiedOn: string;
  modifiedSysOn: string;
  makerName: string;
  makerChannel: string;
  isAuthorizeReject: boolean;
  isViewAuthorizer: boolean;
  transactionId: string;
  remarks: string;
  adviceType: string;
  dispatchMode: string;
  dispatchTo: string;
  beneficiaryAccountNo: string;
  branchName: string;
  swiftCode: string;
  paymentType: string;
  bankName: string;
  entity: string;
  bankSortCode: string;
  intermediaryBankBicCode: string;
  intermediaryBankBranch: string;
  intermediaryBank: string;
  sortCode: string;
}

