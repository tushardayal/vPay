import {ChangeDetectorRef, Component, ElementRef, OnDestroy, QueryList, ViewChild, ViewChildren} from "@angular/core";
import * as _ from "lodash";
import {ListingService} from "src/app/listing/listing.service";
import {TransactionCommonService} from "../../../../../transaction-common.service";
import {Router} from "@angular/router";
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {AnimateItemsDirective} from 'src/app/directives/animate-items.directive';
import {BaseTransaction} from '../../interfacaes/base-transaction';
import {HelpPageService} from 'src/app/components/help-page/help-page.service';
import {TranslatePipe} from '@ngx-translate/core';
import {BillAcceptanceViewPage} from "../view/bill-acceptance-view.page";

@Component({
  selector: "bill-acceptance-listing",
  templateUrl: "./bill-acceptance-listing.page.html",
  styleUrls: ["./bill-acceptance-listing.page.scss"],
  providers: [TranslatePipe]
})
export class BillAcceptanceListingPage implements OnDestroy, BaseTransaction {
  // @ViewChild("sliding", { static: false }) sliding;
  @ViewChild("dynamicList", { static: false }) dynamicList;
  @ViewChild(AnimateItemsDirective, { static: false }) animateDirective: AnimateItemsDirective;
  @ViewChildren("sliding") sliding: QueryList<ElementRef>;
  @ViewChild("contentBox", { static: false }) contentBox: ElementRef;
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
    private translate: TranslatePipe
  ) {
    console.log("Bill acceptance constructor");
  }

  ionViewDidEnter() {
    this.dataItemList$ = this.listingService.dataItemList$
      .pipe(takeUntil(this.unsub$)).subscribe((val) => {
        if (
          this.listingService.selectedTab.entityName === "TRADEBILLACCEPTANCE"
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
        uerRefNo: element["User Ref No"],
        transactionStatus: element.Status,
        exporterName: element.Exporter,
        applicant: element.Applicant,
        beneficiary: element.Beneficiary,
        importer: element.Importer,
        tradeBillNO: element["Trade Bill No."],
        valueDate: element["Trade Bill Date"],
        currencyCode: element.Currency,
        amount: element.Amount,
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
      this.router.navigate(["/menu/import-trade/view/tradebillacceptance", item.id]);
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

  view(item, $event: MouseEvent): void {
    if (this.multiSelectionMode) {
      this.selectItem(item);
      return;
    } else {
      this.transactionService.viewInModal(item.id, BillAcceptanceViewPage);
      // this.transactionService.view(item.id);
      // this.router.navigate(["menu", "import-trade", "view", "tradebillacceptance", item.id]);
    }
  }

  doRefresh(event) {
    this.transactionService.doRefresh(event);
  }

  showHelpPage() {
    const labelArray = [{
      name: 'uerRefNo',
      text: this.translate.transform("lbl_user_ref_no")
    }, {
      name: 'beneficiary',
      text: this.translate.transform("lbl_beneficiary")
    }, {
      name: 'valueDate',
      text: this.translate.transform("lbl_txn_date")
    }, {
      name: 'billNo',
      text: this.translate.transform("lbl_trade_bill_no.")
    }, {
      name: 'applicant',
      text: this.translate.transform("lbl_applicant")
    }, {
      name: 'amount',
      text: this.translate.transform("lbl_currency_amount")
    }, {
      name: 'transactionStatus',
      text: this.translate.transform("lbl_status")
    }];
    this.helpPageSrv.showHelpPage({
      labelArray,
      elArray: this.sliding.toArray(),
      elParent: this.contentBox
    });
  }
}
