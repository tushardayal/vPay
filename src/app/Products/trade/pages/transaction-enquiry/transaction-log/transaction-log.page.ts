import { Component, OnInit, OnDestroy, QueryList, ViewChildren, ElementRef, ViewChild } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { TransactionEnquiryService } from "../transaction-enquiry.service";
import { ListingService } from 'src/app/listing/listing.service';
import { LoginService } from 'src/app/login/login-service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { TranslatePipe } from '@ngx-translate/core';
import { HelpPageService } from 'src/app/components/help-page/help-page.service';

@Component({
  selector: "app-transaction-log",
  templateUrl: "./transaction-log.page.html",
  styleUrls: ["./transaction-log.page.scss"],
})
export class TransactionLogPage implements OnInit, OnDestroy {
  @ViewChildren('datalistItem') datalistItem: QueryList<ElementRef>;
  @ViewChild('contentBox', { static : false}) contentBox: ElementRef;
  id;
  dataItemList = [];
  listingState;
  backUrl;
  loginType;
  headers: any[];
  unsub$ = new Subject();
  constructor(
    private navParams: ActivatedRoute,
    private transEnquirySrv: TransactionEnquiryService,
    private listingSrv: ListingService,
    private loginSrv: LoginService,
    private translatePipe: TranslatePipe,
    private helpPageSrv: HelpPageService
  ) {
    navParams.paramMap
    .pipe(takeUntil(this.unsub$))
    .subscribe((val) => {
      this.id = val.get("id");
      this.getTransactionLogs();
    });
  }
  getTransactionLogs() {
    const data = {
      pageNumber: 1,
      searchType: this.listingSrv.selectedTab.logKey,
      filters: [
        {
          name: "id",
          value: this.id,
          type: "String",
          displayName: "Id",
        },
      ],
    };
    this.dataItemList = [];
    this.transEnquirySrv.searchEnuiry(data)
    .pipe(takeUntil(this.unsub$))
    .subscribe(response => {
     if (response.dataList && response.dataList.length > 0) {
        this.headers = response.headers;
        this.dataItemList = response.dataList;
        this.listingState = 'success';
       // this.transEnquirySrv.parseDataListHeader(response.dataList, response, this.dataItemList);
        // this.parseListingData();
    } else {
        this.listingState = 'notFound';
     }
    });
  }
  ngOnInit() {
    this.loginSrv.tradeLoginType$
    .pipe(takeUntil(this.unsub$))
    .subscribe((val) => {
      if (val) {
        this.loginType = val;
        if (this.loginType === 'IMPORT') {
          this.backUrl = ['menu', 'import-trade', 'transaction-enquiry'];
        } else if (this.loginType === 'EXPORT') {
          this.backUrl = ['menu', 'export-trade', 'transaction-enquiry'];
        }
      }
    });
  }

  ngOnDestroy() {
    this.unsub$.next();
    this.unsub$.complete();
    this.unsub$.unsubscribe();
  }
  parseListingData() {
    const dataItems = [];
    if (this.dataItemList == null) {
      return;
    }
    for (const element of this.dataItemList) {
      const item: any = {};
      item.id = element.Id;
      item.refId = element.RefId;
      item.dateTime = element['Date and Time'];
      item.action = element.Action;
      item.user = element.User;
      dataItems.push(item);
    }
    this.dataItemList = dataItems;
    console.log("pass", this.dataItemList);
  }

  showHelpPage() {
    const labelArray = [{
      name: 'user',
      text: this.translatePipe.transform('enquiry_log_user'),
    }, {
      name: 'action',
      text: this.translatePipe.transform('enquiry_log_action'),
    }, {
      name: 'dateTime',
      text: this.translatePipe.transform('enquiry_log_date_and_time'),
    }];
    this.helpPageSrv.showHelpPage({
      labelArray,
      elArray: this.datalistItem.toArray(),
      elParent: this.contentBox
    });
  }
}
