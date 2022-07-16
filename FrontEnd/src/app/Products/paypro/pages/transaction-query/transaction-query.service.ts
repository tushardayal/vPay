import {Injectable} from '@angular/core';
import {AngularAjaxService} from "../../../../services/aps-services/ajaxService/angular-ajax.service";
import {BehaviorSubject, of, Subject} from "rxjs";
import {GeneralService} from "../../../../services/general.service";
import {map} from "rxjs/operators";
import {appConstants} from "../../../../appConstants";
import {ToastService} from "../../../../services/aps-services/toast-service";

@Injectable()
export class TransactionQueryService {
    CONSTANTS = {
        /*GET_GENERAL_API: 'paypro/generalService/private/getValueByType',
        GET_MODULES_TYPE: '2450',*/
        GET_FILTER: 'paypro/transactionEnquiry/private/getFilters',
    };

    billPaymentResponseData$: BehaviorSubject<any> = new BehaviorSubject(null);
    paymentTxnQueryResponseData$: BehaviorSubject<any> = new BehaviorSubject(null);
    lpoppTxnQueryResponseData$: BehaviorSubject<any> = new BehaviorSubject(null);
    isLastPage;
    dataItemList: any = [];
    currentPageNo;
    selectedProduct$: BehaviorSubject<any> = new BehaviorSubject(null);
    clickedHelp$: Subject<any> = new Subject();

    pagination: any;

    // productsObj: any[];
    constructor(private ajxService: AngularAjaxService,
                private toastSrv: ToastService,
                private genralService: GeneralService) {
        this.selectedProduct$.subscribe(a => {
            this.isLastPage = false;
        });
    }

    /*getModules() {
        this.ajxService.sendAjaxRequest(this.CONSTANTS.GET_GENERAL_API, this.genralService.typeFilterData(this.CONSTANTS.GET_MODULES_TYPE))
            .subscribe((response) => {
                    this.productsObj = response.dataList;
                });
    }*/

    getDataFromServer(currentFilter: any, selectedTab: any) {
        this.pagination = {};
        let data;
        this.isLastPage = false;

        selectedTab = JSON.parse(JSON.stringify(selectedTab));
        const lpoppFilter = currentFilter.filter(a => a.name === 'product' && a.value === 'LPOPPREQUEST');
        if (selectedTab.entityName === "INSTRUMENTQUERYREQUEST" && lpoppFilter.length > 0) {
            const entityName = lpoppFilter[0].value;
            selectedTab.ajaxUrl = 'paypro/transactionEnquiry/private/getQueryResult';
            const filters = currentFilter.filter(a => a.name !== 'product');
            data = {
                pageNumber: 1,
                entityName,
                filters
            };
        } else {
            data = {
                pageNumber: 1,
                entityName: selectedTab.entityName,
                filters: currentFilter
            };
        }
        this.pagination.data = data;
        this.pagination.ajaxUrl = selectedTab.ajaxUrl;
        this.getData(this.pagination);
    }

    getNextPage() {
        this.pagination.data.pageNumber = this.pagination.data.pageNumber + 1;
        return of(this.getData(this.pagination));
    }

    getFiltersForProduct(selectedProduct) {
        const data = {dataMap: {entityName: selectedProduct}};
        return this.ajxService.sendAjaxRequest(this.CONSTANTS.GET_FILTER, data)
            .pipe(map(response => response.genericFilterAttributes));
    }

    helpPageClick() {
        if (!this.selectedProduct$.getValue() || this.selectedProduct$.getValue() === "INSTRUMENTQUERY") {
            this.toastSrv.presentToast('Please Select Filter');
            return;
        }
        this.clickedHelp$.next(this.selectedProduct$.getValue());
    }

    private getData(pagination) {
        if (this.isLastPage) {
            return;
        }
        this.ajxService.sendAjaxRequest(pagination.ajaxUrl, pagination.data).subscribe((response: any) => {

            const dataList: [] = response.dataList;
            if (response.totalPages === this.currentPageNo) {
                this.isLastPage = true;
            }
            const validHeaders: any = {};
            this.dataItemList = [];

            console.log("this.dataItemList", this.dataItemList);
            if (dataList && dataList.length > 0) {
                const useMethodName = appConstants.USE_METHODNAME_IN_LISTING.includes(response.entityName);
                dataList.forEach(value => {
                    const dataItem: any = {};
                    // tslint:disable-next-line: forin
                    for (const index in response.headers) {
                        // tslint:disable-next-line:max-line-length
                        const displayName = useMethodName && response.headers[index].methodName ? response.headers[index].methodName : response.headers[index].displayName;
                        // const displayName = response.headers[index].displayName;
                        validHeaders[displayName] = index;
                        dataItem[displayName] = value[index];
                    }
                    dataItem.links = [];
                    dataItem.selected = false;
                    this.dataItemList.push(dataItem);
                });
                this.currentPageNo = response.pageNumber;
            }

            switch (this.selectedProduct$.value) {
                case "PAYMENTREQUEST":
                    this.paymentTxnQueryResponseData$.next(this.dataItemList);
                    break;
                case "LPOPPREQUEST":
                    this.lpoppTxnQueryResponseData$.next(this.dataItemList);
                    break;
                case "BILLPAYMENTHISTORY":
                    this.billPaymentResponseData$.next(this.dataItemList);
                    break;
            }
            /* if (selectedTab.entityName === "INSTRUMENTQUERYREQUEST") {
                 if (response.entityName === "LPOPPREQUEST") {
                     console.log('LPOPPREQUEST', this.dataItemList);
                     this.lpoppTxnQueryResponseData$.next(this.dataItemList);
                 } else {
                     this.paymentTxnQueryResponseData$.next(this.dataItemList);
                 }
             } else {
                 this.billPaymentResponseData$.next(this.dataItemList);
             }*/
        });
    }
}
