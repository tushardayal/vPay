import {Injectable} from '@angular/core';
import {AngularAjaxService} from 'src/app/services/aps-services/ajaxService/angular-ajax.service';
import {BehaviorSubject, of} from 'rxjs';
import {catchError} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TransactionEnquiryService {

  CONSTANTS = {
    FILTERS_URL : "trade/transactionEnquiry/private/getFilters",
    QUERY_URL: "trade/transactionEnquiry/private/getQueryResult",
    SEARCH_ENQUIRY: "trade/searchService/private/searchEnquiry"
  };
  private _dataItemList = new BehaviorSubject<any>(null);
  public dataItemList$ = this._dataItemList.asObservable();

  private _listingState = new BehaviorSubject<any>(null);
  public listingState$ = this._listingState.asObservable();
  isLastPage;
  currentPageNo;
  isNextPageCall;
  selectedEntityName;
  loadMoreEvent;
  private dataItemList = [];
  headers: any[];
  constructor(private ajxService: AngularAjaxService) { }

  resetEnquiryData() {
    this._listingState.next(null);
    this._dataItemList.next(null);
    this.isNextPageCall = false;
    this.selectedEntityName = null;
    this.loadMoreEvent = null;
    this.isLastPage = false;
    this.dataItemList = [];
    this.headers = [];
  }

  getFilters(data) {
    return this.ajxService.sendAjaxRequest(this.CONSTANTS.FILTERS_URL, data);
  }

  searchEnuiry(data) {
    return this.ajxService.sendAjaxRequest(this.CONSTANTS.SEARCH_ENQUIRY, data);
  }

  getfiltersOption(url, data) {
    return this.ajxService.sendAjaxRequest(url, data);
  }

  getQueryResult(data) {

    return this.ajxService.sendAjaxRequest(this.CONSTANTS.QUERY_URL, data)
    .pipe(
      catchError((error) => {
      this._listingState.next('error');
      return of(error);
    }))
    .subscribe(response => {
      if (response) {
        console.log(response.totalPages);
        this.selectedEntityName = response.entityName;
        const dataList: [] = response.dataList;
        if (response.totalPages === data.pageNumber) {
          this.isLastPage = true;
        }

        if (dataList && dataList.length > 0) {
          this.parseDataListHeader(dataList, response, this.dataItemList);
          this.currentPageNo = response.pageNumber;
          console.log('##New ## ', this.dataItemList);
          this.headers = response.headers;
          this._dataItemList.next(this.dataItemList);
          if (this.isNextPageCall) {
            this.isNextPageCall = false;
          } else {
            this._listingState.next('success');
          }
        } else {
          this._listingState.next('notFound');
        }
      }
    });
  }


  parseDataListHeader(dataList, response, dataItemList) {
    const validHeaders: any = {};
    dataList.forEach((value , i) => {
      const dataItem: any = {};
      // tslint:disable-next-line: forin
      for (const index in response.headers) {
        const methodName = response.headers[index].methodName ? response.headers[index].methodName : response.headers[index].displayName;
        validHeaders[methodName] = index;
        dataItem[methodName] = value[index];
      }
      dataItem.links = [];
      dataItem.selected = false;
      if (response.links[i]) {
        this.setActions(dataItem, response.links[i]);
      }
      dataItemList.push(dataItem);
    });
  }

  setActions(dataItem, links) {
      if (dataItem.links.length <= 0) {
          dataItem.links = links;
          dataItem.actions = this.getLinksDisplayName(
            dataItem, dataItem.links
          );
    }
  }

  getLinksDisplayName(listItem, array) {
    const returnArray = [];
    for (const item of array) {
      let temp: any = {};
      if (item.onClick != null) {
        if (item.onClick.includes('log(')) {
          temp = {icon: 'receipt-outline', displayName: item.displayName, onClick: item.onClick};
        } else if (item.onClick.includes('summary(')) {
          temp = {icon: 'reader-outline', displayName: item.displayName, onClick: item.onClick};
        } else if (item.onClick.includes('view(')) {
          listItem.id = item.onClick.split("'")[1].split(',')[0];
        }
        if (temp.icon !== undefined) {
          returnArray.push(temp);
        }
      }
    }
    return returnArray;
  }

  refreshPage(queryData: any) {
    this.dataItemList = [];
    queryData.pageNumber = 1;
    this.isLastPage = false;
    this.getQueryResult(queryData);
  }

  getNextPage(queryData) {
    queryData.pageNumber += 1;
    this.isNextPageCall = true;
    this.getQueryResult(queryData);
  }
}
