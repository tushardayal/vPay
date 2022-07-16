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
import {Filter} from "../../../../../../interfaces/generic-interfaces";
import {LetterOfCreditAmendViewPage} from "../view/letter-of-credit-amend-view.page";

@Component({
  selector: "letter-of-credit-amend-listing",
  templateUrl: "./letter-of-credit-amend-listing.page.html",
  styleUrls: ["./letter-of-credit-amend-listing.page.scss"],
  providers: [TranslatePipe]
})
export class LetterOfCreditAmendListingPage implements OnDestroy, BaseTransaction {
  // @ViewChild("sliding", { static: false }) beneficiaryNamesliding;
  @ViewChild("dynamicList", { static: false }) dynamicList;
  @ViewChild(AnimateItemsDirective, { static: false }) animateDirective: AnimateItemsDirective;
  @ViewChildren("sliding") sliding: QueryList<ElementRef>;
  @ViewChild("contentBox", { static: false }) contentBox: ElementRef;
  multiSelectionMode;
  dataItemList: any[] = [];
  loadMoreEvent;
  dataItemList$;
  unsub$ = new Subject();
  CONSTANTS = {
    UI_STATUS: "/trade/letterOfCreditService/private/getStatusFilters"
  };
  constructor(
    public listingService: ListingService,
    public transactionService: TransactionCommonService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private helpPageSrv: HelpPageService,
    private translate: TranslatePipe
  ) {
    console.log("Letter of Credit amend constructor");
  }

  checkForCurrenctEntity() {
    return this.listingService.selectedTab.entityName === "LETTEROFCREDITAMEND";
  }

  ionViewDidEnter() {
    this.dataItemList$ = this.listingService.dataItemList$
      .pipe(takeUntil(this.unsub$)).subscribe((val) => {
        if (this.checkForCurrenctEntity()) {
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

    this.listingService.modifyFilters$
        .pipe(takeUntil(this.unsub$))
        .subscribe((filters: Filter[]) => {
          if (!this.checkForCurrenctEntity() && filters == null) {
            return;
          }
          console.log("Filters", filters);

          const listingType = this.transactionService.getListTypeForUiStatusFilter(this.listingService.currentListType.key);
          const data = {
            dataMap: {
              listingType,
              entityName: this.listingService.selectedTab.entityName
            }
          };
          this.listingService.getFilterDropdownOptions(this.CONSTANTS.UI_STATUS, data)
              .pipe(takeUntil(this.unsub$))
              .subscribe(statusData => {
                filters.map(filter => {
                  if (filter.type === "select" && filter.name === "uiLastAction") {
                    filter.options = statusData.dataList;
                  }
                });
                this.listingService.setFilters(filters);
              });
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
        lcNo: element["LC Number"],
        beneficiaryName: element.Beneficiary,
        transactionStatus: element.Status,
        applicantName: element.Applicant,
        valueDate: element["Transaction Date"],
        cancelReason: element["Decline Reason"],
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
      this.router.navigate(["/menu/import-trade/view/letterofcreditamend", item.id]);
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
      // this.transactionService.view(item.id);
      this.transactionService.viewInModal(item.id, LetterOfCreditAmendViewPage);
      // this.router.navigate(["menu", "import-trade", "view", "letterofcreditamend", item.id]);
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
      name: 'beneficiaryName',
      text: this.translate.transform("lbl_beneficiary_name")
    }, {
      name: 'valueDate',
      text: this.translate.transform("lbl_txn_date")
    }, /*{
        name: 'cancelReason',
        text: this.translate.transform("lbl_cancel_reason")
      }, */{
      name: 'lcNo',
      text: this.translate.transform("lbl_lc_no")
    }, {
      name: 'applicantName',
      text: this.translate.transform("lbl_applicant_name")
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
