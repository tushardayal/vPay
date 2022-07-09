import { Component, OnInit, OnDestroy } from "@angular/core";
import { ListingService } from "src/app/listing/listing.service";
import { ActivatedRoute } from "@angular/router";
import { Subscription, Subject } from 'rxjs';
import { TransactionCommonService } from "../../../../../transaction-common.service";
import { takeUntil } from 'rxjs/operators';
import { ObjTransferService } from 'src/app/services/aps-services/obj-transfer.service';
import {AngularAjaxService} from "../../../../../../services/aps-services/ajaxService/angular-ajax.service";
import {RoutingStateService} from "../../../../../../services/aps-services/routing-state.service";
import {TranslatePipe} from "@ngx-translate/core";

@Component({
  selector: "ott-payment-view",
  templateUrl: "./ott-payment-view.page.html",
  styleUrls: ["./ott-payment-view.page.scss"],
  providers: [TranslatePipe]
})
export class OTTPaymentViewPage implements OnInit, OnDestroy {
  id: string;
  dataObj: any = {};
  ottDetails;
  unsub$: Subscription;
  unsub1$ = new Subject();
  CONSTANTS = {
    PAYMENT_INSTRUCTIONLIST: "ottPaymentService/private/paymentInstructionList"
  };
  backButtonLink; // = ['/menu/import-trade/listing/trade'];

  constructor(
      private listingSrv: ListingService,
      private navParams: ActivatedRoute,
      public transactionsSrv: TransactionCommonService,
      private objTransSrv: ObjTransferService,
      private ajaxService: AngularAjaxService,
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
      console.log("data", data);
      this.ottDetails = this.dataObj;
      if (this.ottDetails.paymentDetails1) {
        this.ajaxService.sendAjaxRequest(this.CONSTANTS.PAYMENT_INSTRUCTIONLIST, {})
            .subscribe((response: any) => {
              const paymentTerms = response.dataList.filter(option => option.id === this.ottDetails.paymentDetails1);
              this.ottDetails.paymentTerms = paymentTerms[0];
            });
      }
    });
  }
  donloadFile() {
    // if (this.ottDetails.supportingDocSysfilename && this.ottDetails.supportingDocFilename) {
    //     this.transactionsSrv.downloadFile(this.singlePaymentSrv.CONSTANTS.DOWNLOAD_FILE,
    //       this.ottDetails.supportingDocFilename, this.ottDetails.supportingDocSysfilename);
    //   }
  }
  ngOnDestroy() {
    this.unsub$.unsubscribe();
    this.unsub1$.next();
    this.unsub1$.complete();
    this.unsub1$.unsubscribe();
  }
}
