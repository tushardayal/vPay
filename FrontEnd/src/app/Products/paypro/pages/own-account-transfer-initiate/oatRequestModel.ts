import { UserService } from "src/app/services/aps-services/user.service";

export interface OatRequest {
  type: string;
  debitAccountId: string;
  creditAccountId: string;
  valueDate: string;
  debitCurrencyId: string;
  debitAccountNo: string;
  creditCurrencyId: string;
  remarks: string;
  fxRate: string;
  dealNumber: string;
  debitAmount: string;
  creditAmount: string;
  transactionDate: Date;
  corporateRefNo: string;
  templateName: string;
  paymentMethodId: string;
  paymentDetails1: string;
  paymentDetails2: string;
  paymentDetails3: string;
  paymentDetails4: string;
  bankId: string;
  swiftCode: string;
  sortCode: string;
  bankCode: string;
  branchCode: string;
  bankName: string;
  branchName: string;
  bankAdress1: string;
  bankAdress2: string;
  bankAdress3: string;
  bankCountry: string;
  bankState: string;
  bankLocation: string;
  bankCity: string;
  chargeTo: string;
  remittancePurposeCode: string;
  remittancePurposeId: string;
  remittanceDetailsId: string;
  supportingMSTFileName: any;
  supportingMSTSysFileName: any;
  changedAmount: string;
  isSelfAuth: string;
  accountNo: string;
  uploadFileDataName: string;
  makerRemarks?: string;
}

export class OatRequestModel {
  private oatRequest: OatRequest;
  private userSrv: UserService;
  constructor(private dataObj) {
    this.oatRequest = {} as OatRequest;
    this.userSrv = new UserService();
    this.setOatRequest();
    console.log("req", this.oatRequest);
  }
  private setOatRequest() {
    this.oatRequest.type = "Paypro-OwnAccountTransfer";
    this.oatRequest.transactionDate = this.userSrv.getPaymentApplicationDate();
    this.oatRequest.valueDate = this.dataObj.formData.valueDate;
    this.oatRequest.debitAccountId = this.dataObj.formData.selectedCorporateAccount.id;
    this.oatRequest.creditAccountId = this.dataObj.formData.creditAccount.id;
    this.oatRequest.debitAccountNo = this.dataObj.formData.selectedCorporateAccount.displayName.split("-")[0].trim();
    this.oatRequest.debitCurrencyId = this.dataObj.formData.selectedCorporateAccount.enrichments.currencyId;
    this.oatRequest.creditCurrencyId = this.dataObj.formData.creditAccount.enrichments.currencyId;
    this.oatRequest.remarks = this.dataObj.formData.remarks;
    this.oatRequest.fxRate = "" + this.dataObj.amountDetailsObj.fxRate;
    this.oatRequest.dealNumber = this.dataObj.amountDetailsObj.dealNumber;
    this.oatRequest.debitAmount = this.dataObj.amountDetailsObj.debitAmount?this.dataObj.amountDetailsObj.debitAmount.replaceAll(',', ''):this.dataObj.amountDetailsObj.debitAmount;
    this.oatRequest.creditAmount = this.dataObj.amountDetailsObj.payableAmount?this.dataObj.amountDetailsObj.payableAmount.replaceAll(',', ''):this.dataObj.amountDetailsObj.payableAmount;
    this.oatRequest.corporateRefNo = this.dataObj.formData.corpRefNo;
    this.oatRequest.paymentMethodId = this.dataObj.formData.selectedPaymentMethod.id;
    if (this.dataObj.formData.paymentInstructions && this.dataObj.formData.paymentInstructions.length > 0) {
      this.oatRequest.paymentDetails1 = this.dataObj.formData.paymentInstructions[0];
      this.oatRequest.paymentDetails2 = this.dataObj.formData.paymentInstructions[1];
      this.oatRequest.paymentDetails3 = this.dataObj.formData.paymentInstructions[2];
      this.oatRequest.paymentDetails4 = this.dataObj.formData.paymentInstructions[3];
    }
    this.oatRequest.accountNo = this.dataObj.beneDetails.accountNo;
    if (this.dataObj.bicCodeDetails) {
      this.oatRequest = {...this.oatRequest, ...this.dataObj.bicCodeDetails};
    }
    if (this.dataObj.formData.paymentMethodGroup) {
      this.oatRequest.chargeTo = this.dataObj.formData.paymentMethodGroup.selectedChargeTypes ? this.dataObj.formData.paymentMethodGroup.selectedChargeTypes.id : "";
      this.oatRequest.remittancePurposeCode = this.dataObj.formData.paymentMethodGroup.selectedRemittancePurpose ? this.dataObj.formData.paymentMethodGroup.selectedRemittancePurpose.displayName : "";
      this.oatRequest.remittancePurposeId = this.dataObj.formData.paymentMethodGroup.selectedRemittancePurpose ? this.dataObj.formData.paymentMethodGroup.selectedRemittancePurpose.id : "";
      this.oatRequest.remittanceDetailsId = this.dataObj.formData.paymentMethodGroup.selectedRemittancePurpose ? this.dataObj.formData.paymentMethodGroup.selectedRemittancePurpose.id : "";

    }
    this.oatRequest.supportingMSTFileName = "";
    this.oatRequest.supportingMSTSysFileName = "";
    this.oatRequest.changedAmount = this.dataObj.amountDetailsObj.changedAmount?this.dataObj.amountDetailsObj.changedAmount.replaceAll(',',''):this.dataObj.amountDetailsObj.changedAmount;
    this.oatRequest.isSelfAuth = "";
    if (this.dataObj.formData.uploadFileDataName && this.dataObj.formData.uploadFileDataName.name) {
      this.oatRequest.uploadFileDataName = this.dataObj.formData.uploadFileDataName.name;
    }
    this.oatRequest.makerRemarks = this.dataObj.formData.makerRemarks;

  }

  public getOatRequestObj() {
    return this.oatRequest;
  }
}
