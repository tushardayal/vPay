import {Component, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {AccountStatementService} from "../account-statement.service";
import {Subject} from "rxjs";
import {RoutingStateService} from "../../../../../services/aps-services/routing-state.service";
import {takeUntil} from "rxjs/operators";
import {MenuController} from "@ionic/angular";
import {UserService} from "../../../../../services/aps-services/user.service";
import {ObjTransferService} from 'src/app/services/aps-services/obj-transfer.service';
import {TranslatePipe} from '@ngx-translate/core';
import {DatePipe} from '@angular/common';
import {appConstants} from 'src/app/appConstants';

@Component({
  selector: "app-statement",
  templateUrl: "./statement.page.html",
  styleUrls: ["./statement.page.scss"],
  providers: [TranslatePipe]
})
export class StatementPage implements OnInit, OnDestroy {
  @ViewChild("wizardSlider", { static: false }) slider;
  allAccounts: any[];
  currentIndex: number;
  statementDetails: any;
  accountDetails: any;
  selectedAccount: any;
  activeTabIndex = 0;
  backUrl;

  filterApplicable = false;
  filters: any[] = [];

  selectedFilter;
  customFilter: any = {};

  unSubMe$ = new Subject<void>();
  dateRanges: any;
  minYear: string;
  maxYear: string;
  currentDate: string;
  refreshEvent;
  dateFormat = appConstants.dateFormat;
  statementDetailsStatus;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private routingState: RoutingStateService,
    private accountStatService: AccountStatementService,
    private menuCtrl: MenuController,
    private userService: UserService,
    private objTransSrv: ObjTransferService,
    private translate: TranslatePipe,
    private datePipe: DatePipe,
  ) {
    const stateData =  this.objTransSrv.getObjData('accountStatement');
    this.objTransSrv.removeObj('accountStatement');
    this.allAccounts = stateData.allAccounts;
    this.currentIndex = stateData.currentIndex;
    this.selectedAccount = this.allAccounts[this.currentIndex];
    console.log("selectedAccount", this.selectedAccount);
    this.currentDate = this.userService.getUserDetails().moduleDetails.Payments.currentDate;
    // this.customFilter.fromDate = new Date(this.currentDate).toISOString();
    // this.customFilter.toDate = new Date(this.currentDate).toISOString();
    this.maxYear = (new Date(this.currentDate).getFullYear() + 1).toString();
    this.minYear = (new Date(this.currentDate).getFullYear() - 1).toString();

    this.filterApplicable = this.routingState
      .getPreviousUrl()
      .includes("account-statement");
    this.backUrl = this.routingState.getPreviousUrl();
    this.accountStatService.statementDetails$
      .pipe(takeUntil(this.unSubMe$))
      .subscribe((value: any) => {
        console.log("got statement", value);
        if (value && value.accountStatementOnScreen) {
          this.statementDetails = value.accountStatementOnScreen;
          this.accountDetails = value.accountDetails;
          if (this.filterApplicable) {
            this.selectedAccount.productName = {};
            this.selectedAccount.productName.value = this.accountDetails.productType;
          }
        }
      });
    this.accountStatService.statementDetailsStatus$
    .pipe(takeUntil(this.unSubMe$))
    .subscribe((status) => {
      console.log('mini-statement ' + status);
      this.statementDetailsStatus = status;
      if (status !== 'loading' && this.refreshEvent) {
        this.refreshEvent.target.complete();
      }
    });
  }
  ionViewWillEnter() {
  }
  ngOnInit() {
    this.getMiniStatement(this.allAccounts[this.currentIndex]);
    this.getDateRanges();
  }

  getMiniStatement(account, filter?) {
    this.accountStatService.getMiniAccountStatement(account, filter);
  }

  getStatement(index: number) {
    this.clearFilter();
    this.currentIndex = index;
    this.selectedAccount = this.allAccounts[this.currentIndex];
    this.getMiniStatement(this.allAccounts[this.currentIndex]);
  }

  getDateRanges() {
    this.accountStatService
      .getDateRanges()
      .pipe(takeUntil(this.unSubMe$))
      .subscribe((value) => {
        this.dateRanges = value;
      });
  }

  getStatementDetails(statement) {
    const statementData = {
      header: this.translate.transform("lbl_transaction_details"), // "Transaction Details",
      dataList: [
        {
          header: this.translate.transform("lbl_entry_date"),
          value: statement.date,
          isDisplay: 'Y'
        },
        {
          header: this.translate.transform("lbl_value_date"),
          value: statement.valueDate,
          isDisplay: 'Y'
        },
        {
          header: this.translate.transform("lbl_transaction_details"),
          value: statement.description,
          isDisplay: 'Y'
        },
        {
          header: this.translate.transform("lbl_references"),
          value: statement.chequeNo,
          isDisplay: 'Y'
        },
        {
          header: this.translate.transform("lbl_debits"),
          value: statement.debitAmount,
          isDisplay: 'Y',
          cssClass: 'debit-amt'
        },
        {
          header: this.translate.transform("lbl_credits"),
          value: statement.creditAmount,
          cssClass: 'credit-amt',
          isDisplay: 'Y'
        },
      ],
    };
    this.objTransSrv.setObjData('accountStatementView', { data: statementData });
    this.router.navigate(["../view"], {
      relativeTo: this.route,
    });
  }

  showAccountDetails() {
    const statementData = {
      header: this.translate.transform("lbl_account_details"),
      dataList: this.selectedAccount,
    };
    this.objTransSrv.setObjData('accountStatementView', { data: statementData });
    this.router.navigate(["../view"], {
      relativeTo: this.route,
    });
  }

  openFilter() {
    this.menuCtrl.open("filterMenuId");
  }

  applyFilter() {
    this.selectedFilter.fromDate = this.datePipe.transform(this.selectedFilter.fromDate, appConstants.requestDateFormat);
    this.selectedFilter.toDate = this.datePipe.transform(this.selectedFilter.toDate, appConstants.requestDateFormat);
    console.log(this.selectedFilter);
    this.getMiniStatement(
      this.allAccounts[this.currentIndex],
      this.selectedFilter
    );
    this.closeFilter();
  }

  clearFilter() {
    this.selectedFilter = {};
    this.customFilter = {};
  }

  closeFilter() {
    this.menuCtrl.close("filterMenuId");
  }

  ngOnDestroy() {
    console.log("ngOnDestroy unSubStatementDetails$");
    this.unSubMe$.next();
    this.unSubMe$.complete();
    this.unSubMe$.unsubscribe();
  }

  ionSlideDidChange(event) {
    // this.slider.getActiveIndex().then((val) => {
    //   this.activeTabIndex = val;
    //   this.getStatement(this.activeTabIndex);
    // });
  }
  ionSlideWillChange(event) {
    this.slider.getActiveIndex().then((val) => {
      this.activeTabIndex = val;
      this.getStatement(this.activeTabIndex);
    });

  }

  doRefresh(event?) {
    this.clearFilter();
    this.refreshEvent = event;
    this.getMiniStatement(this.allAccounts[this.currentIndex]);
  }

  dateFocus(filter, type) {
    if (!filter[type]) {
      filter[type] = new Date(this.currentDate).toISOString();
    }
  }

  fromDateChanged() {
    const fromDate = new Date(this.customFilter.fromDate);
    const toDate = new Date(this.customFilter.toDate);
    if (fromDate > toDate) {
      this.customFilter.toDate = fromDate.toISOString();
    }
  }
}
