import {Component, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {AccountSummaryService} from "./account-summary.service";
import {Subject} from "rxjs";
import {takeUntil} from "rxjs/operators";
import {ActivatedRoute, Router} from "@angular/router";
import {ToastService} from "../../../../services/aps-services/toast-service";
import {SuperTabChangeEventDetail} from "@ionic-super-tabs/core";
import {ExchangeCurrencyPopoverComponent} from "./exchangeCurrencyPopover/exchange-currency-popover.component";
import {PopoverController} from "@ionic/angular";
import {ObjTransferService} from 'src/app/services/aps-services/obj-transfer.service';
import {AccountStatementService} from '../account-statement/account-statement.service';
import {UserService} from "../../../../services/aps-services/user.service";
import {RoutingStateService} from "../../../../services/aps-services/routing-state.service";
import { TranslatePipe } from '@ngx-translate/core';
import {environment} from 'src/environments/environment';

@Component({
    selector: "app-account-summary",
    templateUrl: "./account-summary.page.html",
    styleUrls: ["./account-summary.page.scss"],
    providers: [TranslatePipe]
})
export class AccountSummaryPage implements OnInit, OnDestroy {
  activeTabIndex = 0;
  tabsArray: any = {};
  @ViewChild("wizardSlider", { static: false }) slider;
  baseCurrencyCode;
  exchangeCurrencyCode;
  refreshEvent;
  accountsSlideArray = [];
  unsub$ = new Subject();
  isRecordLoadingDone = false;
  isRecordEmpty = false;
  summaryStatus;
  favAccountslist = [];
    env = environment;
    dataFromGroup;
    backUrl;
    constructor(
        private accountSummaryService: AccountSummaryService,
        private router: Router,
        private route: ActivatedRoute,
        private toastservice: ToastService,
        private popoverController: PopoverController,
        private objTransSrv: ObjTransferService,
        private accountStatementSrv: AccountStatementService,
        private userService: UserService,
        private routingState: RoutingStateService,
        private translate: TranslatePipe
    ) {
    }

  ngOnInit() {
      if (this.userService.isGroupSelected) {
          this.backUrl = this.routingState.getPreviousUrl();
          this.dataFromGroup = this.objTransSrv.getObjData('accountGroup');
          this.objTransSrv.clearObjData();
          console.log('dataFromGroup', this.dataFromGroup);
      }
      this.accountSummaryService.createSummaryTabs(this.dataFromGroup);
      this.accountsSlideArray = this.accountSummaryService.accountsSlideArray;
  }

  ionViewDidEnter() {
    this.accountSummaryService.tabsArray$
      .pipe(takeUntil(this.unsub$))
      .subscribe((tabs) => {
        if (tabs && tabs.type) {
          this.tabsArray = tabs ? tabs : {};
          this.orderFavoriteAccounts(this.tabsArray.accounts, this.favAccountslist);
        }
      });
    this.accountSummaryService.summaryStatus$
    .pipe(takeUntil(this.unsub$))
    .subscribe((status) => {
      console.log('summary ' + status);
      this.summaryStatus = status;
      if (this.summaryStatus !== 'loading' && this.refreshEvent) {
        this.refreshEvent.target.complete();
      }
    });
    this.accountStatementSrv.favoriteAccounts$
    .pipe(takeUntil(this.unsub$))
    .subscribe((favlist) => {
      if (favlist && this.tabsArray && this.tabsArray.accounts) {
        this.favAccountslist = favlist;
        this.orderFavoriteAccounts(this.tabsArray.accounts, favlist);
      }
    });
    // this.accountSummaryService.getFXRates();
    this.baseCurrencyCode = this.accountSummaryService.baseCurrencyCode;
    this.exchangeCurrencyCode = this.accountSummaryService.baseCurrencyCode;
  }

  onTabChange(ev: CustomEvent<SuperTabChangeEventDetail>) {
    if (ev.detail.changed) {
      this.activeTabIndex = ev.detail.index;
    }
  }
  ionSlideDidChange(evt) {
    // this.slider.getActiveIndex().then((val) => {
    //   this.activeTabIndex = val;
    // });
  }

  ionSlideWillChange(event) {
    this.slider.getActiveIndex().then((val) => {
      this.activeTabIndex = val;
      this.accountSummaryService.getTabs(this.activeTabIndex);
    });
  }
  showDetails(accounts, index) {
    if (accounts[index].type && accounts[index].type.value === "casa") {
      this.objTransSrv.setObjData('accountStatement', { allAccounts: accounts, currentIndex: index });
      this.router.navigate(["menu", "paypro", "account-statement", "statement"]);
      return;
    }
    if (accounts[index].contract) {
          accounts[index].contractNo.header = this.translate.transform("lbl_loan_account_no");
      }
    const data = {
      header: this.translate.transform("lbl_account_details"),
      dataList: accounts[index],
    };
    this.objTransSrv.setObjData('accountStatementView', { data });
    this.router.navigate(["menu", "paypro", "account-statement", "view"]);
    // this.router.navigate(["../menu/paypro/account-statement/view"], {
    //   state: { data },
    //   relativeTo: this.route.parent,
    // });

    console.log("show statement ", data);
    // this.toastservice.presentToast("Go to account Details");
  }

  ngOnDestroy(): void {
    this.unsub$.next();
    this.unsub$.complete();
    this.unsub$.unsubscribe();
  }

  toggleFav(event, item) {
      if (event) {
          event.stopPropagation();
      }
      const dataMap = {
          accountNo: item.accountNo.value,
          accountId: item.accountId.value,
          removeFromFavourite: undefined,
          id: undefined
      };
      this.accountStatementSrv.markAccountAsFavourite(dataMap, item.fav, item.favId)
          .subscribe(res => {
              item.fav = !item.fav;
              this.accountStatementSrv.getFavouriteAccounts();
          });
  }

  orderFavoriteAccounts(dataList: any[], favAccounts: any[]) {
    // tslint:disable-next-line: prefer-for-of
    for (const favAcc of favAccounts) {
      for (let i = 0; i < dataList.length; i++) {
        const acc = dataList[i];
        if (acc.accountId.value === favAcc[1]) {
          acc.favId = favAcc[0];
          acc.fav = true;
          dataList.splice(i, 1);
          dataList.unshift(acc);
          break;
        }
      }
    }
  }

  getConvertedCurrency(amt, fromCurrency, toCurrency, accNo) {
    const amount = this.accountSummaryService.getConvertedCurrency(
      amt,
      fromCurrency,
      toCurrency,
      accNo
    );
    return amount;
  }

  async presentPopover(ev: any) {
    const popover = await this.popoverController.create({
      component: ExchangeCurrencyPopoverComponent,
      event: ev,
      translucent: true,
      componentProps: { exchangeCurrencyCode: this.exchangeCurrencyCode },
    });
    popover.onWillDismiss().then((data) => {
      if (data && data.data && data.data.exchangeCurrencyCode) {
        this.exchangeCurrencyCode = data.data.exchangeCurrencyCode;
      }
    });
    return await popover.present();
  }
  doRefresh(event) {
    this.isRecordEmpty = false;
    this.isRecordLoadingDone = false;
    this.refreshEvent = event;
    this.accountSummaryService
      .refreshSumm(this.activeTabIndex, this.dataFromGroup)
      .subscribe((res) => {
        this.orderFavoriteAccounts(this.tabsArray.accounts, this.favAccountslist);
      });
  }

    async showGraph() {
        /*const modal = await this.modalCtrl.create({
          component: AccountSummaryGraphComponent,
          componentProps: {
            isModal: true,
          },
          cssClass: 'my-custom-class'
        });
        return await modal.present();*/
        this.router.navigateByUrl('menu/paypro/mis/account-summary-graph');
        this.objTransSrv.setObjData('data', {isModal: true});
        this.router.navigate(["menu/paypro/mis/account-summary-graph"]);
    }
}
