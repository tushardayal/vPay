import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import {PayBillService} from "src/app/Products/paypro/pages/pay-bill-initiate/pay-bill.service";
import { RoutingStateService } from "../../../../../services/aps-services/routing-state.service";
import { ObjTransferService } from 'src/app/services/aps-services/obj-transfer.service';
import { UserService } from 'src/app/services/aps-services/user.service';
import { Subject, BehaviorSubject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';

@Component({
  selector: "app-list-of-bills",
  templateUrl: "./list-of-bills.page.html",
  styleUrls: ["./list-of-bills.page.scss"],
})
export class ListOfBillsPage implements OnInit {
  backUrl;
  refreshTargetEvent;
  productFilterText;
  billList: any = [];
  dataItemList: any = [];
  billingsList: any = [];
  fetchRecords: any = [];
  loading$:BehaviorSubject<boolean> = new BehaviorSubject(null);
  unSubObj$ = new Subject();

  constructor(
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute,
    private routingState: RoutingStateService,
    private payBillService: PayBillService,
    private objTransSrv: ObjTransferService
  ) { 
   
  }
  ionViewWillEnter() {
  }
  ngOnInit() {
    
    this.backUrl = this.routingState.getPreviousUrl();
    const stateData =  this.objTransSrv.getObjData('billerData');
    this.billList = stateData.productDetails;    
    this.objTransSrv.removeObj('billerData');
    this.getPayBillList();
  }
  getPayBillList(){   
    
    let billerCode = this.billList.billerName;
    this.loading$.next(true);
    this.payBillService.getPayBillList(billerCode)
    .pipe(takeUntil(this.unSubObj$),
    finalize(() => {
      this.loading$.next(false);
    }))
    .subscribe((response) => {
      
      let validHeaders={};
      if(response.headers.length > 0){
        for(let index=0;index<response.headers.length;index++){
            let displayName = response.headers[index].displayName;
            validHeaders[displayName]=index;
        }
      }
      let setCurrencyCode = this.userService.getEnrichmentDetails().baseCurrencyCode;
      let billingDetailsList = response.dataList;
      let billingsList = [];
      billingDetailsList.forEach((value) => {
        let data = {
            "id": value[validHeaders["Id"]],
            "selected": false,
            "consumerDetails":value[validHeaders["Consumer Details"]],
            "referenceField1": value[validHeaders["Reference Field 1"]],
            "referenceField2": value[validHeaders["Reference Field 2"]],
            "referenceField3": value[validHeaders["Reference Field 3"]],
            "referenceField4": value[validHeaders["Reference Field 4"]],
            "referenceFieldValue1": value[validHeaders["Reference Field Value 1"]],
            "referenceFieldValue2": value[validHeaders["Reference Field Value 2"]],
            "referenceFieldValue3": value[validHeaders["Reference Field Value 3"]],
            "referenceFieldValue4": value[validHeaders["Reference Field Value 4"]],
            "billerName": value[validHeaders["Biller Name"]],
            "debitAccountNo": value[validHeaders["Debit Account No"]],
            "billDate": value[validHeaders["Bill Date"]],
            "currencyCode": setCurrencyCode,
            "billPaymentStatus": value[validHeaders["Bill Payment Status"]],
            "payableAmount": value[validHeaders["Payable Amount"]],
            "billAmount": value[validHeaders["Outstanding Balance"]],
            "dueDate":value[validHeaders["Due Date"]],
            "paymentDate":value[validHeaders["Payment Date"]],
            "productName":value[validHeaders["Product Name"]],
            "debitAccountId":value[validHeaders["DebitAccountId"]],
            "billerIntegration":value[validHeaders["Biller Integration"]]
        };
        billingsList.push(data);        
      });
      
      this.dataItemList = billingsList;
      if (this.refreshTargetEvent) {
        this.refreshTargetEvent.target.complete();
      }
    });   
  }
  

  doRefresh(event) {
    this.refreshTargetEvent = event;    
    this.getPayBillList();
  }

  onItemClickFunc(details) {    
    if(details.billerIntegration =='Online' && details.billAmount =='-'){
      return;
    }
    this.productFilterText = "";
    this.objTransSrv.setObjData("summaryData", {
      summaryDetails: details,
      productsDetails: this.billList,
    });
    this.router.navigate(["../paybillpayment"], { relativeTo: this.route });
  }

  fetchNow(id, index, refNo) {
    const data = { "dataMap": {
        "id": id,
        "referenceNo": refNo
    }};
    this.payBillService.getOnlineBillDetails(data)
    .subscribe((response) => {
      this.fetchRecords = response.dataMap;
      this.dataItemList[index].billAmount = this.fetchRecords.billAmount;
      this.dataItemList[index].dueDate = this.fetchRecords.billDueDate;
      this.dataItemList[index].billDate = this.fetchRecords.billDate;     
    });  
  }
}
