import { Component, OnInit, OnDestroy, ViewChild, ElementRef, QueryList, ViewChildren } from "@angular/core";
import { AngularAjaxService } from 'src/app/services/aps-services/ajaxService/angular-ajax.service';
import { MenuController } from '@ionic/angular';
import { appConstants } from 'src/app/appConstants';
import { DatePipe } from '@angular/common';
import { CurrencyFormatPipe } from 'src/app/components/pipes/currency-format-pipe.pipe';
import { TransactionEnquiryService } from './transaction-enquiry.service';
import * as _ from 'lodash';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { ListingService } from 'src/app/listing/listing.service';
import { TradeTransactionService } from '../transactions';
import { ObjTransferService } from 'src/app/services/aps-services/obj-transfer.service';
import { LoginService } from 'src/app/login/login-service';
import {TransactionDataListMapping, TxnEnquiryType} from './TransactionDataListMapping';
import { HelpPageService } from 'src/app/components/help-page/help-page.service';
import { TranslatePipe } from '@ngx-translate/core';
import {ToastService} from "../../../../services/aps-services/toast-service";
export const transactions = [
  {
    entityName: 'LETTEROFCREDIT',
    viewUrl: 'letterofcredit',
    serviceUrl: "trade/letterOfCreditService",
    summaryKey: 'LETTEROFCREDITSUMMARYVIEW',
    logKey: 'LETTEROFCREDITLOGVIEW'
  },
  {
    entityName: 'LETTEROFCREDITAMEND',
    viewUrl: 'letterofcreditamend',
    serviceUrl: "trade/letterOfCreditAmendService",
    summaryKey: 'LETTEROFCREDITAMENDREVIEWSUMMARY',
    logKey: 'LETTEROFCREDITAMENDLOGVIEW'
  },
  {
    entityName: 'SHIPPINGGUARANTEE',
    viewUrl: 'shippingguarantee',
    serviceUrl: "trade/shippingGuaranteeService",
    summaryKey: 'SHIPPINGGUARANTEEREVIEWSUMMARY',
    logKey: 'SHIPPINGGUARANTEELOGVIEW'
  },
  {
    entityName: 'TRADEBILLACCEPTANCE',
    viewUrl: 'tradebillacceptance',
    serviceUrl: "trade/billAcceptanceService",
    summaryKey: 'TRADEBILLACCEPTANCEREVIEWSUMMARY',
    logKey: 'TRADEBILLACCEPTANCELOGVIEW'
  },
  {
    entityName: 'TRADEBILLPAYMENTREQUEST',
    viewUrl: 'tradebillpaymentrequest',
    serviceUrl: "trade/tradeBillPaymentService",
    summaryKey: 'TRADEBILLPAYMENTREQUESTREVIEWSUMMARY',
    logKey: 'TRADEBILLPAYMENTREQUESTLOGVIEW'
  },
  {
    entityName: 'IMPORTREQUESTFINANCE',
    viewUrl: 'importrequestfinance',
    serviceUrl: "trade/importRequestFinanceService",
    summaryKey: 'IMPORTREQUESTFINANCEREVIEWSUMMARY',
    logKey: 'IMPORTREQUESTFINANCELOGVIEW'
  },
  {
    entityName: 'OTT',
    viewUrl: 'ott',
    serviceUrl: "ottPaymentService",
    summaryKey: 'OTTREVIEWSUMMARY',
    logKey: 'OTTLOGVIEW'
  },
  {
    entityName: 'BANKGUARANTEE',
    viewUrl: 'bankguarantee',
    serviceUrl: "trade/bankGuaranteeService",
    summaryKey: 'BANKGUARANTEEREVIEWSUMMARY',
    logKey: 'BANKGUARANTEELOGVIEW'
  },
  {
    entityName: 'BANKGUARANTEEAMEND',
    viewUrl: 'bankguaranteeamend',
    serviceUrl: "trade/bgAmendService",
    summaryKey: 'BANKGUARANTEEAMENDREVIEWSUMMARY',
    logKey: 'BANKGUARANTEEAMENDLOGVIEW'
  },
  {
    entityName: 'LETTEROFCREDITACCEPTANCE',
    viewUrl: 'letterofcreditacceptance',
    serviceUrl: "trade/lcAcceptanceService",
    summaryKey: 'LETTEROFCREDITACCEPTANCEREVIEWSUMMARY',
    logKey: 'LETTEROFCREDITACCEPTANCELOGVIEW'
  },
  {
    entityName: 'TRADEBILLPRESENTMENT',
    viewUrl: 'tradebillpresentment',
    serviceUrl: "trade/billPresentmentService",
    summaryKey: 'TRADEBILLPRESENTMENTREVIEWSUMMARY',
    logKey: 'TRADEBILLPRESENTMENTLOGVIEW'
  },
  {
    entityName: 'EXPORTREQUESTFINANCE',
    viewUrl: 'exportrequestfinance',
    serviceUrl: "trade/exportRequestFinanceService",
    summaryKey: 'EXPORTREQUESTFINANCEREVIEWSUMMARY',
    logKey: 'EXPORTREQUESTFINANCELOGVIEW'
  }
];

@Component({
  selector: "app-transaction-enquiry",
  templateUrl: "./transaction-enquiry.page.html",
  styleUrls: ["./transaction-enquiry.page.scss"],
})
export class TransactionEnquiryPage implements OnInit, OnDestroy {

  @ViewChildren("sliding") sliding;
  @ViewChild("dynamicList", { static: false }) dynamicList;
  @ViewChild('contentBox', { static: false}) contentBox: ElementRef;

  filters: any[] = [{
    displayName: "Product",
    name: "product",
    type: 'select',
    url: 'trade/transactionEnquiry/private/getAllProducts',
    onChangeEvent: true,
    mandatory: true
  }];

  selectedProduct;
  dataItemList: any[] = [];
  loadMoreEvent;
  listingState;
  refreshTargetEvent;
  transactionsPage;
  unsub$ = new Subject();
  queryRequestData: any = {};
  loginType;
  listHeaderMapping;
  pageTitle;
  constructor(private menu: MenuController,
              private datePipe: DatePipe,
              private amountPipe: CurrencyFormatPipe,
              private transEnquirySrv: TransactionEnquiryService,
              private router: Router,
              private listingSrv: ListingService,
              private tradeTransSrv: TradeTransactionService,
              private objTransSrv: ObjTransferService,
              private loginSrv: LoginService,
              private route: ActivatedRoute,
              private translatePipe: TranslatePipe,
              private tostSrv: ToastService,
              private helpPageSrv: HelpPageService) {
      const stateData = this.objTransSrv.getObjData("state");
      console.log('stateData ', stateData);
      this.pageTitle = stateData.page.displayName;
  }

  ngOnDestroy() {
    this.unsub$.next();
    this.unsub$.complete();
    this.unsub$.unsubscribe();
  }


  ngOnInit() {
    this.transEnquirySrv.resetEnquiryData();
    this.filters.splice(1, this.filters.length - 1);
    this.filters[0].value = undefined;
    this.dataItemList = [];
    this.transEnquirySrv.listingState$
      .pipe(takeUntil(this.unsub$)).subscribe(state => {
        this.listingState = state;
        if (this.listingState !== 'loading' && this.listingState !== 'scroll' && this.refreshTargetEvent) {
          this.refreshTargetEvent.target.complete();
        }
        if (this.listingState === 'notFound' || this.listingState === 'error') {
          this.menu.close('filterMenuId');
        }
    });

    this.transEnquirySrv.dataItemList$
    .pipe(takeUntil(this.unsub$)).subscribe((val) => {
        if (this.loadMoreEvent) {
          this.loadMoreEvent.target.complete();
          this.loadMoreEvent.target.disabled = this.transEnquirySrv.isLastPage;
        }
        if (val && this.transEnquirySrv.selectedEntityName) {
          this.selectedProduct = this.transEnquirySrv.selectedEntityName;
          const selectedIndex = _.findIndex(transactions , ['entityName', this.selectedProduct]);
          this.listingSrv.selectedTab = transactions[selectedIndex];
          this.dataItemList = val;
          this.queryRequestData.pageNumber = this.transEnquirySrv.currentPageNo;
          this.parseViewData();
        }
    });

    this.loginSrv.tradeLoginType$
    .pipe(takeUntil(this.unsub$)).subscribe((val) => {
      if (val) {
        this.loginType = val;
      }
    });

    if (this.filters[0].name === 'product') {
      this.transEnquirySrv.getfiltersOption(this.filters[0].url, {}).subscribe(value => {
          this.filters[0].options = value.dataList;
      });
    }
    this.showFilter();
  }

  ionViewDidEnter() {
  }

  showFilter() {
    this.menu.open('filterMenuId');
  }

  onChangeSelectFilter(selectedFilter: any) {
    if (selectedFilter.name === 'product' && selectedFilter.value && selectedFilter.value.id) {
      this.selectedProduct = selectedFilter.value.id;
      this.transEnquirySrv.resetEnquiryData();
      this.getFilters(selectedFilter.value.id);
    }
  }

  getFilters(product) {
    const data = {
      dataMap: {
        entityName: product
      }
    };
    this.transEnquirySrv.getFilters(data).subscribe(value => {
      this.filters.splice(1, this.filters.length - 1);
      this.addFilters(value.genericFilterAttributes);
  });
  }

  addFilters(genericFilters) {
    for (const obj of genericFilters) {
      if (obj.rangeFilter) {
        obj.childFilters = [
          {
            name: obj.name + "Start",
            displayName: "Start " + obj.displayName,
            type: obj.type,
            rangeFilter: obj.rangeFilter
          },
          {
            name: obj.name + "End",
            displayName: "End " + obj.displayName,
            type: obj.type,
            rangeFilter: obj.rangeFilter
          }
        ];
      }
      obj.urlData = {};
      if (obj.fieldType === "select" && (obj.url.includes("getApplicableCurrency"))) {
        obj.urlData = {
            dataMap: {
              entityKey: this.selectedProduct
            }
        };
      }
      if (obj.fieldType === 'radio') {
        obj._type = obj.type;
        obj.type = obj.fieldType;
      }
      if (obj.fieldType === 'select') {
        obj._type = obj.type;
        obj.type = 'select';
        this.transEnquirySrv.getfiltersOption(obj.url, obj.urlData)
          .subscribe(value => {
            obj.options = value.dataList;
        });
      }
    }
    this.filters.push(...genericFilters);
  }

  applyFilter(currentFilters) {
    this.transEnquirySrv.resetEnquiryData();
    // console.log(currentFilters);
    this.queryRequestData = {
        pageNumber: 1,
        entityName: this.selectedProduct,
        filters: []
    };
    this.queryRequestData.filters = this.massageFiltersRequest(currentFilters);
    // console.log(this.queryRequestData);
    this.transEnquirySrv.getQueryResult(this.queryRequestData);
  }

  massageFiltersRequest(requestfilters) {
    const filters = [];
    for (const filter of requestfilters) {
      if (filter.type === 'select' && filter.name === 'product') {
        continue;
      } else if (filter.type === 'Date') {
        filter.value = this.datePipe.transform(filter.value, appConstants.requestDateFormat);
      } else if (filter.type === 'select') {
        filter.type = filter._type;
        filter.value = filter.value.id;
      } else if (filter.type === 'number' && filter.rangeFilter) {
        filter.value = this.amountPipe.transform(filter.value);
      } else if (filter.type === 'radio') {
        filter.type = filter._type;
      }
      if (filter.value !== undefined && filter.value !== null && filter.value !== "") {
        filters.push({
          name: filter.name,
          value: filter.value,
          type: filter.type,
          displayName: filter.displayName
        });
      }
    }
    return filters;
  }

  onActionClicked(arr) {
    const event = arr[0];
    const fun = arr[1];
    const item = arr[2];
    if (event) {
      event.stopPropagation();
    }
    this.dynamicList.closeSlidingItems();
    if (fun.includes("log(")) {
        this.router.navigate(["log", item.id], { relativeTo: this.route });
    } else if (fun.includes("summary(")) {
        this.router.navigate(["summary", item.id], { relativeTo: this.route });
    }
  }

  view(item, event): void {
    if (this.loginType === 'IMPORT') {
      this.router.navigate(["menu", "import-trade", "view", this.listingSrv.selectedTab.viewUrl, item.id]);
    } else if (this.loginType === 'EXPORT') {
      this.router.navigate(["menu", "export-trade", "view", this.listingSrv.selectedTab.viewUrl, item.id]);
    }
  }

doRefresh(event) {
    if (this.queryRequestData && this.queryRequestData.filters && this.queryRequestData.filters.length > 0) {
      this.refreshTargetEvent = event;
      if (this.loadMoreEvent) {
        this.loadMoreEvent.target.disabled = false;
      }
      this.transEnquirySrv.refreshPage(this.queryRequestData);
    } else if (event) {
      event.target.complete();
      this.tostSrv.presentToast("Please Select Filter");
    }
}
loadMoreData(event) {
  if (this.queryRequestData && this.queryRequestData.filters && this.queryRequestData.filters.length > 0) {
    this.loadMoreEvent = event;
    if (this.transEnquirySrv.isLastPage) {
      this.loadMoreEvent.target.complete();
      this.loadMoreEvent.target.disabled = true;
      return;
    }
    this.transEnquirySrv.getNextPage(this.queryRequestData);
  } else if (event) {
    event.target.complete();
    this.tostSrv.presentToast("Please Select Filter");
  }
}
parseViewData() {
  this.listHeaderMapping = new TransactionDataListMapping(this.selectedProduct, TxnEnquiryType.ENQUIRY, this.translatePipe);
  // this.transEnquirySrv.headers
  // this.listHeaderMapping.setListingHeaders(element, item);
  /*const dataItems = [];
  if (this.dataItemList == null) {
    return;
  }
  this.listHeaderMapping = new TransactionDataListMapping(this.selectedProduct, 'enquiry', this.translatePipe);
  for (const element of this.dataItemList) {
    const item: any = {};
    item.id = element.id;
    item.actions = element.actions;
    item.currency = element.Currency;
    item.amount = element.Amount;
    this.listHeaderMapping.setListingHeaders(element, item);

    dataItems.push(item);
  }
  this.dataItemList = dataItems;*/
  // console.log("pass", this.dataItemList);
  this.menu.close('filterMenuId');
}

  showHelpPage() {

    const labelArray = this.listHeaderMapping.getHelpPageLabels(this.transEnquirySrv.headers);
    this.helpPageSrv.showHelpPage({
      labelArray,
      elArray: this.sliding.toArray(),
      elParent: this.contentBox
    });
  }
}
