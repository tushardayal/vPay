import { Component, OnInit, OnDestroy } from "@angular/core";
import { ListingService } from "src/app/listing/listing.service";
import { ActivatedRoute } from "@angular/router";
import { Subscription } from 'rxjs';
import { SinglePaymentService } from '../../../single-payment-intiate/single-payment.service';
import { TransactionCommonService } from '../../../../../transaction-common.service';
import { UserService } from 'src/app/services/aps-services/user.service';

@Component({
  selector: "single-payment-view",
  templateUrl: "./single-payment-view.page.html",
  styleUrls: ["./single-payment-view.page.scss"]
})
export class SinglePaymentViewPage implements OnInit, OnDestroy {
  id: string;
  dataObj;
  paymentRequestDetails: any = {};
  enrichmentArray = [];
  enrichmentMappingDetails = [];
  paymentRequestEnrichmentObj: any = {};
  unsub$: Subscription;
  SHOW_CHARGES_AND_REMITTANCE_PURPOSE = true;
  constructor(
    private listingSrv: ListingService,
    private navParams: ActivatedRoute,
    private singlePaymentSrv: SinglePaymentService,
    public transactionsSrv: TransactionCommonService,
    private usrSrv: UserService
  ) {
    /*navParams.paramMap.subscribe(val => {
      this.id = val.get("id");
      this.unsub$ = listingSrv.view(this.id).subscribe(data => {
        this.dataObj = data;
        console.log(this.dataObj);
        this.paymentRequestDetails = this.dataObj.paymentRequestDetails[0];
        this.getEnrichments(this.paymentRequestDetails.corporateProductId);
      });
    });*/
  }

  ngOnInit() {
    this.unsub$ = this.listingSrv.view(this.id).subscribe(data => {
      this.dataObj = data;
      console.log(this.dataObj);
      this.paymentRequestDetails = this.dataObj.paymentRequestDetails[0];
      this.getEnrichments(this.paymentRequestDetails.corporateProductId);
    });
  }
  donloadFile() {
    if (this.paymentRequestDetails.supportingDocSysfilename && this.paymentRequestDetails.supportingDocFilename) {
        this.transactionsSrv.downloadFile(this.singlePaymentSrv.CONSTANTS.DOWNLOAD_FILE,
          this.paymentRequestDetails.supportingDocFilename, this.paymentRequestDetails.supportingDocSysfilename);
      }
  }
  ngOnDestroy() {
    this.unsub$.unsubscribe();
  }

  getEnrichments(corporateProductId) {
    const dataToBeSent = {
      filters: []
    };
    dataToBeSent.filters.push({
      name: "corporateProductId",
      value: corporateProductId,
      type: "String",
    });

    dataToBeSent.filters.push({
      name: "corporateId",
      value: this.usrSrv.getUserDetails()
        ? this.usrSrv.getUserDetails().corporateId
        : undefined,
      type: "String",
    });

    this.singlePaymentSrv
      .getEnrichments(dataToBeSent)
      .subscribe((response) => {
        this.paymentRequestEnrichmentObj = response;
        this.enrichmentMappingDetails = this.paymentRequestEnrichmentObj.enrichmentMappingDetails;
        if (this.paymentRequestEnrichmentObj.enrichmentMappingDetails && this.paymentRequestDetails.enrichments) {
          for (let i = 0; i < this.paymentRequestEnrichmentObj.enrichmentMappingDetails.length; i++) {
            this.enrichmentArray.push(this.paymentRequestDetails.enrichments[0]['enrichment' + (i + 1)]);
          }
        }
      });
  }


}
