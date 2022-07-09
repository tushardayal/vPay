import {Injectable} from "@angular/core";
import {AngularAjaxService} from "../../../../services/aps-services/ajaxService/angular-ajax.service";
import {BehaviorSubject, EMPTY, forkJoin, Observable, of} from "rxjs";
import * as _ from "lodash";
import {catchError, defaultIfEmpty, finalize, map} from "rxjs/operators";
import {AccountStatementService} from '../account-statement/account-statement.service';
import {environment} from 'src/environments/environment';
import {appConstants} from "../../../../appConstants";

@Injectable({
  providedIn: "root",
})
export class AccountSummaryService {
  CONSTANTS = {
    GET_FD_SUMMARY: "accountSummaryService/private/getFDAcctSummary",
    GET_LOAN_SUMMARY: "accountSummaryService/private/getLoanAcctSummary",
    GET_CASA_SUMMARY: "accountSummaryService/private/getCasaAcctSummary",
    GET_EXCHANGERATE: "exchangeRateService/private/getAllExchangeRate",
    GET_CURRENCY: "currencyService/private/getCurrency",
    GET_GROUP_SUMMARY: "accountSummaryService/private/getGroupSummary",
  };

  private tabsArray: any[];
  private _tabsArray: BehaviorSubject<any> = new BehaviorSubject(null);
  tabsArray$ = this._tabsArray.asObservable();

  private _summaryStatus: BehaviorSubject<any> = new BehaviorSubject(null);
  summaryStatus$ = this._summaryStatus.asObservable();

  private fxRateMap: any = {};
  baseCurrencyCode = appConstants.baseCurrencyCode;
  accountsSlideArray = [];
  resultArray: any = [];
  slideIndex: any = 0;
  constructor(private angularAjax: AngularAjaxService,
              private accountStatementSrv: AccountStatementService) {
    console.log("AccountSummaryService constructor");
  }
  refreshSumm(tabIndex, groupData) {
    if (this.accountsSlideArray.length === 0) {
      this.createSummaryTabs(groupData);
      return new Observable(observer => {
        observer.next('refreshDone');
      });
    }
    this._summaryStatus.next('loading');
    let summary;
    if (this.accountsSlideArray[tabIndex].type === "CASA") {
      summary = this.getCasaSumm(groupData);
    }
    if (this.accountsSlideArray[tabIndex].type === "LOAN") {
      summary = this.getLoanSumm(groupData);
    }
    if (this.accountsSlideArray[tabIndex].type === "FD") {
      summary = this.getFDSumm(groupData);
    }
    if (summary) {
      return summary.pipe(
        map((res: any) => {
          res.type = this.resultArray[tabIndex].type;
          this.resultArray[tabIndex] = res;
          this.setTabs(tabIndex);
          this.getTabs(tabIndex);
        }),
        catchError((err) => {
          this._summaryStatus.next('err');
          return of(false);
        }),
        finalize(() => {
          console.log("final");
        })
      );
    }
  }

  setSummaryObjArray(result, summaryType) {
    result.type = summaryType;
    console.log("result1", result);
    if (result.listOfAccountSummary[0].accountGroupSummaryMap.length > 0) {
      this.accountsSlideArray.push({
        displayName:
        result.listOfAccountSummary[0].accountGroupSummaryMap[0].displayName,
        noOfAcc: 0,
        type: summaryType,
      });
    }
    this.resultArray.push(result);
  }
  createSummaryTabs(groupData) {
    this._summaryStatus.next('loading');
    this.accountsSlideArray = [];
    this.slideIndex = 0;
    this.resultArray = [];
    this._tabsArray.next(null);

    const casaSummary = this.getCasaSumm(groupData).pipe(defaultIfEmpty({}));
    const loanSummary = this.getLoanSumm(groupData).pipe(defaultIfEmpty({}));
    const fdSummary = this.getFDSumm(groupData).pipe(defaultIfEmpty({}));
    forkJoin([casaSummary, loanSummary, fdSummary])
    .pipe(catchError((err) => {
      this._summaryStatus.next('err');
      return of(false);
    }))
    .subscribe((results) => {
      this.slideIndex = 0;
      if (results && results[0].listOfAccountSummary && results[0].listOfAccountSummary.length > 0) {
        this.setSummaryObjArray(results[0], "CASA");
        this.setTabs(this.slideIndex);
        this.slideIndex++;
      }
      if (results && results[1].listOfAccountSummary && results[1].listOfAccountSummary.length > 0) {
        this.setSummaryObjArray(results[1], "LOAN");
        this.setTabs(this.slideIndex);
        this.slideIndex++;
      }
      if (results && results[2].listOfAccountSummary && results[2].listOfAccountSummary.length > 0) {
        this.setSummaryObjArray(results[2], "FD");
        this.setTabs(this.slideIndex);
        this.slideIndex++;
      }
      if (this.resultArray.length > 0) {
        // this.getTabs(0);
          this.accountStatementSrv.getFavouriteAccounts();
      } else {
        this._summaryStatus.next('notFound');
      }
    });
  }

  getCasaSumm(groupData?) {
    if (groupData && groupData.accountType !== 'casa') {
      return EMPTY;
    }
    const data = groupData && groupData.accountType ? {dataMap: {...groupData}} : {};
    return this.angularAjax.sendAjaxRequest(
      this.CONSTANTS.GET_CASA_SUMMARY,
      data
    );
  }
  getLoanSumm(groupData) {
    if (groupData && groupData.accountType !== 'loan') {
      return EMPTY;
    }
    const data = groupData && groupData.accountType ? {dataMap: {...groupData}} : {};
    return this.angularAjax.sendAjaxRequest(
        this.CONSTANTS.GET_LOAN_SUMMARY,
        data
    );
  }
  getFDSumm(groupData) {
    if (groupData && groupData.accountType !== 'fd') {
      return EMPTY;
    }
    const data = groupData && groupData.accountType ? {dataMap: {...groupData}} : {};
    return this.angularAjax.sendAjaxRequest(this.CONSTANTS.GET_FD_SUMMARY, data);
  }

  setTabs(tabIndex) {
    this.tabsArray = [];
    const selectedTab = this.resultArray[tabIndex];
    const tempData = _.get(
      selectedTab,
      "listOfAccountSummary[0].accountGroupSummaryMap[0]",
      undefined
    );
    let total = 0;
    const accounts = [];
    if (tempData && tempData.accountGroups) {
      for (const data of tempData.accountGroups) {
        if (selectedTab.type === "CASA") {
          total += parseFloat(data.totalNetBalanceInBaseCurrency.split(',').join(''));
        } else if (selectedTab.type === "FD") {
          total += parseFloat(data.fdmaturityAmtTotal.split(',').join(''));
        } else if (selectedTab.type === "LOAN") {
          total += parseFloat(data.loanDisbursedAmtTotal.split(',').join(''));
        }
        accounts.push(...data.accounts);
      }
      this.accountsSlideArray[tabIndex].noOfAcc = accounts.length;
    }

    const tab = {
      displayName: _.get(tempData, "displayName"),
      accountGroups: _.get(tempData, "accountGroups"),
      accounts,
      total: { label: "", value: total + '' },
      type: this.resultArray[tabIndex].type,
    };
    // if (tab.displayName) {
    //   this._tabsArray.next(tab);
    // }
    this.resultArray[tabIndex].tabData = tab;

    if (this.slideIndex === 0) {
      this.getTabs(0);
    }
  }

  getTabs(tabIndex) {
    if (this.resultArray[tabIndex].tabData.displayName) {
      if (this.resultArray[tabIndex].tabData.accountGroups.length === 0) {
        this._summaryStatus.next('notFound');
      } else {
        this._summaryStatus.next('success');
      }
      this._tabsArray.next(this.resultArray[tabIndex].tabData);
    }
  }

  getConvertedCurrency(amount, fromCurrency, toCurrency, accNo): any {
    if (amount && fromCurrency) {
      if (amount) {
        amount = amount.replace(/,/g, "");

        let intAmount = parseFloat(amount);

        const fxRate = this.getFXRate(this.baseCurrencyCode, toCurrency);

        intAmount = intAmount / fxRate;

        return intAmount + "";
      }
    }
  }

  getFXRate(fomrCurrency, toCurrency) {
    let result = 1;
    if (fomrCurrency === toCurrency) {
      return result;
    }

    result = this.fxRateMap[fomrCurrency + "_" + toCurrency];
    if (!result) {
      result = 0;
    }

    return result;
  }

  getFXRates() {
    this.angularAjax
      .sendAjaxRequest(this.CONSTANTS.GET_EXCHANGERATE, {})
      .subscribe((res) => {
        this.setFXRates(res);
      });
  }
  setFXRates(data) {
    this.setBaseCurrencyRates(data);
    this.inverseRates();
    this.setCrossCurrencyRates(data);
    this.inverseRates();
  }

  setCrossCurrencyRates(data) {
    data.dataList.forEach((currencyData1) => {
      data.dataList.forEach((currencyData2) => {
        let value = currencyData1.displayName;
        value = parseFloat(value);
        if (currencyData1.id === currencyData2.id) {
          value = 1;
        }

        const conv1 = this.getBaseCurrencyRates(
          currencyData1.id,
          this.baseCurrencyCode
        );
        const conv2 = this.getBaseCurrencyRates(
          this.baseCurrencyCode,
          currencyData2.id
        );

        value = conv1 * conv2;

        this.fxRateMap[currencyData1.id + "_" + currencyData2.id] = value;
      });
    });
  }

  getBaseCurrencyRates(currency1, currency2) {
    return this.fxRateMap[currency1 + "_" + currency2];
  }

  setBaseCurrencyRates(data) {
    data.dataList.forEach((currencyData) => {
      let value = currencyData.displayName;
      value = parseFloat(value);
      this.fxRateMap[this.baseCurrencyCode + "_" + currencyData.id] = value;
    });
  }

  inverseRates() {
    // tslint:disable-next-line: forin
    for (const fx in this.fxRateMap) {
      const currency = fx.split("_");
      if (!this.fxRateMap[currency[1] + "_" + currency[0]]) {
        this.fxRateMap[currency[1] + "_" + currency[0]] = 1 / this.fxRateMap[fx];
      }
    }
  }

  getGroupSummary() {
    return this.angularAjax.sendAjaxRequest(this.CONSTANTS.GET_GROUP_SUMMARY, {});
  }
}
