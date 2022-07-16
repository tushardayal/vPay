import {Component, OnDestroy, OnInit} from "@angular/core";
import {ListingService} from "src/app/listing/listing.service";
import {ActivatedRoute} from "@angular/router";
import {Subscription} from 'rxjs';
import {OwnAccountSummaryService} from '../../../own-account-transfer-initiate/own-account-summary.service';
import {TransactionCommonService} from '../../../../../transaction-common.service';

@Component({
  selector: "app-own-account-transfer-view",
  templateUrl: "./own-account-transfer-view.page.html",
  styleUrls: ["./own-account-transfer-view.page.scss"]
})
export class OwnAccountTransferViewPage implements OnInit, OnDestroy {
  id: string;
  dataObj: any;
  unsub$: Subscription;
  constructor(
    private listingSrv: ListingService,
    private navParams: ActivatedRoute,
    private oatSrv: OwnAccountSummaryService,
    public transactionsSrv: TransactionCommonService
  ) {
    /*navParams.paramMap.subscribe(val => {
      this.id = val.get("id");
      this.unsub$ = listingSrv.view(this.id).subscribe(data => {
        this.dataObj = data;
      });
    });*/
  }

  donloadFile() {
    if (this.dataObj.supportingMSTSysFileName && this.dataObj.supportingMSTFileName) {
        this.transactionsSrv.downloadFile(this.oatSrv.CONSTANTS.DOWNLOAD_FILE,
          this.dataObj.supportingMSTFileName, this.dataObj.supportingMSTSysFileName);
      }
  }
  ngOnInit() {
    this.unsub$ = this.listingSrv.view(this.id).subscribe(data => {
      this.dataObj = data;
    });
  }

  ngOnDestroy() {
    this.unsub$.unsubscribe();
  }
}
