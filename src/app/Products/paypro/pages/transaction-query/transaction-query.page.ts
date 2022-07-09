import {AfterViewInit, Component, OnInit, ViewChild} from "@angular/core";
import {TransactionQueryService} from "./transaction-query.service";
import {MenuController} from "@ionic/angular";
import {AngularAjaxService} from "../../../../services/aps-services/ajaxService/angular-ajax.service";
import {
  paymentProductFilter,
  paymentTransactionQueryFilter,
  PaymentTransactionQueryPage,
} from "./payment-transaction-query/payment-transaction-query.page";
import {billPaymentHistoryFilter, BillPaymentHistoryPage,} from "./bill-payment-history/bill-payment-history.page";
import * as _ from "lodash";
import {DatePipe} from "@angular/common";
import {ObjTransferService} from "src/app/services/aps-services/obj-transfer.service";
import {ToastService} from "src/app/services/aps-services/toast-service";
import {ListingService} from 'src/app/listing/listing.service';
import {SuperTabChangeEventDetail} from '@ionic-super-tabs/core';
import {GeneralService} from "../../../../services/general.service";
import {PayproTransactionQueryComponent} from "./paypro-transaction-query/paypro-transaction-query.component";

@Component({
  selector: "app-transaction-query",
  templateUrl: "./transaction-query.page.html",
  styleUrls: ["./transaction-query.page.scss"],
})
export class TransactionQueryPage implements OnInit, AfterViewInit {

  tabsArray: any[];
  selectedTab;
  filters: any[];
  activeTabIndex: number;
  selectedTabDetails: any;
  filtersMap = [
    {
      entityName: "INSTRUMENTQUERYREQUEST",
      url: "payment-transaction-query",
      filters: JSON.parse(JSON.stringify(paymentProductFilter)),
      page: PayproTransactionQueryComponent,
      ajaxUrl: "paypro/transactionQuery/private/getQueryResult",
    },
    {
      entityName: "BILLPAYMENTHISTORY",
      url: "bill-payment-history",
      filters: JSON.parse(JSON.stringify(billPaymentHistoryFilter)) ,
      page: BillPaymentHistoryPage,
      ajaxUrl: "billPaymentHistoryService/private/getAuthorizedList",
    },
  ];

  constructor(
    private transactionService: TransactionQueryService,
    private menu: MenuController,
    private ajxService: AngularAjaxService,
    private datePipe: DatePipe,
    private objTransSrv: ObjTransferService,
    private tostSrv: ToastService,
    private generalService: GeneralService,
    private listingService: ListingService,
  ) {}

  ngOnInit() {
    const stateData = this.objTransSrv.getObjData("state");

    const tabs = stateData.page.menus ? stateData.page.menus : [];

    for (const tab of tabs) {
      const paytab: any = _.find(this.filtersMap, ["url", tab.url]);
      tab.page = paytab.page;
    }
    this.activeTabIndex = 0;
    this.tabsArray = tabs;
    if(this.tabsArray.length > 0) {
      this.selectedTab = this.tabsArray[0].url;
    }
    this.filters = [];

    //
  }
  ngAfterViewInit() {
    if (this.tabsArray.length > 0) {
      this.showFilter();
    }
  }

  ionViewWillEnter() {
    // this.menu.enable(false, 'filterMenuId'); /*comment this line due to getting debugger issue*/
  }


  onTabChange(ev: CustomEvent<SuperTabChangeEventDetail>) {
        if (ev.detail.changed) {
            this.activeTabIndex = ev.detail.index;
            this.selectedTab = this.tabsArray[this.activeTabIndex].url;
            this.transactionService.selectedProduct$.next(this.tabsArray[this.activeTabIndex].entityName);
            this.showFilter();
        }
    }
  showFilter() {
    let filters = _.find(this.filtersMap, ["url", this.selectedTab]).filters;
    this.filters = [];
    this.getDataForSelectFilters(filters);
    this.menu.open("filterMenuId");
  }

  getDataForSelectFilters(filters) {
    for (const filter of filters) {
        this.filters.push(filter);
        if (filter.type === "select") {
          const reqData = filter.reqData ? filter.reqData : {};
          this.ajxService.sendAjaxRequest(filter.url, reqData).subscribe((value) => {
            filter.options = value.dataList;
          });
        }
    }
  }
  onChangeSelectFilter(selectedFilter: any) {

    // this.transactionService.selectedProduct = selectedFilter.value.id;
    if (selectedFilter.name === 'product' && selectedFilter.value && selectedFilter.value.id === 'PAYMENTREQUEST') {
      this.filters.splice(1, this.filters.length - 1);
      this.transactionService.selectedProduct$.next(selectedFilter.value.id);

      // this.selectedProduct = selectedFilter.value.id;
      // this.tabsArray[this.activeTabIndex].page.resetEnquiryData(); TODO : clear data if needed
      // this.filters.splice(1, this.filters.length - 1);
      // let filters = filters.push(...paymentTransactionQueryFilter);
      let filters = paymentTransactionQueryFilter;
      this.getDataForSelectFilters(filters);
    } else if (selectedFilter.name === 'product' && selectedFilter.value && selectedFilter.value.id === 'LPOPPREQUEST') {
      this.filters.splice(1, this.filters.length - 1);
      this.transactionService.selectedProduct$.next(selectedFilter.value.id);
      this.transactionService.getFiltersForProduct(selectedFilter.value.id)
          .subscribe(filterList => {
            for (const filter of filterList) {
              if (filter.fieldType === "select" && filter.url.includes("getApplicableCurrency")) {
                filter.urlData = {dataMap: {entityKey: selectedFilter.value.id}};
              }
            }
            this.filters.push(...this.generalService.addFilters(filterList));
          });
    }
  }


  applyFilter(currentFilter) {
    if (!this.checkForRequireFilter(currentFilter)) {
      return;
    }

    this.massageFilterData(currentFilter);
    this.menu.enable(true, "filterMenuId");
    this.menu.close("filterMenuId");
  }

  checkForRequireFilter(currentFilter) {
    if (this.selectedTab === "bill-payment-history") {
      return this.validateBillHisotryFilter(currentFilter);
    } else {
      if (currentFilter.some(a => a.name == 'product' && a.value.id === 'LPOPPREQUEST')) {
        const otherFilters = currentFilter.filter(a => a.name != 'product');
        if (!otherFilters.length) {
          this.tostSrv.presentToast("Enter atleast one filter");
        }
        return otherFilters.length;
      }
      return this.validatePaymentTransactionQueryFilter(currentFilter);
    }
  }

  validatePaymentTransactionQueryFilter(currentFilter: any[]) {
    let minFiltersAvaliable = false;
    const batchNo = _.filter(currentFilter, ["name", "BatchNo"]).length;
    const activationStartDate = _.filter(currentFilter, [
      "name",
      "ActivationStartDate",
    ]).length;
    const activationEndDate = _.filter(currentFilter, [
      "name",
      "ActivationEndDate",
    ]).length;
    const startAmount = _.filter(currentFilter, ["name", "StartAmount"]).length;
    const endAmount = _.filter(currentFilter, ["name", "EndAmount"]).length;

    if (
      batchNo ||
      (activationStartDate && activationEndDate) ||
      (startAmount && endAmount)
    ) {
      minFiltersAvaliable = true;
    }
    if (!minFiltersAvaliable) {
      this.tostSrv.presentToast(
        "Enter atleast one filter from Batch no, Value Date and Amount"
      );
      return false;
    }

    return true;
  }

  validateBillHisotryFilter(currentFilter: any[]) {
    let minFilters = false;
    const transactionReferenceNo = _.filter(currentFilter, [
      "name",
      "batchNo",
    ]).length;
    const billFromDate = _.filter(currentFilter, ["name", "billFromDate"])
      .length;
    const billToDate = _.filter(currentFilter, ["name", "billToDate"]).length;

    if (transactionReferenceNo || (billFromDate && billToDate)) {
      minFilters = true;
    }
    if (!minFilters) {
      this.tostSrv.presentToast(
        "Enter atleast one filter from Bill Start And End Date, Trasaction ID"
      );
      return false;
    }

    return true;
  }

  massageFilterData(currentFilter: any[]) {
    const requestFilters: any[] = [];

    for (const filter of currentFilter) {
      if (filter.type === "select") {
        filter.type = "String";
        filter.value = filter.value ? filter.value.id : filter.value;
        requestFilters.push({
          name: filter.name,
          type: "String",
          value: filter.value,
        });
      } else if (filter.rangeFilter === true && filter.childFilters) {
        for (const childFilter of filter.childFilters) {
          requestFilters.push({
            name: childFilter.name,
            type:
              filter.type !== "Date" && filter.type !== "String"
                ? "String"
                : filter.type,
            value:
              filter.type === "Date"
                ? this.datePipe.transform(childFilter.value, "dd-MMM-yyyy")
                : childFilter.value,
          });
        }
      } else if (filter.type === "amount") {
        requestFilters.push({
          name: filter.name,
          type: "String",
          value: filter.value.toString().replace(/,/g, ""),
        });
      }  else if (filter.type === "Amount") {
        requestFilters.push({
          name: filter.name,
          type: filter.type,
          value: filter.value.toString().replace(/,/g, ""),
        });
      } else if (filter.type === "Date") {
        requestFilters.push({
          name: filter.name,
          type: "String",
          value:
            filter.type === "Date"
              ? this.datePipe.transform(filter.value, "dd-MMM-yyyy")
              : filter.value,
        });
      } else {
        requestFilters.push({
          name: filter.name,
          type: "String",
          value: filter.value,
        });
      }
    }
    for (const filter of this.filtersMap) {
      if (this.selectedTab === filter.url) {
        this.selectedTabDetails = filter;
        break;
      }
    }

    this.transactionService.getDataFromServer(
      requestFilters,
      this.selectedTabDetails
    );
  }

  showHelpPage() {
    this.transactionService.helpPageClick();
  }
}
