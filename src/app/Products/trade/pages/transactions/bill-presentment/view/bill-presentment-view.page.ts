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
  selector: "bill-presentment-view",
  templateUrl: "./bill-presentment-view.page.html",
  styleUrls: ["./bill-presentment-view.page.scss"],
  providers: [TranslatePipe]
})
export class BillPresentmentViewPage implements OnInit, OnDestroy {
  id: string;
  dataObj: any = {};
  billPresentment;
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

      this.billPresentment = this.dataObj;
      console.log("this.billPresentment", this.billPresentment.billPresentmentType);
    });
  }
  donloadFile() {
    // if (this.paymentRequestDetails.supportingDocSysfilename && this.paymentRequestDetails.supportingDocFilename) {
    //     this.transactionsSrv.downloadFile(this.singlePaymentSrv.CONSTANTS.DOWNLOAD_FILE,
    //       this.paymentRequestDetails.supportingDocFilename, this.paymentRequestDetails.supportingDocSysfilename);
    //   }
  }
  ngOnDestroy() {
    this.unsub$.unsubscribe();
    this.unsub1$.next();
    this.unsub1$.complete();
    this.unsub1$.unsubscribe();
  }
}
