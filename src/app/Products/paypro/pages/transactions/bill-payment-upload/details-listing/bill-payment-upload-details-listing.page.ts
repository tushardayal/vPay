import {Component, ElementRef, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren} from "@angular/core";
import {ListingService} from "src/app/listing/listing.service";
import {ActivatedRoute, Router} from "@angular/router";
import {TransactionCommonService} from "../../../../../transaction-common.service";
import {Subject} from "rxjs";
import {ObjTransferService} from "src/app/services/aps-services/obj-transfer.service";
import {takeUntil} from 'rxjs/operators';
import {HelpPageService} from "src/app/components/help-page/help-page.service";
import {TranslatePipe} from "@ngx-translate/core";
import {AngularAjaxService} from "src/app/services/aps-services/ajaxService/angular-ajax.service";
import {BillPaymentUploadViewPage} from "../view/bill-payment-upload-view.page";

@Component({
    selector: "app-bill-payment-upload-details-listing",
    templateUrl: "./bill-payment-upload-details-listing.page.html",
    // styleUrls: ["./bill-payment-details-listing.page.scss"],
    providers: [TranslatePipe]
})
export class BillPaymentUploadDetailsListingPage implements OnInit, OnDestroy {

    @ViewChild("dynamicList", {static: false}) dynamicList;
    @ViewChildren("sliding") sliding: QueryList<ElementRef>;
    @ViewChild("contentBox", {static: false}) contentBox: ElementRef;

    // menuEntity = BulkPaymentDetailsEnity;
    dataItemList: any[];
    requestBatchId;
    selectedBatch: any = {};
    refreshTargetEvent;
    listingState;
    private unsub$ = new Subject<any>();
    id: any;

    constructor(
        public transactionService: TransactionCommonService,
        private router: Router,
        private activeRoute: ActivatedRoute,
        private objTransfSrv: ObjTransferService,
        private helpPageSrv: HelpPageService,
        private translate: TranslatePipe,
        private ajaxSerice: AngularAjaxService,
        private listingService: ListingService
    ) {
       /* activeRoute.paramMap
            .pipe(takeUntil(this.unsub$))
            .subscribe((val) => {
                this.requestBatchId = val.get("id");
            });*/

        this.selectedBatch = this.objTransfSrv.getObjData("billBatchData");
        this.objTransfSrv.removeObj('billBatchData');
        // this.listingService.selectedTab = this.menuEntity;
    }

    ngOnInit() {
        this.requestBatchId = this.id;
        this.loadTransactionsData();
    }

    ionViewWillLeave(): void {
        if (!this.objTransfSrv.getObjData("isForView")) {
            this.listingService.selectedTab = this.objTransfSrv.getObjData(
                "billMenuData"
            ).tabData;
            this.objTransfSrv.removeObj('isForView');
            this.objTransfSrv.removeObj('billBatchData');
        }
    }

    loadTransactionsData() {
        const data = {
            dataMap: {
                id: this.requestBatchId
            }
        };
        this.listingState = 'loading';
        this.ajaxSerice.sendAjaxRequest('billPaymentUploadService/private/viewUpload', data, 'POST', false)
            .pipe(takeUntil(this.unsub$))
            .subscribe((response) => {
                this.dataItemList = [];
                this.selectedBatch = {...this.selectedBatch, ...response};
                if (response && response.dataList) {
                    for (const value of response.dataList) {
                        const dataItem: any = {};
                        // tslint:disable-next-line:forin
                        for (const index in response.headers) {
                            const displayName = response.headers[index].displayName;
                            dataItem[displayName] = value[index];
                        }
                        dataItem.links = [];
                        this.dataItemList.push(dataItem);
                    }
                }
                this.parseViewData();
                if (this.dataItemList.length > 0) {
                    this.listingState = 'success';
                } else {
                    this.listingState = 'notFound';
                }
                if (this.refreshTargetEvent) {
                    try {
                        this.refreshTargetEvent.target.complete();
                    } catch (e) {
                        console.log(e);
                    }
                }
            });
    }

    parseViewData() {
        const dataItems = [];
        if (this.dataItemList == null) {
            return;
        }
        this.dataItemList.forEach((element) => {
            const actions = [];
            dataItems.push({
                id: element.Id,
                consumerName: element["Consumer Name"],
                productName: element["Product Name"],
                billAmount: element["Bill Amount"],
                paymentAmount: element["Payment Amount"],
                debitAccountNo: element["Debit Account"],
                billDate: element["Bill Date"],
                dueDate: element["Due Date"],
                consumerNo: element["Consumer No"],
                ref2: element["Ref-2"],
                lastAction: element["Last Action"],
                rejectReason: element["Reject Reason"],
                actions: element.actions,
            });
        });
        this.dataItemList = dataItems;
        console.log("pass", this.dataItemList);
    }

    view(item, $event: MouseEvent, index) {
        this.objTransfSrv.setObjData("isForView", true);
        this.selectedBatch.headers.map((a, i) => a.value = this.selectedBatch.dataList[index][i]);
        console.log("view headers", this.selectedBatch.headers);
        this.objTransfSrv.setObjData("requestBatchId", this.selectedBatch.headers);
        this.transactionService.viewInModal(item.id, BillPaymentUploadViewPage);
        // this.router.navigate(["/menu/paypro/view/billPaymentUpload", 'viewOnly']);
    }

    doRefresh(event) {
        this.refreshTargetEvent = event;
        this.loadTransactionsData();
    }

    onActionClicked(arr) {
        const event = arr[0];
        if (event) {
            event.stopPropagation();
        }
        this.dynamicList.closeSlidingItems();
        this.transactionService.onActionClicked(arr);
    }

    ngOnDestroy() {
        this.unsub$.next();
        this.unsub$.complete();
        this.unsub$.unsubscribe();
    }

    showHelpPage() {
        const labelArray = [
            {name: 'consumerName', text: this.translate.transform("lbl_consumer_name")},
            // {name: 'productName', text: this.translate.transform("lbl_product_name")},
            {name: 'consumerNo', text: this.translate.transform("lbl_consumer_no")},
            {name: 'billDate', text: this.translate.transform("lbl_bill_date")},
            {name: 'lastAction', text: this.translate.transform("lbl_last_action")},
            {name: 'dueDate', text: this.translate.transform("lbl_due_date")},
            {name: 'billAmount', text: this.translate.transform("lbl_bill_amount")}
        ];
        this.helpPageSrv.showHelpPage({
            labelArray,
            elArray: this.sliding.toArray(),
            elParent: this.contentBox
        });
    }

}
