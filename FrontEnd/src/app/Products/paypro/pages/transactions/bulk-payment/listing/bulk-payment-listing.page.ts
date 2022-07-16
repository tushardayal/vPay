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
import {bulkPaymentDetailsListingGuard} from "../details-listing/bulk-payment-details-guard";
import {BulkPaymentDetailsListingPage} from "../details-listing/bulk-payment-details-listing.page";
import {BulkPaymentDetailsReviewListingPage} from "../details-listing/bulk-payment-details-review-listing.page";

@Component({
  selector: "bulk-payment-listing",
  templateUrl: "./bulk-payment-listing.page.html",
  styleUrls: ["./bulk-payment-listing.page.scss"],
  providers: [TranslatePipe]
})
export class BulkPaymentListingPage implements OnDestroy, BaseTransaction {
  // @ViewChild("sliding", { static: false }) sliding;
  @ViewChild("dynamicList", { static: false }) dynamicList;
  @ViewChildren("sliding") sliding: QueryList<ElementRef>;
  @ViewChild("contentBox", { static: false }) contentBox: ElementRef;
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
    private translate: TranslatePipe,
    private bulkPaymentDetailsListingsrv: bulkPaymentDetailsListingGuard
  ) {
    console.log("bulk constructor");
  }
  ionViewDidEnter() {
    this.dataItemList$ = this.listingService.dataItemList$
    .pipe(takeUntil(this.unsub$))
    .subscribe((val) => {
      if (this.listingService.selectedTab.entityName === "BBULKPAYMENTREQUEST") {
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
      let batchno = element["Batch No."];
      if (
        element["Batch No."] &&
        element["Batch No."].split("</a>").length > 1
      ) {
        batchno = element["Batch No."].split("</a>")[0].split(">")[1];
      }
      dataItems.push({
        id: element.Id,
        transactionDate: element["Txn Date"],
        batchNo: batchno,
        channel: element.Channel,
        customerFileName: element["Customer File Name"],
        noOfTxns: element["No. Of Txns"],
        amountIn: element["Amount In (LCY)"],
        uploadedBy: element["Uploaded By"],
        uploadDateTime: element["Upload Date Time"],
        txnValue: element["Txn Value"],
        transactionStatus: element.Status,
        modifiedBy: element["Modified By"],
        modifiedOn: element["Modified On"],
        rejectReason: element["Reject Reason"],
        isTransactionLevelAuth: element["Upload Status"],
        requestBy: element["Request By"],
        selected: element.selected,
        actions: element.actions,
      });
    });
    this.dataItemList = dataItems;
    console.log("pass", this.dataItemList);
    this.bulkPaymentDetailsListingsrv.parentListingType = this.listingService.currentListType.key;
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

  showFileName(event, item) {
    if (event.target.className.includes('customerFileName')) {
      if (event && event.stopPropagation) {
        event.stopPropagation();
      }
      item.showFullName = !item.showFullName;
      return true;
    }
    return false;
  }
  view(item, $event: MouseEvent) {
    if (this.showFileName($event, item)) {
      return;
    }
    if (this.multiSelectionMode) {
      this.selectItem(item);
      return;
    } else if (this.transactionService.checkViewAccess(item, true)) {
      this.objTransfSrv.setObjData(
          "bulkMenuData",
          {
            tabData: this.listingService.selectedTab,
            selectedListing: this.listingService.currentListType
          }
      );
      this.objTransfSrv.setObjData("bulkBatchData", item);
      this.bulkPaymentDetailsListingsrv.parentListingType = this.listingService.currentListType.key;
      if (this.listingService.currentListType.key !== "PENDINGLIST") {
        this.transactionService.viewInModal(item.id, BulkPaymentDetailsReviewListingPage);
      } else {
        this.transactionService.viewInModal(item.id, BulkPaymentDetailsListingPage);
      }
      // this.router.navigate(["/menu/paypro/bulkPayementDetails", item.id]);
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
      {name: 'batchNo', text: this.translate.transform("lbl_batch_no")},
      {name: 'noOfTxns', text: this.translate.transform("lbl_no_of_transactions")},

    ];

    if (this.listingService.currentListType.key === 'PENDINGLIST') {
      labelArray.push({name: 'uploadedBy', text: this.translate.transform("lbl_uploaded_by")});
      labelArray.push({name: 'transactionDate', text: this.translate.transform("lbl_txn_date")});
      labelArray.push({name: 'transactionStatus', text: this.translate.transform("lbl_transaction_status")});
      labelArray.push({name: 'amountInLCY', text: this.translate.transform("lbl_amount_in_(lcy)")});
      labelArray.push({name: 'customerFileName', text: this.translate.transform("lbl_customer_file_name")});
      }
    if (this.listingService.currentListType.key === 'AUTHORIZEDLIST' || this.listingService.currentListType.key === 'BANKREJECTLIST') {
      labelArray.push({name: 'requestBy', text: this.translate.transform("lbl_requestby")});
      labelArray.push({name: 'transactionDate', text: this.translate.transform("lbl_txn_date")});
      labelArray.push({name: 'amountInLCY', text: this.translate.transform("lbl_amount_in_(lcy)")});
      labelArray.push({name: 'customerFileName', text: this.translate.transform("lbl_customer_file_name")});
      }
    if (this.listingService.currentListType.key === 'REJECTLIST' ) {
      labelArray.push({name: 'uploadedBy', text: this.translate.transform("lbl_uploaded_by")});
      labelArray.push({name: 'transactionDate', text: this.translate.transform("lbl_txn_date")});
      // labelArray.push({name: 'transactionStatus', text: this.translate.transform("lbl_transaction_status")});
      labelArray.push({name: 'amountInLCY', text: this.translate.transform("lbl_amount_in_(lcy)")});
      labelArray.push({name: 'customerFileName', text: this.translate.transform("lbl_customer_file_name")});
      }
    this.helpPageSrv.showHelpPage({
      labelArray,
      elArray: this.sliding.toArray(),
      elParent: this.contentBox
    });
  }
}
