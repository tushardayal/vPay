import {UserService} from 'src/app/services/aps-services/user.service';
import {TransactionCommonService} from 'src/app/Products/transaction-common.service';
import {Component, OnInit} from "@angular/core";
import {ObjTransferService} from 'src/app/services/aps-services/obj-transfer.service';
import {AngularAjaxService} from 'src/app/services/aps-services/ajaxService/angular-ajax.service';
import {RoutingStateService} from 'src/app/services/aps-services/routing-state.service';

@Component({
    selector: "payment-transaction-query-view",
    templateUrl: "./lpopp-transaction-query-view.page.html",
    styleUrls: ["./lpopp-transaction-query-view.page.scss"]
})
export class LpoppTransactionQueryViewPage implements OnInit {
    // id: string;
    dataObj: any;
    backBtnUrl;
    enrichmentArray = [];
    enrichmentMappingDetails = [];
    paymentRequestEnrichmentObj: any = {};
    listData: any = {};
    showDownloadLink = false;
    securityId;
    CONSTANTS = {
        // DOWNLOAD_FILE:'singlePaymentService/private/getSupportingDocDownload',
        // BULK_DOWNLOAD_FILE:'bulkPaymentService/private/supportingDocumentDownload'
    };

    constructor(
        private ajxService: AngularAjaxService,
        private objTransSrv: ObjTransferService,
        private routeState: RoutingStateService,
        private transactionsSrv: TransactionCommonService,
        private userSrv: UserService
    ) {
        this.backBtnUrl = routeState.getPreviousUrl();
       /* userSrv.securityId$.subscribe(id => {
            this.securityId = id;
        });*/
    }

    ngOnInit() {
        this.getDataFromServer();
    }

    getDataFromServer() {
        this.listData = this.objTransSrv.getObjData('details');
        const id = this.listData.details.Id;
        this.objTransSrv.removeObj('details');
        const data = {dataMap: {id, entityKey: "LPOPPREQUEST"}};
        this.ajxService.sendAjaxRequest(this.listData.ajaxUrl, data).subscribe((response: any) => {
            this.dataObj = response;
            console.log("const data", this.dataObj);

        });
    }

    downloadFile() {
        /*let downloadLink;
        if (this.dataObj.supportingDocFilename && this.dataObj.supportingDocSysfilename) {
            downloadLink = this.CONSTANTS.DOWNLOAD_FILE
                + "?uploadFileName=" + encodeURIComponent(this.dataObj.supportingDocFilename)
                + "&systemFileName=" + encodeURIComponent(this.dataObj.supportingDocSysfilename)
                + "&securityId=" + encodeURIComponent(this.securityId);
            // + "&paramter1=" + encodeURIComponent(this.securityId);

            if (this.listData.details.moduleType != "OAT" && this.dataObj.supportingMSTSysFileName) {
                downloadLink = this.CONSTANTS.BULK_DOWNLOAD_FILE
                    + "?supportingDocSysfilename=" + encodeURIComponent(this.dataObj.supportingDocSysfilename)
                    + "&supportingMSTSysFileName=" + encodeURIComponent(this.dataObj.supportingMSTSysFileName)
                    + "&securityId=" + encodeURIComponent(this.securityId);
                // + "&paramter1=" + encodeURIComponent(this.securityId);
            }
            this.ajxService.downloadFile(downloadLink, this.dataObj.supportingDocSysfilename);
        }*/
    }

}
