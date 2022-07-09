import { Injectable } from '@angular/core';
import {AngularAjaxService} from "../../../../services/aps-services/ajaxService/angular-ajax.service";
import {map} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class MISService {
  CONSTANTS = {
    PAYMENT_VOLUME: "dashboardService/private/getTransactionVolumeDetails",
  };
  constructor(private angularAjax: AngularAjaxService ) { }

  getTransactionVolumeDetails() {
    return this.angularAjax.sendAjaxRequest(this.CONSTANTS.PAYMENT_VOLUME, {}).pipe(map(response => {
      // if (!response.transactionDetails || response.transactionDetails.length === 0) {
      // tslint:disable-next-line:max-line-length
      //   return {responseStatus: {message: "", status: "0"}, transactionDetails: [{transactionType: "CEFTS", txnCount: [{processName: "Daily", txnCount: 1, txnVolume: "45,000.00"}, {processName: "Weekly", txnCount: 17, txnVolume: "65,716.00"}], displayName: ""}, {transactionType: "Cashiers Order", txnCount: [{processName: "Daily", txnCount: 1, txnVolume: "100,001.00"}, {processName: "Weekly", txnCount: 17, txnVolume: "103,921.00"}], displayName: ""}, {transactionType: "Corporate Cheque", txnCount: [{processName: "Daily", txnCount: 0, txnVolume: "0.00"}, {processName: "Weekly", txnCount: 24, txnVolume: "9,768.00"}], displayName: ""}, {transactionType: "Internal Fund Transfer", txnCount: [{processName: "Daily", txnCount: 3, txnVolume: "5,000,352.00"}, {processName: "Weekly", txnCount: 19, txnVolume: "5,004,592.00"}], displayName: ""}, {transactionType: "LPOPP", txnCount: [{processName: "Daily", txnCount: 1, txnVolume: "121.00"}, {processName: "Weekly", txnCount: 1, txnVolume: "121.00"}], displayName: ""}, {transactionType: "Own Cheque", txnCount: [{processName: "Daily", txnCount: 0, txnVolume: "0.00"}, {processName: "Weekly", txnCount: 17, txnVolume: "4,722.00"}], displayName: ""}, {transactionType: "RTGS", txnCount: [{processName: "Daily", txnCount: 1, txnVolume: "6,780.00"}, {processName: "Weekly", txnCount: 1, txnVolume: "6,780.00"}], displayName: ""}, {transactionType: "SLIPS", txnCount: [{processName: "Daily", txnCount: 2, txnVolume: "11,912.00"}, {processName: "Weekly", txnCount: 18, txnVolume: "15,352.00"}], displayName: ""}], loggable: false, entityIdentifier: ""};
      // }
      return response;
    }));
  }
}
