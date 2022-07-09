import {ChangeDetectorRef, Component, ElementRef, OnDestroy, QueryList, ViewChild, ViewChildren} from "@angular/core";
import * as _ from "lodash";
import {BaseTransaction} from "../../../../../interfacaes/base-transaction";
import {ListingService} from "src/app/listing/listing.service";
import {TransactionCommonService} from "../../../../../transaction-common.service";
import {Router} from "@angular/router";
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {HelpPageService} from 'src/app/components/help-page/help-page.service';
import {TranslatePipe} from '@ngx-translate/core';
import {ObjTransferService} from "../../../../../../services/aps-services/obj-transfer.service";
import {ModalController} from "@ionic/angular";
import {SinglePaymentViewPage} from "../view/single-payment-view.page";

@Component({
  selector: "single-payment-listing",
  templateUrl: "./single-payment-listing.page.html",
  styleUrls: ["./single-payment-listing.page.scss"],
  providers: [TranslatePipe]
})
export class SinglePaymentListingPage implements OnDestroy, BaseTransaction {
  @ViewChildren("sliding") sliding: QueryList<ElementRef>;
  @ViewChild("contentBox", { static: false }) contentBox: ElementRef;
  @ViewChild("dynamicList", { static: false }) dynamicList;
  multiSelectionMode;
  dataItemList: any[] = [];
  loadMoreEvent;
  dataItemList$;
  unsub$ = new Subject();

  constructor(
      public listingService: ListingService,
      public transactionService: TransactionCommonService,
      private router: Router,
      private cdr: ChangeDetectorRef,
      private helpPageSrv: HelpPageService,
      private translate: TranslatePipe,
      private modalCtrl: ModalController,
      private objTransSrv: ObjTransferService
  ) {
    console.log("SinglePaymentListPage constructor");
  }

  ionViewDidEnter() {
    this.dataItemList$ = this.listingService.dataItemList$
    .pipe(takeUntil(this.unsub$)).subscribe((val) => {
      if (
        this.listingService.selectedTab.entityName === "BSINGLEPAYMENTREQUEST"
      ) {
        if (this.loadMoreEvent) {
          this.loadMoreEvent.target.disabled = this.listingService.isLastPage;
        }
        this.dataItemList = val;
        if (this.dataItemList) {
          this.parseViewData();
        }
      }
    });
    console.log("item route");
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
      dataItems.push({
        id: element.Id,
        batchNo: element["Batch No."],
        beneficiaryName: element["Beneficiary Name"],
        transactionStatus: element.Status,
        paymentMethod: element["Payment Method"],
        valueDate: element["Value Date"],
        currencyCode: element.Currency,
        amount: element.Amount,
        debitAccountNo: element["Debit Account No"],
        transactionDate: element["Transaction Date"],
        modifiedBy: element["Modified By"],
        modifiedOn: element["Modified On"],
        rejectReason: element["Reject Reason"],
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

  viewTransactionCommonService(item, $event: MouseEvent) {
    if (this.multiSelectionMode) {
      this.selectItem(item);
      return;
    } else {
      this.router.navigate(["/menu/paypro/view/singlePayment", item.id]);
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
    if (arr[1].includes('edit') || arr[1].includes('resubmit')) {
      this.objTransSrv.setObjData('editData', arr[2]);
      this.router.navigate(["menu", "paypro", "single-payment-intiate", "initiate"]);
    }
    this.transactionService.onActionClicked(arr);
  }

  view(item, $event: MouseEvent): void {
    if (this.multiSelectionMode) {
      this.selectItem(item);
      return;
    } else {
      // this.transactionService.view(item.id);
      this.transactionService.viewInModal(item.id, SinglePaymentViewPage);
      // this.router.navigate(["menu", "paypro", "view", "singlePayment", item.id]);
    }
  }

  doRefresh(event) {
    this.transactionService.doRefresh(event);
  }

  showHelpPage() {
    const labelArray = [{
      name: 'batchNo',
      text: this.translate.transform("lbl_batch_no.")
    }];
    if (!['BANKREJECTLIST'].includes(this.listingService.currentListType.key)) {
      labelArray.push({
        name: 'debitAccountNo',
        text: this.translate.transform("lbl_debit_account_no.")
      });
    }
    labelArray.push( {
      name: 'amount',
      text: this.translate.transform("lbl_currency_amount")
    }, {
      name: 'transactionDate',
      text: this.translate.transform("lbl_txn_date")
    });
    if (!['REJECTLIST'].includes(this.listingService.currentListType.key)) {
      labelArray.push({
        name: 'transactionStatus',
        text: this.translate.transform("lbl_transaction_status")
      });
    }
    labelArray.push({
      name: 'beneficiaryName',
      text: this.translate.transform("lbl_beneficiary_name")
    }, {
      name: 'paymentMethod',
      text: this.translate.transform("lbl_payment_method")
    });
    this.helpPageSrv.showHelpPage({
      labelArray,
      elArray: this.sliding.toArray(),
      elParent: this.contentBox
    });
  }
}
