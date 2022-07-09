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
import {OwnAccountTransferViewPage} from "../view/own-account-transfer-view.page";

@Component({
  selector: "own-account-transfer-listing",
  templateUrl: "./own-account-transfer-listing.page.html",
  styleUrls: ["./own-account-transfer-listing.page.scss"],
  providers: [TranslatePipe]
})
export class OwnAccountTransferListingPage implements OnDestroy, BaseTransaction {
  // @ViewChild("sliding", { static: false }) sliding;
  @ViewChild("dynamicList", { static: false }) dynamicList;
  @ViewChildren("sliding") sliding: QueryList<ElementRef>;
  @ViewChild("contentBox", { static: false }) contentBox: ElementRef;
  dataItemList: any = [];
  multiSelectionMode;
  loadMoreEvent;
  dataItemList$;
  unsub$ = new Subject();
  constructor(
    private listingService: ListingService,
    private transactionService: TransactionCommonService,
    private router: Router,
    private helpPageSrv: HelpPageService,
    private translate: TranslatePipe
  ) {
    console.log("OAT constructor");
  }

  ionViewDidEnter() {
    this.dataItemList$ = this.listingService.dataItemList$
    .pipe(takeUntil(this.unsub$))
    .subscribe((val) => {
      if (this.listingService.selectedTab.entityName === "OWNACCOUNTTRANSFER") {
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
        paymentMethod: element["Payment Method"],
        creditAccountTitle: element["Credit Account Title"],
        debitAccountNo: element["Debit Account No."],
        transactionDate: element["Transaction Date"],
        debitCcy: element["Debit CCY"],
        debitAmount: element["Debit Amount"],
        valueDate: element["Value Date"],
        corpRefNo: element["Corp Ref No."],
        creditAccountNo: element["Credit Account No."],
        creditCcy: element["Credit CCY"],
        creditAmount: element["Credit Amount"],
        channel: element.Channel,
        beneficiaryName: element["Beneficiary Name"],
        transactionStatus: element.Status,
        modifiedBy: element["Modified By"],
        modifiedOn: element["Modified On"],
        selected: element.selected,
        actions: element.actions,
      });
    });
    this.dataItemList = dataItems;
    console.log("pass", this.dataItemList);
  }

  selectItem(item: any): void {
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
  view(item: any, $event: MouseEvent): void {
    if (this.multiSelectionMode) {
      this.selectItem(item);
      return;
    } else {
      // this.transactionService.view(item.id);
      this.transactionService.viewInModal(item.id, OwnAccountTransferViewPage);
      // this.router.navigate(["/menu/paypro/view/OAT/", item.id]);
    }
  }
  loadMoreData(event: any): void {
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
  onActionClicked(arr): void {
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
    let labelArray = [{
      name: 'batchNo',
      text: this.translate.transform("lbl_batch_no.")
      }, {
        name: 'debitAccountNo',
        text: this.translate.transform("lbl_debit_account_no.")
      }, {
        name: 'debitAmount',
        text: this.translate.transform("lbl_debit_ccy_-_debit_amount")
      }, {
        name: 'transactionDate',
        text: this.translate.transform("lbl_txn_date")
      }];

    if (!['BANKREJECTLIST', 'REJECTLIST'].includes(this.listingService.currentListType.key)) {
      labelArray.push({
        name: 'transactionStatus',
        text: this.translate.transform("lbl_transaction_status")
      });
    }

    labelArray.push(...[{
      name: 'creditAccountNo',
      text: this.translate.transform("lbl_credit_account_no.")
    }, {
      name: 'creditAmount',
      text: this.translate.transform("lbl_credit_ccy_-_credit_amount")
    }, {
      name: 'paymentMethod',
      text: this.translate.transform("lbl_payment_method")
    }]);

    this.helpPageSrv.showHelpPage({
      labelArray,
      elArray: this.sliding.toArray(),
      elParent: this.contentBox
    });
  }
}
