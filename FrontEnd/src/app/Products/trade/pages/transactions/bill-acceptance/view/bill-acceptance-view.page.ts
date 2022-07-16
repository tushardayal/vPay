import { Component, OnInit, OnDestroy } from "@angular/core";
import { ListingService } from "src/app/listing/listing.service";
import { ActivatedRoute } from "@angular/router";
import { Subscription, Subject } from 'rxjs';
import { TransactionCommonService } from "../../../../../transaction-common.service";
import { takeUntil } from 'rxjs/operators';
import { ObjTransferService } from 'src/app/services/aps-services/obj-transfer.service';
import {RoutingStateService} from "../../../../../../services/aps-services/routing-state.service";

@Component({
  selector: "bill-acceptance-view",
  templateUrl: "./bill-acceptance-view.page.html",
  styleUrls: ["./bill-acceptance-view.page.scss"]
})
export class BillAcceptanceViewPage implements OnInit, OnDestroy {
  id: string;
  dataObj: any = {};
  billAcceptanceDetails;
  unsub$: Subscription;
  unsub1$ = new Subject();
  backButtonLink; // = ['/menu/import-trade/listing/trade'];
  constructor(
    private listingSrv: ListingService,
    private navParams: ActivatedRoute,
    public transactionsSrv: TransactionCommonService,
    private objTransSrv: ObjTransferService,
    private routeState: RoutingStateService
  ) {
    console.log("view data", this.dataObj);
    navParams.paramMap.pipe(takeUntil(this.unsub1$)).subscribe(val => {
      if (val.get("id")) {
        this.id = val.get("id");
        this.backButtonLink = routeState.getPreviousUrl();
      }
    });
    console.log("view data", this.dataObj);
  }

  ngOnInit() {
    // this.id = val.get("id");
    const extraData = this.objTransSrv.getObjData('extraData');
    const enquiryView = this.objTransSrv.getObjData('enquiryView');
    if (enquiryView) {
      this.backButtonLink = ['/menu/import-trade/transaction-enquiry'];
      this.objTransSrv.removeObj('enquiryView');
    }
    if (extraData && extraData.type === 'history') {
      this.objTransSrv.removeObj('extraData');
      this.backButtonLink = ['/menu/import-trade/transaction-enquiry/summary'];
    }
    this.unsub$ = this.listingSrv.view(this.id, extraData).subscribe(data => {
      this.dataObj = data;

      this.billAcceptanceDetails = this.dataObj;
      console.log("this.billAcceptanceDetails", this.billAcceptanceDetails);
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
