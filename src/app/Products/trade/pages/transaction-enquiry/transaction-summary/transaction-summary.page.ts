import { Component, OnInit, ViewChildren, QueryList, ElementRef, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { TransactionEnquiryService } from "../transaction-enquiry.service";
import { ListingService } from 'src/app/listing/listing.service';
import { ObjTransferService } from 'src/app/services/aps-services/obj-transfer.service';
import { LoginService } from 'src/app/login/login-service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import {TransactionDataListMapping, TxnEnquiryType} from '../TransactionDataListMapping';
import { TranslatePipe } from '@ngx-translate/core';
import { HelpPageService } from 'src/app/components/help-page/help-page.service';

@Component({
  selector: "app-transaction-summary",
  templateUrl: "./transaction-summary.page.html",
  styleUrls: ["./transaction-summary.page.scss"],
})
export class TransactionSummaryPage implements OnInit {
  @ViewChildren('datalistItem') datalistItem: QueryList<ElementRef>;
  @ViewChild('contentBox', { static: false}) contentBox: ElementRef;
  id;
  dataItemList = [];
  listingState;
  entityName;
  loginType;
  backUrl;
  unsub$ = new Subject();
  listHeaderMapping;
  headers: any[];
  constructor(
    private navParams: ActivatedRoute,
    private transEnquirySrv: TransactionEnquiryService,
    private listingSrv: ListingService,
    private router: Router,
    private objTransSrv: ObjTransferService,
    private loginSrv: LoginService,
    private translatePipe: TranslatePipe,
    private helpPageSrv: HelpPageService
  ) {
    navParams.paramMap.subscribe((val) => {
      this.id = val.get("id");
      this.getTransactionSummary();
    });
  }
  getTransactionSummary() {
    const data = {
      pageNumber: 1,
      searchType: this.listingSrv.selectedTab.summaryKey,
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
    this.transEnquirySrv.searchEnuiry(data).subscribe((response) => {
      if (response.dataList && response.dataList.length > 0) {
        this.listingState = 'success';
        this.headers = response.headers;
        this.transEnquirySrv.parseDataListHeader(response.dataList, response, this.dataItemList);
        this.parseListingData();
      } else {
        this.listingState = 'notFound';
       }
    });
  }

  parseListingData() {
    const dataItems = [];
    this.entityName = this.transEnquirySrv.selectedEntityName;
    this.listHeaderMapping = new TransactionDataListMapping(this.entityName, TxnEnquiryType.SUMMARY, this.translatePipe);
    for (const element of this.dataItemList) {
      const item: any = {};
      item.id = element.Id;
      // item.dateTime = element["Date and Time"];
      this.listHeaderMapping.setListingHeaders(element, item);

      dataItems.push(item);
    }
    this.dataItemList = dataItems;
    console.log("pass", this.dataItemList);
  }

    view(item, $event) {
    this.objTransSrv.setObjData('extraData', { type: "history"});
    if (this.loginType === 'IMPORT') {
      this.router.navigate(["menu", "import-trade", "view", this.listingSrv.selectedTab.viewUrl, item.id]);
    } else if (this.loginType === 'EXPORT') {
      this.router.navigate(["menu", "export-trade", "view", this.listingSrv.selectedTab.viewUrl, item.id]);
    }
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

  showHelpPage() {
    const labelArray = this.listHeaderMapping.getHelpPageLabels(this.headers);
    this.helpPageSrv.showHelpPage({
      labelArray,
      elArray: this.datalistItem.toArray(),
      elParent: this.contentBox
    });
  }
}
