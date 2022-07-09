import {Component, ElementRef, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren} from "@angular/core";
import {ListingService} from "src/app/listing/listing.service";
import {ActivatedRoute, Router} from "@angular/router";
import {TransactionCommonService} from "../../../../../transaction-common.service";
import {BulkPaymentDetailsEnity} from "./bulk-payment-details-enitity";
import {Subject} from "rxjs";
import {BaseTransaction} from "../../../../../interfacaes/base-transaction";
import {ObjTransferService} from "src/app/services/aps-services/obj-transfer.service";
import {takeUntil} from 'rxjs/operators';
import {HelpPageService} from "src/app/components/help-page/help-page.service";
import {TranslatePipe} from "@ngx-translate/core";
import {AngularAjaxService} from "src/app/services/aps-services/ajaxService/angular-ajax.service";
import {BulkPaymentViewPage} from "../view/bulk-payment-view.page";

@Component({
  selector: "app-bulk-payment-details-review-listing",
  templateUrl: "./bulk-payment-details-review-listing.page.html",
  styleUrls: ["./bulk-payment-details-listing.page.scss"],
    providers: [TranslatePipe]
})
export class BulkPaymentDetailsReviewListingPage implements OnInit, OnDestroy, BaseTransaction {

  @ViewChild("dynamicList", { static: false }) dynamicList;
  @ViewChildren("sliding") sliding: QueryList<ElementRef>;
 @ViewChild("contentBox", { static: false }) contentBox: ElementRef;

  menuEntity = BulkPaymentDetailsEnity;
  dataItemList: any[];
  requestBatchId;
  selectedBatch: any = {};
  refreshTargetEvent;
  listingState;
  responseData;
  private unsub$ = new Subject<any>();
  id;
  constructor(
    public transactionService: TransactionCommonService,
    private router: Router,
    private activeRoute: ActivatedRoute,
    private objTransfSrv: ObjTransferService,
    private helpPageSrv: HelpPageService,
    private translate: TranslatePipe,
    private ajaxSerice: AngularAjaxService,
    private listingService: ListingService
  ) {
    console.log("bulk constructor");
   /* activeRoute.paramMap
    .pipe(takeUntil(this.unsub$))
    .subscribe((val) => {
      this.requestBatchId = val.get("id");
    });*/
    this.selectedBatch = this.objTransfSrv.getObjData("bulkBatchData");
    this.objTransfSrv.removeObj('bulkBatchData');
    this.listingService.selectedTab = this.menuEntity;
  }
  loadMoreData(event: any): void {
  }
  selectItem(item: any): void {
  }

  ngOnInit() {
    this.requestBatchId = this.id;
    this.loadTransactionsData();
  }

  ionViewDidEnter() {
    console.log('ionViewDidEnter')
  }
  ionViewWillLeave(): void {
    console.log("ionViewWillLeave details");
    if (!this.objTransfSrv.getObjData("isForView")) {
      this.listingService.selectedTab = this.objTransfSrv.getObjData(
        "bulkMenuData"
      ).tabData;
      this.objTransfSrv.removeObj('isForView');
      this.objTransfSrv.removeObj('bulkBatchData');
    }
  }

  loadTransactionsData() {
    const data = {
      dataMap: {
        id: this.requestBatchId
      }
    };
    this.listingState = 'loading';
    this.ajaxSerice.sendAjaxRequest('bulkPaymentService/private/view',data,'POST',false)
    .pipe(takeUntil(this.unsub$))
    .subscribe((response) => {
      this.dataItemList = [];
      this.responseData = response;
      if(this.responseData && this.responseData.transactions && this.responseData.transactions.dataList)
      for(const value of this.responseData.transactions.dataList) {
        const dataItem: any = {};
        for (const index in this.responseData.transactions.headers) {
          const displayName = this.responseData.transactions.headers[index].displayName;
          dataItem[displayName] = value[index];
        }
        dataItem.links = [];
        this.dataItemList.push(dataItem);
      };
      this.parseViewData()
      if(this.dataItemList.length > 0) {
        this.listingState = 'success';
      }else{
        this.listingState = 'notFound';
      }
      if (this.refreshTargetEvent) {
        try {
          this.refreshTargetEvent.target.complete();
        } catch (e) {
          console.log(e);
        }
      }
    });
  }
  
  parseViewData() {
    const dataItems = [];
    if (this.dataItemList == null) {
      return;
    }
    this.dataItemList.forEach((element) => {
     const actions =[];
      if(element['Action'] && element['Action'].includes('openViewAuthRemarks(')){
        actions.push({ icon: 'checkmark', text: true, displayName: "View\nRemarks", onClick: element['Action'] })
      }
      dataItems.push({
        id: element.Id,
        beneficiaryName: element["Beneficiary Name"],
        currency: element["Payable CCY"],
        amount: element["Amount"],
        paymentType: element["Payment Method"],
        debitAccountNo: element["Account NO"],
        status: element["Status"],
        actions: actions,
        corporateProductId: element["Corporate Product Id"],
        modifiedBy: element["Modified By"],
      });
    });
    this.dataItemList = dataItems;
    console.log("pass", this.dataItemList);
  }

  view(item, $event: MouseEvent) {
    this.objTransfSrv.setObjData("isForView", true);
    this.objTransfSrv.setObjData("requestBatchId", this.requestBatchId);
    this.transactionService.viewInModal(item.id, BulkPaymentViewPage);
    // this.router.navigate(["/menu/paypro/view/bulkPayment", item.id]);
    console.log("view Id", item.id);
  }

  doRefresh(event) {
    this.refreshTargetEvent = event;
    this.loadTransactionsData()
  }

  onActionClicked(arr) {
    const event = arr[0];
    if (event) {
      event.stopPropagation();
    }
    this.dynamicList.closeSlidingItems();
    this.transactionService.onActionClicked(arr);
  }
  ngOnDestroy() {
    this.unsub$.next();
    this.unsub$.complete();
    this.unsub$.unsubscribe();
  }
  
  showHelpPage() {
    const labelArray = [
      {name: 'debitAccountNo', text: this.translate.transform("lbl_debit_account_no.")},
      {name: 'beneficiaryName', text: this.translate.transform("lbl_beneficiary_name")},
      {name: 'paymentType', text: this.translate.transform("lbl_payment_Type")},
      {name: 'status', text: this.translate.transform("lbl_transaction_status")},
      {name: 'amount', text: this.translate.transform("lbl_currency_amount")}
    ];
    this.helpPageSrv.showHelpPage({
      labelArray,
      elArray: this.sliding.toArray(),
      elParent: this.contentBox
    });
  }
  
}
