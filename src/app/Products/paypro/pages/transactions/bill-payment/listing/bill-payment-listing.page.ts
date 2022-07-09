import {Component, ElementRef, OnDestroy, QueryList, ViewChild, ViewChildren} from "@angular/core";
import {ListingService} from "src/app/listing/listing.service";
import * as _ from "lodash";
import {BaseTransaction} from "../../../../../interfacaes/base-transaction";
import {TransactionCommonService} from "../../../../../transaction-common.service";
import {Router} from "@angular/router";
import {takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {HelpPageService} from 'src/app/components/help-page/help-page.service';
import {TranslatePipe} from '@ngx-translate/core';
import {ToastService} from "../../../../../../services/aps-services/toast-service";
import {BillPaymentViewPage} from "../view/bill-payment-view.page";

@Component({
  selector: "bill-payment-listing",
  templateUrl: "./bill-payment-listing.page.html",
  styleUrls: ["./bill-payment-listing.page.scss"],
  providers: [TranslatePipe]
})
export class BillPaymentListingPage implements OnDestroy, BaseTransaction {
  // @ViewChild("sliding", { static: false }) sliding;
  @ViewChild("dynamicList", { static: false }) dynamicList;
  @ViewChildren("sliding") sliding: QueryList<ElementRef>;
  @ViewChild("contentBox", { static: false }) contentBox: ElementRef;
  multiSelectionMode;
  dataItemList: any[];
  loadMoreEvent;
  dataItemList$;
  unsub$ = new Subject();

  constructor(
      public listingService: ListingService,
      private transactionService: TransactionCommonService,
      private router: Router,
      private helpPageSrv: HelpPageService,
      private translate: TranslatePipe,
      private toastService: ToastService
  ) {}

  ionViewDidEnter() {
    this.dataItemList$ = this.listingService.dataItemList$
    .pipe(takeUntil(this.unsub$))
    .subscribe((val) => {
      if (this.listingService.selectedTab.entityName === "BILLPAYMENT") {
      if (this.loadMoreEvent) {
        this.loadMoreEvent.target.disabled = this.listingService.isLastPage;
      }
      this.dataItemList = val;
      if (this.dataItemList) {
        this.parseViewData();
      }
    }
    });
    this.listingService.multiSelectionMode$
    .pipe(takeUntil(this.unsub$)).subscribe(
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
      dataItems.push({
        id: element.Id,
        consumerDetails: element["Consumer Details"]?element["Consumer Details"].split('<br>')[0]:element["Consumer Details"],
        batchNo: element["Batch No."],
        channel: element.Channel,
        outstandingBalance: element["Outstanding Balance"],
        payableAmount: element["Payable Amount"],
        dueDate: element["Due Date"],
        paymentDate: element["Payment Date"],
        debitAccountNo: element["Debit Account No"],
        lastAction: element["Last Action"],
        billerName: element["Biller Name"],
        productName: element["Product Name"],
        refField1: element["Reference Field 1"],
        refFieldVal1: element["Reference Field Value 1"],
        modifiedBy: element["Modified By"],
        billerIntegration: element["Biller Integration"],
        billPaymentStatus: element["Bill Payment Status"],
        authLevel: element["Auth Level"],
        modifiedOn: element["Modified On"],
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
      this.transactionService.viewInModal(item.id, BillPaymentViewPage);
      // this.router.navigate(["/menu/paypro/view/billPayment", item.id]);
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
    const labelArray = [{
      name: 'refFieldVal1',
      text: this.translate.transform("lbl_ref_field_val1")
    }, {
      name: 'consumerName',
      text: this.translate.transform("lbl_consumer_name")
    }, {
      name: 'paymentDate',
      text: this.translate.transform("lbl_payment_Date")
    }];
    if (this.listingService.currentListType.key === 'PENDINGLIST') {
      labelArray.push({
        name: 'status',
        text: this.translate.transform("lbl_last_action")
      });
    }
    if (this.listingService.currentListType.key === 'AUTHORIZEDLIST') {
      labelArray.push({
        name: 'billPaymentStatus',
        text: this.translate.transform("lbl_bill_payment_Type")
      });
    }
    labelArray.push({
      name: 'amount',
      text: this.translate.transform("lbl_payable_amount")
    }, {
      name: 'billerName',
      text: this.translate.transform("lbl_biller_name")
    });
    this.helpPageSrv.showHelpPage({
      labelArray,
      elArray: this.sliding.toArray(),
      elParent: this.contentBox
    });
  }
}
