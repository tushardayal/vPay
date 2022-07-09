import { Component, OnInit, OnDestroy } from "@angular/core";
import { ListingService } from "src/app/listing/listing.service";
import { ActivatedRoute } from "@angular/router";
import { Subscription, Subject } from 'rxjs';
import { TransactionCommonService } from "../../../../../transaction-common.service";
import { takeUntil } from 'rxjs/operators';
import { ObjTransferService } from 'src/app/services/aps-services/obj-transfer.service';
import { RoutingStateService } from 'src/app/services/aps-services/routing-state.service';
import {TranslatePipe} from "@ngx-translate/core";

@Component({
  selector: "letter-of-credit-view",
  templateUrl: "./letter-of-credit-view.page.html",
  styleUrls: ["./letter-of-credit-view.page.scss"],
  providers: [TranslatePipe]
})
export class LetterOfCreditViewPage implements OnInit, OnDestroy {
  id: string;
  dataObj: any = {};
  lcDetails;
  backButtonLink;
  typeOfDocument: any = [];
  unsub$: Subscription;
  unsub1$ = new Subject();
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
    console.log("view data", this.dataObj);
  }

  ngOnInit() {
    const extraData = this.objTransSrv.getObjData('extraData');
    // this.backButtonLink = this.routeState.getPreviousUrl();
    if (extraData && extraData.type === 'history') {
      this.objTransSrv.removeObj('extraData');
    }
    this.unsub$ = this.listingSrv.view(this.id, extraData).subscribe(data => {
      this.dataObj = data;
      this.lcDetails = this.dataObj.lcDet[0];
      console.log("this.lcDetails", this.lcDetails);
      // this.typeOfDocument = this.dataObj.lcDet[0].typeOfDocument;
      this.typeOfDocument = this.lcDetails.typeOfDocument.filter(item => item.toUpperCase() !== 'STANDARD');
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
