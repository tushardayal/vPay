import {Component, OnDestroy, OnInit, ViewChildren, ElementRef, QueryList, ViewChild} from '@angular/core';
import {AccountStatementService} from "../account-statement.service";
import {ActivatedRoute, Router} from "@angular/router";
import {ToastService} from 'src/app/services/aps-services/toast-service';
import {ObjTransferService} from 'src/app/services/aps-services/obj-transfer.service';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {FilterByPipe} from 'src/app/components/pipes/filter.pipe';
import { HelpPageService } from 'src/app/components/help-page/help-page.service';
import {UserService} from "../../../../../services/aps-services/user.service";
import * as _ from "lodash";


@Component({
    selector: 'app-account-statement',
    templateUrl: './account-statement.page.html',
    styleUrls: ['./account-statement.page.scss'],
})
export class AccountStatementPage implements OnInit, OnDestroy {

    accounts: any[] = [];
    refreshEvent;
    searchText;
    showSearchBar = false;
    unsub$ = new Subject();
    accountsStatus;
    favouriteAccounts: any = [];
    @ViewChild('contentBox' , { static: false}) contentBox: ElementRef;
    @ViewChildren('accountStatementEl') accountStatementEl: QueryList<ElementRef>;
    groupAccounts: any;
    constructor(private accountStatService: AccountStatementService,
                private router: Router,
                private route: ActivatedRoute,
                private toastSrv: ToastService,
                private objTransSrv: ObjTransferService,
                private filterbyPipe: FilterByPipe,
                public userService: UserService,
                private helpSrv: HelpPageService) {
    }

    ngOnInit() {
    }

    ionViewDidEnter() {
        this.accountStatService.accounts$
        .pipe(takeUntil(this.unsub$))
        .subscribe((value) => {
            if (value != null) {
                this.accounts = value;
                /*if (this.userService.isGroupSelected) {
                    this.groupAccounts = _.groupBy(this.accounts, (res) => res.enrichments.group);
                }*/
            }
        });
        this.accountStatService.favoriteAccounts$
        .pipe(takeUntil(this.unsub$))
        .subscribe((value) => {
            if (value != null && this.accounts != null) {
                this.orderFavoriteAccounts(this.accounts, value);
                /*if (this.userService.isGroupSelected) {
                    this.groupAccounts = _.groupBy(this.accounts, (res) => res.enrichments.group);
                }*/
            }
        });
        this.accountStatService.accountsStatus$
        .pipe(takeUntil(this.unsub$))
        .subscribe((status) => {
            console.log('account-statement ' + status);
            this.accountsStatus = status;
            if (status !== 'loading' && this.refreshEvent) {
                this.refreshEvent.target.complete();
            }
        });
        this.getAccounts();
    }
    trackByFn(index, item) {
        return index;
    }
    getAccounts() {
        this.accountStatService.getAccounts();
    }

    showStatement(index) {
        this.objTransSrv.setObjData('accountStatement', {allAccounts: this.mssageAccounts(), currentIndex: index});
        this.router.navigate(['../statement'], {
            relativeTo: this.route
        });
    }

    doRefresh(event) {
        this.refreshEvent = event;
        this.getAccounts();
    }

    mssageAccounts() {
        const tempAccountArray = [];
        for (const account of this.accounts) {
            const tempAccount = {
                accountNo: {header: 'Account No', value: account.displayName},
                accountType: {header: 'Account Type', value: account.enrichments.accountType},
                currencyCode: {header: 'Currency Code', value: account.enrichments.currencyCode},
                accountId: {value: account.id},
                iban: {header: 'IBAN', value: account.enrichments.Iban}
            };
            tempAccountArray.push(tempAccount);
        }
        return tempAccountArray;
    }

    ngOnDestroy() {
        this.unsub$.next();
        this.unsub$.complete();
        this.unsub$.unsubscribe();
    }

    filterArray(array) {
        const props = ['displayName', 'enrichments.currencyCode', 'enrichments.accountType'];
        return this.filterbyPipe.transform(array, props, this.searchText);
    }

    toggleFav(event, item) {
        if (event) {
            event.stopPropagation();
        }
        const dataMap = {
            accountNo: item.displayName,
            accountId: item.id,
            removeFromFavourite: undefined,
            id: undefined
        };
        this.accountStatService.markAccountAsFavourite(dataMap, item.fav, item.favId)
            .subscribe(res => {
                item.fav = !item.fav;
                this.accountStatService.getFavouriteAccounts();
            });
    }

  orderFavoriteAccounts(dataList: any[], favAccounts: any[]) {
    // tslint:disable-next-line: prefer-for-of
    for (const favAcc of favAccounts) {
        for (let i = 0; i < dataList.length; i++) {
        const acc = dataList[i];
        if (acc.id === favAcc[1]) {
          acc.favId = favAcc[0];
          acc.fav = true;
          dataList.splice(i, 1);
          dataList.unshift(acc);
          break;
        }
      }
    }
  }
  showHelp() {
    let labelArray = [{
        name: 'accountNo',
        text: 'Account Number'
    }, {
        name: 'group',
        text: 'Corporate'
    }, {
        name: 'accountType',
        text: 'Account Type'
    }, {
        name: 'favAcc',
        text: 'Favourite Account'
    }];

    const hasGroupLabel = this.accounts.some((account, index) => {
          return account.enrichments.group;
      });
    if (!hasGroupLabel) {
          labelArray = labelArray.filter(acc => acc.name !== 'group');
    }
    this.helpSrv.showHelpPage({
        elArray: this.accountStatementEl.toArray(),
        elParent: this.contentBox,
        labelArray
    });
  }
}
