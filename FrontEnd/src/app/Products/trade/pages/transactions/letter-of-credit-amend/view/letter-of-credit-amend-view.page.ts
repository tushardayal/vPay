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
  selector: "letter-of-credit-amend-view",
  templateUrl: "./letter-of-credit-amend-view.page.html",
  styleUrls: ["./letter-of-credit-amend-view.page.scss"],
  providers: [TranslatePipe]
})
export class LetterOfCreditAmendViewPage implements OnInit, OnDestroy {
  id: string;
  dataObj: any = {};
  lcDetails;
  typeOfDocument: any = [];
  unsub$: Subscription;
  unsub1$ = new Subject();
  backButtonLink; //  = ['/menu/import-trade/listing/trade'];
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
      this.lcDetails = this.dataObj;
      console.log("this.lcDetails", this.lcDetails);
      this.typeOfDocument = this.lcDetails.typeOfLc.filter(item => item.toUpperCase() !== 'STANDARD');
    });
  }
  donloadFile() {
    // if (this.lcDetails.supportingDocSysfilename && this.lcDetails.supportingDocFilename) {
    //     this.transactionsSrv.downloadFile(this.singlePaymentSrv.CONSTANTS.DOWNLOAD_FILE,
    //       this.lcDetails.supportingDocFilename, this.lcDetails.supportingDocSysfilename);
    //   }
  }
  ngOnDestroy() {
    this.unsub$.unsubscribe();
    this.unsub1$.next();
    this.unsub1$.complete();
    this.unsub1$.unsubscribe();
  }
}
