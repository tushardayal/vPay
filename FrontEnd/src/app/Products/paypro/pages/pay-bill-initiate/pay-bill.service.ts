import {Injectable} from '@angular/core';
import {AngularAjaxService} from "../../../../services/aps-services/ajaxService/angular-ajax.service";
import {BehaviorSubject, forkJoin} from "rxjs";
import {map} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class PayBillService {

  CONSTANTS = {
    ENTITY_NAME: 'BILLPAYMENT',
    GET_BILLERS_WITH_PRODUCTS: 'billerService/private/getBillersWithProducts',
    GET_PAY_BILL_LIST : "billPaymentService/private/getPayBillList",
    GET_BILLERS_FOR_BILL_PAYMENT : "billerRegistrationService/private/getBillersForBillPayment",
    GET_DEBITACCOUNTS : 'billPaymentService/private/getDebitAccounts',
    GET_ONLINEBALANCE : 'corporateAccountService/private/getOnlineBalance',
    CREATE: 'billPaymentService/private/singlePayBill',
    GET_ONLINE_BILL_DETAILS : 'billPaymentService/private/getOnlineBillDetails',
  };

  constructor(private ajaxService: AngularAjaxService) {}

  getBillersWithProducts() {
    return this.ajaxService.sendAjaxRequest(this.CONSTANTS.GET_BILLERS_FOR_BILL_PAYMENT, {}).pipe(map(res => res.dataMap.billers));
  }

  getPayBillList(billerName?) {
    if (!billerName) {
      billerName = "";
    }
    const data = {
      pageNumber: 1,
      entityName: "BILLPAYMENT",
      filters: [{
        name: "billerName", value: billerName, type: "String"
      }, {
        name: "productName", value: "", type: "String"
      }, {
        name: "subscriberName", type: "String"
      }, {
        name: "referenceFieldValue1", type: "String"
      }]
    };
    return this.ajaxService.sendAjaxRequest(this.CONSTANTS.GET_PAY_BILL_LIST, data);
  }

  getDebitAccounts() {
    return this.ajaxService.sendAjaxRequest(this.CONSTANTS.GET_DEBITACCOUNTS, {});
  }

  getOnlineBalance(account) {
    if (!account || account === "") {
      return;
    }
    const data = {
      filters: [
        {
          name: "accountNo", value: account.displayName, type: "String"
        }, {
          name: "currencyCode", value: account.enrichments.currencyCode, type: "String"
        },
        {
          name: "accountId", value: account.id, type: "String"
        }
      ]
    };
    return this.ajaxService.sendAjaxRequest(this.CONSTANTS.GET_ONLINEBALANCE, data);
  }

  getOnlineBillDetails(data) {
    return this.ajaxService.sendAjaxRequest(this.CONSTANTS.GET_ONLINE_BILL_DETAILS, data);
  }
  submitToServer(data){
    return this.ajaxService.sendAjaxRequest(this.CONSTANTS.CREATE, data);
  }
  
}
