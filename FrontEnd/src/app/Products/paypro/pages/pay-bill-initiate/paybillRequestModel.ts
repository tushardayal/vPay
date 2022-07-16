import { UserService } from "src/app/services/aps-services/user.service";


export interface PayBillRequest {
  type: string;
  id: string;
  payDate: string;
  billDate: string;
  billDueDate: string;
  debitAccountId: string;
  debitAccountNo: string;
  debitCurrencyCode:string;
  debitCurrencyId:string;
  billAmount: string;
  payAmount: string;  
  // billPaymentStatus: string;
  // billerIntegration: string;
  // billerName: string;
  // consumerDetails: string;
  // currencyCode: string;  
  // payableAmount: string;
  // productName: string;
  // referenceField1: string;
  // referenceField2: string;
  // referenceField3: string;
  // referenceField4: string;
  // referenceFieldValue1: string;
  // referenceFieldValue2: string;
  // referenceFieldValue3: string;
  // referenceFieldValue4: string;
  // selected: false;
  // confirmButtonRequired: false;  
  // payOnDate: string;
  // selfConfirmed: false;

}

export class PayBillRequestModel {
  private payBillRequest: PayBillRequest;
  constructor(private dataObj,) {
    this.payBillRequest = {} as PayBillRequest;
    this.setPayBillRequest();
    console.log("req", this.payBillRequest);
  }
  private setPayBillRequest() {

    this.payBillRequest.type = "Paypro-BillPaymentDetail";
    this.payBillRequest.id = this.dataObj.getDataObj.id;
    this.payBillRequest.payDate = this.dataObj.formData.valueDate;
    this.payBillRequest.debitAccountId = this.dataObj.debitAccount.id;
    this.payBillRequest.debitAccountNo = this.dataObj.debitAccount.displayName;
    this.payBillRequest.debitCurrencyCode = this.dataObj.debitAccount.enrichments.currencyCode;
    this.payBillRequest.debitCurrencyId = this.dataObj.debitAccount.enrichments.currencyId;
    this.payBillRequest.billAmount = this.dataObj.getDataObj.billAmount?this.dataObj.getDataObj.billAmount.replaceAll(",", ""):this.dataObj.getDataObj.billAmount;
    this.payBillRequest.payAmount = this.dataObj.formData.payableAmount?this.dataObj.formData.payableAmount.replaceAll(",", ""):this.dataObj.formData.payableAmount;
    this.payBillRequest.billDueDate =  this.dataObj.getDataObj.dueDate;
    if (this.dataObj.getDataObj.billerIntegration === 'Offline') {
      // tslint:disable-next-line:max-line-length
      this.payBillRequest.billDate = (this.dataObj.getDataObj.billDate === '-' || !this.dataObj.getDataObj.billDate) ? this.dataObj.formData.valueDate : this.dataObj.getDataObj.billDate;
      this.payBillRequest.billDueDate = this.dataObj.formData.valueDate;
      this.payBillRequest.billAmount = this.dataObj.formData.payableAmount?this.dataObj.formData.payableAmount.replaceAll(",", ""):this.dataObj.formData.payableAmount;
    }

    // this.payBillRequest.billPaymentStatus= this.dataObj.getDataObj.billPaymentStatus;
    // this.payBillRequest.billerIntegration= this.dataObj.getDataObj.billerIntegration;
    // this.payBillRequest.billerName= this.dataObj.getDataObj.billerName;
    // this.payBillRequest.consumerDetails= this.dataObj.getDataObj.consumerDetails;
    // this.payBillRequest.currencyCode= this.dataObj.formData.selectedCorporateCurrencyCode;
    // this.payBillRequest.payableAmount= this.dataObj.formData.payableAmount;
    // this.payBillRequest.productName= this.dataObj.getDataObj.productName;
    // this.payBillRequest.referenceField1= this.dataObj.getDataObj.referenceField1;
    // this.payBillRequest.referenceField2= this.dataObj.getDataObj.referenceField2;
    // this.payBillRequest.referenceField3= this.dataObj.getDataObj.referenceField3;
    // this.payBillRequest.referenceField4= this.dataObj.getDataObj.referenceField4;
    // this.payBillRequest.referenceFieldValue1= this.dataObj.getDataObj.referenceFieldValue1;
    // this.payBillRequest.referenceFieldValue2= this.dataObj.getDataObj.referenceFieldValue2;
    // this.payBillRequest.referenceFieldValue3= this.dataObj.getDataObj.referenceFieldValue3;
    // this.payBillRequest.referenceFieldValue4= this.dataObj.getDataObj.referenceFieldValue4;
    // this.payBillRequest.selected= false;
    // this.payBillRequest.confirmButtonRequired= false;
    // this.payBillRequest.payOnDate= this.dataObj.formData.valueDate;
    // this.payBillRequest.selfConfirmed = false;
   
  }

  public getOatRequestObj() {
    return this.payBillRequest;
  }
}
