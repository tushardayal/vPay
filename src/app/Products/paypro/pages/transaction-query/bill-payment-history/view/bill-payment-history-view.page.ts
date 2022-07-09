import { Component, OnInit } from "@angular/core";
import { TransactionQueryService } from '../../transaction-query.service';
import { ObjTransferService } from 'src/app/services/aps-services/obj-transfer.service';
import { AngularAjaxService } from 'src/app/services/aps-services/ajaxService/angular-ajax.service';
import { RoutingStateService } from 'src/app/services/aps-services/routing-state.service';

@Component({
  selector: "bill-payment-history-view",
  templateUrl: "./bill-payment-history-view.page.html",
  styleUrls: ["./bill-payment-history-view.page.scss"]
})
export class BillPaymentHistoryViewPage implements OnInit {
  id: string;
  dataObj: any = {};
  backBtnUrl;
  constructor(
    private ajxService: AngularAjaxService,
    private objTransSrv: ObjTransferService,
    private routeState: RoutingStateService
  ) {
   this.backBtnUrl = routeState.getPreviousUrl();

  }

  ngOnInit() {
    this.getDataFromServer();
  }

  getDataFromServer() {
    const data =  this.objTransSrv.getObjData('details');
    this.objTransSrv.removeObj('details');
    const dataMap = {
      filters: [{
        name: 'Id',
        value: data.details.id,
        type: 'String'
      }]
    };


    this.ajxService.sendAjaxRequest(data.ajaxUrl, dataMap).subscribe((response: any) => {
        this.dataObj = response.billPaymentHistoryDetsils;
        this.dataObj.makerName = response.maker;
        this.dataObj.modifiedOn = response.makerDateTime;
        this.dataObj.makerChannel   = response.channel;
    });
}

  
 
}
