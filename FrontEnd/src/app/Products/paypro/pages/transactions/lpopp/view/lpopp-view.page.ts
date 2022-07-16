import {Component, Input, OnDestroy, OnInit} from "@angular/core";
import {ListingService} from "src/app/listing/listing.service";
import {ActivatedRoute} from "@angular/router";
import {Subscription} from 'rxjs';
import {TransactionCommonService} from "../../../../../transaction-common.service";

@Component({
    selector: "app-lpopp-view",
    templateUrl: "./lpopp-view.page.html",
    styleUrls: ["./lpopp-view.page.scss"]
})
export class LpoppViewPage implements OnInit, OnDestroy {
    id: string;
    dataObj;
    unsub$: Subscription;

    constructor(
        private listingSrv: ListingService,
        private navParams: ActivatedRoute,
        public transactionsSrv: TransactionCommonService
    ) {
        /*navParams.paramMap.subscribe(val => {
            this.id = val.get("id");
            if (this.id) {
                this.unsub$ = listingSrv.view(this.id).subscribe(data => {
                    this.dataObj = data;
                    console.log(this.dataObj);
                });
            }
        });*/
    }

    ngOnInit() {
        this.unsub$ = this.listingSrv.view(this.id).subscribe(data => {
            this.dataObj = data;
            console.log(this.dataObj);
        });
    }

    /*donloadFile() {
      if (this.paymentRequestDetails.supportingDocSysfilename && this.paymentRequestDetails.supportingDocFilename) {
          this.transactionsSrv.downloadFile(this.singlePaymentSrv.CONSTANTS.DOWNLOAD_FILE,
            this.paymentRequestDetails.supportingDocFilename, this.paymentRequestDetails.supportingDocSysfilename);
        }
    }*/
    ngOnDestroy() {
        this.unsub$.unsubscribe();
    }

}
