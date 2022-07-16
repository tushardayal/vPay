import { Component, OnInit, OnDestroy } from "@angular/core";
import { ListingService } from "src/app/listing/listing.service";
import { ActivatedRoute } from "@angular/router";
import { Subscription, Subject } from 'rxjs';
import { TransactionCommonService } from "../../../../../transaction-common.service";
import { takeUntil } from 'rxjs/operators';
import { ObjTransferService } from 'src/app/services/aps-services/obj-transfer.service';
import {RoutingStateService} from "../../../../../../services/aps-services/routing-state.service";
import {TranslatePipe} from "@ngx-translate/core";

@Component({
  selector: "request-finance-export-view",
  templateUrl: "./request-finance-export-view.page.html",
  styleUrls: ["./request-finance-export-view.page.scss"],
  providers: [TranslatePipe]
})
export class RequestFinanceExportViewPage implements OnInit, OnDestroy {
  id: string;
  dataObj: any = {};
  requestFinanceDetails: any = {};
  unsub$: Subscription;
  unsub1$ = new Subject();
  backButtonLink; // = ['/menu/export-trade/listing/trade'];
  constructor(
    private listingSrv: ListingService,
    private navParams: ActivatedRoute,
    public transactionsSrv: TransactionCommonService,
    private objTransSrv: ObjTransferService,
    private routeState: RoutingStateService
  ) {
    navParams.paramMap.pipe(takeUntil(this.unsub1$)).subscribe(val => {
      if (val.get("id")) {
        this.id = val.get("id");
        this.backButtonLink = routeState.getPreviousUrl();
      }
    });
  }

  ngOnInit() {
    // this.id = val.get("id");
    const extraData = this.objTransSrv.getObjData('extraData');
    const enquiryView = this.objTransSrv.getObjData('enquiryView');
    if (enquiryView) {
      this.backButtonLink = ['/menu/export-trade/transaction-enquiry'];
      this.objTransSrv.removeObj('enquiryView');
    }
    if (extraData && extraData.type === 'history') {
      this.objTransSrv.removeObj('extraData');
      this.backButtonLink = ['/menu/export-trade/transaction-enquiry/summary'];
    }
    this.unsub$ = this.listingSrv.view(this.id, extraData).subscribe(data => {
      this.dataObj = data;
      this.requestFinanceDetails = this.dataObj;
      console.log("requestFinanceDetails", this.requestFinanceDetails);
    });
  }
  donloadFile() {
    if (this.requestFinanceDetails.fxSystemFileName && this.requestFinanceDetails.fxContractUploadFileName) {
      this.transactionsSrv.downloadFile(this.transactionsSrv.CONSTANTS.DOWNLOAD_FILE,
        this.requestFinanceDetails.fxContractUploadFileName, this.requestFinanceDetails.fxSystemFileName);
    }
  }
  ngOnDestroy() {
    this.unsub$.unsubscribe();
    this.unsub1$.next();
    this.unsub1$.complete();
    this.unsub1$.unsubscribe();
  }
}
