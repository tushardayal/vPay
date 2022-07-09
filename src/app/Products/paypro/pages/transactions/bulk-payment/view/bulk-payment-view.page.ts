import {Component, OnDestroy, OnInit} from "@angular/core";
import {ActivatedRoute} from "@angular/router";
import {AngularAjaxService} from "src/app/services/aps-services/ajaxService/angular-ajax.service";
import {takeUntil} from "rxjs/operators";
import {Subject} from "rxjs";
import {ObjTransferService} from "src/app/services/aps-services/obj-transfer.service";
import {TransactionCommonService} from "../../../../../transaction-common.service";
import {UserService} from "../../../../../../services/aps-services/user.service";
import {ListingService} from "../../../../../../listing/listing.service";
import {bulkPaymentDetailsListingGuard} from "../details-listing/bulk-payment-details-guard";

@Component({
  selector: "bulk-payment-view",
  templateUrl: "./bulk-payment-view.page.html",
  styleUrls: ["./bulk-payment-view.page.scss"],
})
export class BulkPaymentViewPage implements OnInit, OnDestroy {
  id: string;
  parentId: string;
  bulkSrvObj;
  paymentRequestDetails;
  enrichmentMappingDetails = [];
  unsub$ = new Subject();
  SHOW_CHARGES_AND_REMITTANCE_PURPOSE = true;
  enrichmentArray = [];
  CONSTANTS = {
    GET_ENRICHMENTS: 'singlePaymentService/private/getEnrichmentMapping'
  };
  enrichmentMapKeyVal: {};

  constructor(
    private navParams: ActivatedRoute,
    private ajaxService: AngularAjaxService,
    private objTransSrv: ObjTransferService,
    public transactionsSrv: TransactionCommonService,
    private usrSrv: UserService,
    private bulkPaymentDetailsListingSrv: bulkPaymentDetailsListingGuard,
    private listingService: ListingService
  ) {
    this.bulkSrvObj = objTransSrv.getObjData("bulkMenuData").tabData;
    /*navParams.paramMap.subscribe((val) => {
      this.id = val.get("id");
    });*/
  }

  ngOnInit() {
    if (this.objTransSrv.getObjData("requestBatchId")) {
      this.parentId = this.objTransSrv.getObjData("requestBatchId");
      this.objTransSrv.removeObj("requestBatchId");
    } else {
      const filter = this.listingService.defaultCurrentfilter.filter(v => v.name === 'requestBatchId');
      this.parentId = filter[0].value;
    }
    this.view(this.id);
  }

  identify(index, item) {
    return item.id;
  }
  ionViewWillLeave() {
    this.objTransSrv.setObjData("isForView", false);
  }
  view(id: string) {
    const inputData = {
      dataMap: { id },
    };
    const url = this.bulkSrvObj.serviceUrl + "/private/viewTransactionDetails";
    this.ajaxService
      .sendAjaxRequest(url, inputData)
      .pipe(takeUntil(this.unsub$))
      .subscribe((response: any) => {
          this.paymentRequestDetails = response;
          const viewUrl = this.bulkSrvObj.serviceUrl + "/private/view";
          inputData.dataMap.id = this.parentId;
          this.ajaxService
            .sendAjaxRequest(viewUrl, inputData)
            .pipe(takeUntil(this.unsub$))
            .subscribe((viewResponse: any) => {
              this.getEnrichments(viewResponse.corporateProductId);
            });
      });


  }

  getEnrichments(mstCorporateProductId) {
    const dataToBeSent = {
      filters: []
    };
    dataToBeSent.filters.push({
      name: "corporateProductId",
      value: this.paymentRequestDetails.corporateProductId,
      type: "String",
    });

    dataToBeSent.filters.push({
      name: "corporateId",
      value: this.usrSrv.getUserDetails()
          ? this.usrSrv.getUserDetails().corporateId
          : undefined,
      type: "String",
    });

    dataToBeSent.filters.push({
      name: "mstCorporateProductId",
      value: mstCorporateProductId,
      type: "String",
    });

    this.ajaxService
        .sendAjaxRequest(this.CONSTANTS.GET_ENRICHMENTS, dataToBeSent)
        .subscribe((response) => {
          this.enrichmentMappingDetails = response.enrichmentMappingDetails;
          if (this.paymentRequestDetails && this.paymentRequestDetails.enrichments && this.paymentRequestDetails.enrichments.length) {
            this.configureEnrichments(this.paymentRequestDetails.enrichments)
            for (let i = 0; i < this.enrichmentMappingDetails.length; i++) {
              this.enrichmentArray.push(this.paymentRequestDetails.enrichments[0]['enrichment' + (i + 1)]);
            }
          }
        });
  }
  configureEnrichments(paymentRequestEnrichment: any) {
    this.enrichmentMapKeyVal = {};
    for (const enrich of this.enrichmentMappingDetails) {
      const seqNo = enrich.enrichmentSequenceNo;
      const seqId = enrich.id;
      this.enrichmentMapKeyVal[seqId] = [];
      let foundVal = false;
      for (const j in paymentRequestEnrichment){
        if (paymentRequestEnrichment[j].hasOwnProperty('enrichment' + seqNo)) {
          const valueToPut = paymentRequestEnrichment[j]['enrichment' + seqNo];
          this.enrichmentMapKeyVal[seqId].push(valueToPut);
          foundVal = true;
        } else {
          this.enrichmentMapKeyVal[seqId].push("");
        }
      }
      if (!foundVal) {
        delete this.enrichmentMapKeyVal[seqId];
      }
    }

  }

  donloadFile() {}
  ngOnDestroy() {
    this.unsub$.next();
    this.unsub$.complete();
    this.unsub$.unsubscribe();
  }
}
