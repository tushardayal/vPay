import {Component, OnDestroy, OnInit} from "@angular/core";
import {ActivatedRoute} from "@angular/router";
import {AngularAjaxService} from "src/app/services/aps-services/ajaxService/angular-ajax.service";
import {takeUntil} from "rxjs/operators";
import {Subject} from "rxjs";
import {ObjTransferService} from "src/app/services/aps-services/obj-transfer.service";
import {TransactionCommonService} from "../../../../../transaction-common.service";
import {UserService} from "../../../../../../services/aps-services/user.service";
import {ListingService} from "../../../../../../listing/listing.service";
import {RoutingStateService} from "../../../../../../services/aps-services/routing-state.service";
import {TranslatePipe} from "@ngx-translate/core";

@Component({
  selector: "bill-payment-upload-view",
  templateUrl: "./bill-payment-upload-view.page.html",
  styleUrls: ["./bill-payment-upload-view.page.scss"],
  providers: [TranslatePipe]
})
export class BillPaymentUploadViewPage implements OnDestroy, OnInit {
  id: string;
  parentId: string;
  bulkSrvObj;
  paymentDetails;
  billUploadData: any;
  // enrichmentMappingDetails = [];
  unsub$ = new Subject();
  // enrichmentArray = [];
  /*CONSTANTS = {
    GET_ENRICHMENTS: 'singlePaymentService/private/getEnrichmentMapping'
  };*/
  enrichmentMapKeyVal: {};

  constructor(
      private navParams: ActivatedRoute,
      private ajaxService: AngularAjaxService,
      private objTransSrv: ObjTransferService,
      public transactionsSrv: TransactionCommonService,
      private usrSrv: UserService,
      private listingService: ListingService,
      private routingState: RoutingStateService
  ) {
    this.bulkSrvObj = objTransSrv.getObjData("billMenuData").tabData;
    /*navParams.paramMap.subscribe((val) => {
      if (!routingState.getPreviousUrl().includes("billPayementUploadTransactionLevelList")) {
        this.billUploadData = this.objTransSrv.getObjData("requestBatchId");
        this.objTransSrv.removeObj("requestBatchId");
      } else {
        this.id = val.get("id");
        this.view(this.id);

        // const filter = this.listingService.defaultCurrentfilter.filter(v => v.name === 'requestBatchId');
        // this.parentId = filter[0].value;
      }
    });*/

  }

  ngOnInit() {
    // if (!this.routingState.getPreviousUrl().includes("billPayementUploadTransactionLevelList")) {
    if (this.objTransSrv.getObjData("requestBatchId")) {
      this.billUploadData = this.objTransSrv.getObjData("requestBatchId");
      this.objTransSrv.removeObj("requestBatchId");
    } else {
      // this.id = val.get("id");
      this.view(this.id);
    }
    console.log('getPreviousUrl ', this.routingState.getPreviousUrl());
  }

  identify(index, item) {
    return item.id;
  }

  ionViewWillLeave() {
    this.objTransSrv.setObjData("isForView", false);
  }

  view(id: string) {
    const inputData = {
      dataMap: {id},
    };
    const url = this.bulkSrvObj.serviceUrl + "/private/viewTransactionDetails";
    this.ajaxService
        .sendAjaxRequest(url, inputData)
        .pipe(takeUntil(this.unsub$))
        .subscribe((response: any) => {
          this.paymentDetails = response;

          // const viewUrl = this.bulkSrvObj.serviceUrl + "/private/view";
          // inputData.dataMap.id = this.parentId;
          /*this.ajaxService
              .sendAjaxRequest(viewUrl, inputData)
              .pipe(takeUntil(this.unsub$))
              .subscribe((viewResponse: any) => {
                // this.getEnrichments(viewResponse.corporateProductId);
              });*/
        });


  }

  /*getEnrichments(mstCorporateProductId) {
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

   /!* this.ajaxService
        .sendAjaxRequest(this.CONSTANTS.GET_ENRICHMENTS, dataToBeSent)
        .subscribe((response) => {
          this.enrichmentMappingDetails = response.enrichmentMappingDetails;
          if (this.paymentRequestDetails && this.paymentRequestDetails.enrichments && this.paymentRequestDetails.enrichments.length) {
            this.configureEnrichments(this.paymentRequestDetails.enrichments)
            for (let i = 0; i < this.enrichmentMappingDetails.length; i++) {
              this.enrichmentArray.push(this.paymentRequestDetails.enrichments[0]['enrichment' + (i + 1)]);
            }
          }
        });*!/
  }*/

  /*configureEnrichments(paymentRequestEnrichment: any) {
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

  }*/

  ngOnDestroy() {
    this.unsub$.next();
    this.unsub$.complete();
    this.unsub$.unsubscribe();
  }
}
