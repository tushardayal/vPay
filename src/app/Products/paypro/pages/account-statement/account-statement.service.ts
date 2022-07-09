import {Injectable} from '@angular/core';
import {AngularAjaxService} from "../../../../services/aps-services/ajaxService/angular-ajax.service";
import {BehaviorSubject, of} from "rxjs";
import {UserService} from 'src/app/services/aps-services/user.service';
import {DatePipe} from '@angular/common';
import {catchError, finalize, map} from 'rxjs/operators';
import {ToastService} from "../../../../services/aps-services/toast-service";

@Injectable({
  providedIn: 'root'
})
export class AccountStatementService {

  CONSTANTS = {
    GET_ACCOUNTS: 'accountStatementService/private/getAccounts',
    GET_MINIACCOUNTSTATEMENT: 'accountStatementService/private/getMiniAccountStatement',
    GET_ACCOUNTSTATEMENT: 'accountStatementService/private/getAccountStatement',
    FETCH_DATERANGES: 'accountStatementService/private/fetchDateRanges',
    MARK_ACCOUNT_FAV: 'accountStatementService/private/markAccountAsFavourite',
    GET_FAVOURITE_ACCOUNTS: 'accountStatementService/private/getFavouriteAccounts'
  };

  private _statementDetails: BehaviorSubject<any> = new BehaviorSubject(null);
  public statementDetails$ = this._statementDetails.asObservable();

  private _statementDetailsStatus: BehaviorSubject<any> = new BehaviorSubject(null);
  public statementDetailsStatus$ = this._statementDetailsStatus.asObservable();

  private _accounts: BehaviorSubject<any> = new BehaviorSubject(null);
  accounts$ = this._accounts.asObservable();

  private _favoriteAccounts: BehaviorSubject<any[]> = new BehaviorSubject(null);
  favoriteAccounts$ = this._favoriteAccounts.asObservable();

  private _accountsStatus: BehaviorSubject<any> = new BehaviorSubject(null);
  accountsStatus$ = this._accountsStatus.asObservable();

  constructor(private ajaxService: AngularAjaxService, private userSrv: UserService, private datePipe: DatePipe,
              private toastservice: ToastService) {
    console.log('AccountStatementService');
  }

  getAccounts() {
    this._accountsStatus.next('loading');
    return this.ajaxService.sendAjaxRequest(this.CONSTANTS.GET_ACCOUNTS, {})
    .pipe(
      catchError((err) => {
        this._accountsStatus.next('err');
        this._accounts.next([]);
        return of(false);
      }))
    .subscribe((value) => {
      if (value) {
        if (value.dataList && value.dataList.length > 0) {
          this._accountsStatus.next('success');
          this._accounts.next(value.dataList);
          this.getFavouriteAccounts();
        } else {
          this._accountsStatus.next('notFound');
          // this._accounts.next(value.dataList);
        }
      }
    });
  }

  getMiniAccountStatement(account, filter? ) {
    this._statementDetailsStatus.next('loading');
    console.log('in sev getMiniAccountStatement ', account);
    const data = {
      accountNo: account.accountNo.value,
      accountId: account.accountId ? account.accountId.value : '',
      accountName: account.accountTitle ? account.accountTitle.value : account.accountType.value,
      transactionType: "all",
      fromAmount: null,
      toAmount: null,
      // referenceNo: null,
      currencyName: account.currencyCode.value,
      isIbanPresent: account.iban && account.iban.value ? true : false,
      fromDate: filter && filter.fromDate ? filter.fromDate : null,
      toDate: filter && filter.toDate ? filter.toDate : this.datePipe
        .transform(this.userSrv.getPaymentApplicationDate(), 'dd-MMM-yyyy'),
      dataRange: filter && filter.id ? filter.id : "CURRENTDAYSTATEMENT",
      selectedFormat: "displayscreen",
      bankType: "Internal",
      addInfoRequired: "off",
      downloadFormat: "",
      bicCode: ""
    };
    const url = filter ? this.CONSTANTS.GET_ACCOUNTSTATEMENT : this.CONSTANTS.GET_MINIACCOUNTSTATEMENT;
    this.ajaxService.sendAjaxRequest(url, data)
    .pipe(
      map((response) => {
        return response;
      }),
      catchError((err) => {
        this._statementDetailsStatus.next('err');
        this._statementDetails.next(null);
        return of(false);
      }),
      finalize(() => {
        console.log("final");
      }))
    .subscribe(value => {
      if (value) {
        if (value && value.accountDetails.recordEmpty) {
          this._statementDetailsStatus.next('notFound');
        } else {
          this._statementDetailsStatus.next('success');
        }
        this._statementDetails.next(value);
        console.log('GET_MINIACCOUNTSTATEMENT');
      }
    });
  }

  getDateRanges() {
    return this.ajaxService.sendAjaxRequest(this.CONSTANTS.FETCH_DATERANGES, {})
        .pipe(map(a => a.dataList.filter(data => data.id !== 'CURRENTMONTHTODATESTATEMENT')));
  }

  markAccountAsFavourite(dataMap, isFav, favId) {
      let favMsg = "Added to Favourites";
      if (isFav === true) {
          dataMap.removeFromFavourite = 'Y';
          dataMap.id = favId;
          favMsg = "Removed from Favourites";
      }
      const data = {dataMap};
      return this.ajaxService.sendAjaxRequest(this.CONSTANTS.MARK_ACCOUNT_FAV, data)
            .pipe(map(value => {
                this.toastservice.presentToast(favMsg, 100);
            }));
  }

  getFavouriteAccounts() {
   this.ajaxService.sendAjaxRequest(this.CONSTANTS.GET_FAVOURITE_ACCOUNTS, {})
   .subscribe(res => {
    this._favoriteAccounts.next(res.dataList);
   });
  }
}
