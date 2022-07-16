import { Component, OnInit, OnDestroy } from "@angular/core";
import { ListingService } from "src/app/listing/listing.service";
import { ActivatedRoute } from "@angular/router";
import { Subscription, Subject } from 'rxjs';
import { TransactionCommonService } from '../../../../../transaction-common.service';
import { takeUntil } from 'rxjs/operators';
import { ObjTransferService } from 'src/app/services/aps-services/obj-transfer.service';
import {RoutingStateService} from "../../../../../../services/aps-services/routing-state.service";
import {TranslatePipe} from "@ngx-translate/core";

@Component({
  selector: "bank-guarantee-view",
  templateUrl: "./bank-guarantee-view.page.html",
  styleUrls: ["./bank-guarantee-view.page.scss"],
  providers: [TranslatePipe]
})
export class BankGuaranteeViewPage implements OnInit, OnDestroy {
  id: string;
  dataObj: any = {};
  bgDetails;
  typeOfUndertaking: any = [];
  backButtonLink; // = ['/menu/export-trade/listing/trade'];
  unsub$: Subscription;
  unsub1$ = new Subject();
  constructor(
    private listingSrv: ListingService,
    private navParams: ActivatedRoute,
    public transactionsSrv: TransactionCommonService,
    private routeState: RoutingStateService,
    private objTransSrv: ObjTransferService
  ) {
    navParams.paramMap.pipe(takeUntil(this.unsub1$)).subscribe(val => {
      if (val.get("id")) {
        this.id = val.get("id");
        this.backButtonLink = routeState.getPreviousUrl();
      }
    });
  }

  ngOnInit() {

    // console.log(" this.listingService",);
    // console.log("val", val);
    // this.id = val.get("id");

    let extraData = this.objTransSrv.getObjData('extraData');
    const enquiryView = this.objTransSrv.getObjData('enquiryView');
    if (enquiryView) {
      this.backButtonLink = ['/menu/export-trade/transaction-enquiry'];
      this.objTransSrv.removeObj('enquiryView');
    }
    if (extraData && extraData.type === 'history') {
      this.objTransSrv.removeObj('extraData');
      this.backButtonLink = ['/menu/export-trade/transaction-enquiry/summary'];
    } else if (this.listingSrv.currentListType) {
      extraData = {
        prevData: this.listingSrv.currentListType.displayName,
        isView: true
      };
    }

    this.unsub$ = this.listingSrv.view(this.id, extraData).subscribe(data => {
      this.dataObj = data;

      this.bgDetails = this.dataObj;
      this.typeOfUndertaking = this.bgDetails.typeOfUndertaking.find(a => a.id !== 'STANDARD');
      console.log("data", data);
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
