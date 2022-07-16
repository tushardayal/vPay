import {Component, ElementRef, OnDestroy, QueryList, ViewChild, ViewChildren} from "@angular/core";
import {ListingService} from "src/app/listing/listing.service";
import * as _ from "lodash";
import {BaseTransaction} from "../../../../../interfacaes/base-transaction";
import {TransactionCommonService} from "../../../../../transaction-common.service";
import {Router} from "@angular/router";
import {ObjTransferService} from 'src/app/services/aps-services/obj-transfer.service';
import {Subject, Subscription} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {HelpPageService} from 'src/app/components/help-page/help-page.service';
import {TranslatePipe} from '@ngx-translate/core';
import {BillPaymentUploadDetailsListingPage} from "../details-listing/bill-payment-upload-details-listing.page";
import {BillPaymentUploadTransactionLevelListingPage} from "../details-listing/bill-payment-upload-transaction-level-listing.page";

@Component({
  selector: "bill-payment-upload-listing",
  templateUrl: "./bill-payment-upload-listing.page.html",
  styleUrls: ["./bill-payment-upload-listing.page.scss"],
  providers: [TranslatePipe]
})
export class BillPaymentUploadListingPage implements OnDestroy, BaseTransaction {
  // @ViewChild("sliding", { static: false }) sliding;
  @ViewChild("dynamicList", {static: false}) dynamicList;
  @ViewChildren("sliding") sliding: QueryList<ElementRef>;
  @ViewChild("contentBox", {static: false}) contentBox: ElementRef;
  multiSelectionMode;
  dataItemList: any[];
  loadMoreEvent;
  dataItemList$: Subscription;
  unsub$ = new Subject();

  constructor(
      public listingService: ListingService,
      private transactionService: TransactionCommonService,
      private router: Router,
      private objTransfSrv: ObjTransferService,
      private helpPageSrv: HelpPageService,
      private translate: TranslatePipe
  ) {
  }

  ionViewDidEnter() {
    this.dataItemList$ = this.listingService.dataItemList$
        .pipe(takeUntil(this.unsub$))
        .subscribe((val) => {
          if (this.listingService.selectedTab.entityName === "BILLPAYMENTUPLOAD") {
            if (this.loadMoreEvent) {
              this.loadMoreEvent.target.complete();
              this.loadMoreEvent.target.disabled = this.listingService.isLastPage;
            }
            this.dataItemList = val;
            if (this.dataItemList) {
              this.parseViewData();
            }
          }
        });
    this.listingService.multiSelectionMode$
        .pipe(takeUntil(this.unsub$))
        .subscribe(
            (value) => (this.multiSelectionMode = value)
        );

    this.listingService.clickedHelp$
        .pipe(takeUntil(this.unsub$))
        .subscribe((val) => {
          if (val) {
            this.showHelpPage();
          }
        });
  }

  ngOnDestroy() {
    this.unsub$.next();
    this.unsub$.complete();
    this.unsub$.unsubscribe();
    this.dataItemList$.unsubscribe();
  }

  parseViewData() {
    const dataItems = [];
    if (this.dataItemList == null) {
      return;
    }
    this.dataItemList.forEach((element) => {
      let batchno = element["Batch No"];
      if (
          element["Batch No"] &&
          element["Batch No"].split("</a>").length > 1
      ) {
        batchno = element["Batch No"].split("</a>")[0].split(">")[1];
      }
      dataItems.push({
        id: element.Id,
        batchNo: batchno,
        channel: element.Channel,
        billerName: element["Biller Name"],
        uploadDate: element["Upload Date"],
        noOfBills: element["No Of Bills"],
        totalBillAmount: element["Total Bill Amount"],
        status: element.Status,
        lastAction: element["Last Action"],
        modifiedBy: element["Modified By"],
        authLevel: element.AuthLevel,
        rejectReason: element["Reject Reason"],
        productName: element["Product Name"],
        selected: element.selected,
        actions: element.actions,
      });
    });
    this.dataItemList = dataItems;
    console.log("pass", this.dataItemList);
  }

  selectItem(item: any) {
    if (!this.transactionService.checkAuthorizationAccess(item.actions)) {
      return;
    }
    item.selected = !item.selected;
    if (item.selected === true) {
      this.listingService.selectedIds.push(item.id);
    } else {
      _.remove(this.listingService.selectedIds, (id) => {
        return id === item.id;
      });
    }
    this.listingService.setMultiSelectionMode(
        _.every(this.dataItemList, ["selected", false]) === false
    );
  }

  view(item, $event: MouseEvent) {
    if (this.multiSelectionMode) {
      this.selectItem(item);
      return;
    } else if (this.transactionService.checkViewAccess(item, true)) {
      this.objTransfSrv.setObjData(
          "billMenuData",
          {
            tabData: this.listingService.selectedTab,
            selectedListing: this.listingService.currentListType
          }
      );
      this.objTransfSrv.setObjData("billBatchData", item);

      if (this.listingService.currentListType &&
          (this.listingService.currentListType.key === "REJECTLIST"
              || this.listingService.currentListType.key === "PENDINGLIST")) {
        this.transactionService.viewInModal(item.id, BillPaymentUploadTransactionLevelListingPage);
      } else {
        this.transactionService.viewInModal(item.id, BillPaymentUploadDetailsListingPage);
      }
      // this.router.navigate(["/menu/paypro/billPayementUploadDetails", item.id]);
    }
    console.log("view Id", item.id);
  }

  loadMoreData(event) {
    this.loadMoreEvent = event;
    this.listingService.getNextPage()
        .pipe(takeUntil(this.unsub$))
        .subscribe((value) => {
          if (this.loadMoreEvent) {
            this.loadMoreEvent.target.complete();
            this.loadMoreEvent.target.disabled = this.listingService.isLastPage;
          }
        });
  }

  onActionClicked(arr) {
    const event = arr[0];
    if (event) {
      event.stopPropagation();
    }
    this.dynamicList.closeSlidingItems();
    this.transactionService.onActionClicked(arr);
  }

  doRefresh(event) {
    this.transactionService.doRefresh(event);
  }

  showHelpPage() {
    const labelArray = [
      {name: 'batchNo', text: this.translate.transform("lbl_bill_ref_no")},
      {name: 'noOfBills', text: this.translate.transform("lbl_no_of_bills")},
      {name: 'billerName', text: this.translate.transform("lbl_biller_name")},
      {name: 'uploadDate', text: this.translate.transform("lbl_upload_date")},
      {name: 'status', text: this.translate.transform("lbl_status")},
      {name: 'totalBillAmount', text: this.translate.transform("lbl_total_bill_amount")}
    ];

    if (this.listingService.currentListType.key === 'PENDINGLIST') {
      labelArray.push({name: 'lastAction', text: this.translate.transform("lbl_last_action")});
    }

    this.helpPageSrv.showHelpPage({
      labelArray,
      elArray: this.sliding.toArray(),
      elParent: this.contentBox
    });
  }
}
