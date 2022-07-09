import { Component, ViewChild, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChildren, QueryList } from "@angular/core";
import { ListingService } from "src/app/listing/listing.service";
import { Router, ActivatedRoute } from "@angular/router";
import * as _ from "lodash";
import { TransactionCommonService } from "../../../../../transaction-common.service";
import { BulkPaymentDetailsEnity } from "./bulk-payment-details-enitity";
import { Observable, Subscription, Subject } from "rxjs";
import { AuthorizeRejectListingBtnComponent } from "src/app/directives/authorize-reject-listing-btn/authorize-reject-listing-btn.component";
import { BaseTransaction } from "../../../../../interfacaes/base-transaction";
import { ObjTransferService } from "src/app/services/aps-services/obj-transfer.service";
import { takeUntil } from 'rxjs/operators';
import { HelpPageService } from "src/app/components/help-page/help-page.service";
import { TranslatePipe } from "@ngx-translate/core";
import {BulkPaymentViewPage} from "../view/bulk-payment-view.page";
@Component({
  selector: "app-bulk-payment-details-listing",
  templateUrl: "./bulk-payment-details-listing.page.html",
  styleUrls: ["./bulk-payment-details-listing.page.scss"],
    providers: [TranslatePipe]
})
export class BulkPaymentDetailsListingPage implements OnInit, OnDestroy, BaseTransaction {
  @ViewChild(AuthorizeRejectListingBtnComponent, { static: false })
  listActionBtns: AuthorizeRejectListingBtnComponent;
  @ViewChild("dynamicList", { static: false }) dynamicList;
  @ViewChildren("sliding") sliding: QueryList<ElementRef>;
 @ViewChild("contentBox", { static: false }) contentBox: ElementRef;

  menuEntity = BulkPaymentDetailsEnity;
  multiSelectionMode;
  dataItemList: any[];
  avaliableLists;
  selectedListType;
  requestBatchId;
  selectedBatch: any = {};
  refreshTargetEvent;
  loadMoreEvent;
  dataItemList$: Subscription;
  listingState;
  multiSelectMode: Observable<boolean>;
  private unsub$ = new Subject<any>();
  id;
  constructor(
    private listingService: ListingService,
    public transactionService: TransactionCommonService,
    private router: Router,
    private activeRoute: ActivatedRoute,
    private objTransfSrv: ObjTransferService,
    private helpPageSrv: HelpPageService,
    private translate: TranslatePipe
  ) {
    console.log("bulk constructor");
    /*activeRoute.paramMap
    .pipe(takeUntil(this.unsub$))
    .subscribe((val) => {
      this.requestBatchId = val.get("id");
    });*/
    this.setListData(this.listingService.currentListType.key);
    this.selectedBatch = this.objTransfSrv.getObjData("bulkBatchData");
    // this.objTransfSrv.removeObj('bulkBatchData');
  }

  ngOnInit() {
    this.requestBatchId = this.id;
    const filters = [
      {
        name: "requestBatchId",
        value: this.requestBatchId,
        type: "String",
      },
    ];
    this.listingService.defaultCurrentfilter.push({
      name: "requestBatchId",
      value: this.requestBatchId,
      type: "String",
    });
    this.listingService.refreshTab(filters);
    this.listingService.listingState$
    .pipe(takeUntil(this.unsub$))
    .subscribe((state) => {
        this.listingState = state;
        if (this.listingState !== 'loading' && this.refreshTargetEvent) {
          try {
            this.refreshTargetEvent.target.complete();
          } catch (e) {
            console.log(e);
          }
        }
    });
  }

  ionViewDidEnter() {
    this.listActionBtns.createListType(
      this.selectedListType,
      this.avaliableLists
    );
    console.log('ionViewDidEnter');
    this.dataItemList$ = this.listingService.dataItemList$
    .pipe(takeUntil(this.unsub$))
    .subscribe((val) => {
      if (
        this.listingService.selectedTab.entityName ===
        "BBULKPAYMENTREQUESTDETAILS"
      ) {
        if (this.loadMoreEvent) {
          this.loadMoreEvent.target.complete();
          this.loadMoreEvent.target.disabled = this.listingService.isLastPage;
        }
        this.dataItemList = val;
        if (this.dataItemList) {
          this.parseViewData();
          if (this.refreshTargetEvent) {
            try {
              this.refreshTargetEvent.target.complete();
            } catch (e) {
              console.log(e);
            }
          }
        }
      }
    });
    this.listingService.multiSelectionMode$
    .pipe(takeUntil(this.unsub$)).subscribe(
      (value) => (this.multiSelectionMode = value)
    );

    this.multiSelectMode = this.listingService.multiSelectionMode$;
    // this.listingService.dataItemList$.subscribe((val) => {
    //   this.dataItemList = val;
    //   this.parseViewData();
    // });
    console.log("item route");
    // this.listingService.multiSelectionMode$.subscribe(
    //   (value) => (this.multiSelectionMode = value)
    // );
  }
  ionViewWillLeave(): void {
    console.log("ionViewWillLeave details");
    if (!this.objTransfSrv.getObjData("isForView")) {
      this.listingService.selectedTab = this.objTransfSrv.getObjData(
        "bulkMenuData"
      ).tabData;
      this.listingService.currentListType = this.objTransfSrv.getObjData(
        "bulkMenuData"
      ).selectedListing;
      this.listingService.defaultCurrentfilter = [];
      this.listingService.refreshTab();
      this.listActionBtns.createListType(
        this.listingService.currentListType,
        this.listingService.selectedTab.menuLinksDetail.link,
      );
      this.dataItemList$.unsubscribe();
      this.objTransfSrv.removeObj('isForView');
      this.objTransfSrv.removeObj('bulkBatchData');
    }
  }
  setListData(type?) {
    this.listingService.selectedTab = this.menuEntity;
    this.avaliableLists = this.menuEntity.menuLinksDetail.link;
    this.selectedListType = _.find(this.avaliableLists, ["key", type]);
    if (this.selectedListType === undefined) {
      this.selectedListType = _.find(this.avaliableLists, [
        "key",
        this.menuEntity.defaultURL,
      ]);
    }
    this.listingService.currentListType = this.selectedListType;
  }

  setSelectedListType(selectedListType) {
    this.selectedListType = selectedListType;
  }
  parseViewData() {
    const dataItems = [];
    if (this.dataItemList == null) {
      return;
    }
    this.dataItemList.forEach((element) => {
      if (this.selectedBatch.isTransactionLevelAuth !== 'Y') {
        element.actions = element.actions.filter(item => {
        if (item.onClick.includes('authorize') || item.onClick.includes('reject')
        || item.onClick.includes('verify') || item.onClick.includes('decline')) {
          return false;
        }
        return true;
        });
      }
      dataItems.push({
        id: element.Id,
        transactionDate: element["Txn Date"],
        valueDate: element["Value Date"],
        debitAccountNo: element["Debit Account No"],
        accountAliasName: element["Account Alias Name"],
        paymentType: element["Payment Type"],
        beneficiaryName: element["Beneficiary Name"],
        beneficiaryBank: element["Beneficiary Bank"],
        beneficiaryAccNo: element["Beneficiary A/c. No."],
        ccy: element.CCY,
        amount: element.Amount,
        amountIn: element["Amount (LCY)"],
        status: element.Status,
        requireVerifier: element.requireVerifier,
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
    } else {
      this.objTransfSrv.setObjData("isForView", true);
      this.transactionService.viewInModal(item.id, BulkPaymentViewPage);
      // this.router.navigate(["/menu/paypro/view/bulkPayment", item.id]);
    }
    console.log("view Id", item.id);
  }

  doRefresh(event) {
    const filters = [
      {
        name: "requestBatchId",
        value: this.requestBatchId,
        type: "String",
      },
    ];
    this.refreshTargetEvent = event;
    this.listingService.refreshTab(filters);
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
    if (this.selectedBatch.isTransactionLevelAuth === 'Y') {
      arr[2].isChildRecord = true;
    }
    this.dynamicList.closeSlidingItems();
    this.transactionService.onActionClicked(arr);
  }
  ngOnDestroy() {
    this.dataItemList$.unsubscribe();
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
      {name: 'amount', text: this.translate.transform("lbl_currency_amount")},
      ];
    this.helpPageSrv.showHelpPage({
      labelArray,
      elArray: this.sliding.toArray(),
      elParent: this.contentBox
    });
  }

}
