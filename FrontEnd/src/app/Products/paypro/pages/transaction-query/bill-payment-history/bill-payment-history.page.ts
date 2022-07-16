import {Component, OnDestroy, ViewChildren, ViewChild, QueryList, ElementRef} from '@angular/core';
import {TransactionQueryService} from "../transaction-query.service";
import { Router, ActivatedRoute } from '@angular/router';
import { ObjTransferService } from 'src/app/services/aps-services/obj-transfer.service';
import { Subject } from 'rxjs';
import { ListingService } from 'src/app/listing/listing.service';
import { HelpPageService } from 'src/app/components/help-page/help-page.service';
import { takeUntil } from 'rxjs/operators';
import { TranslatePipe } from '@ngx-translate/core';
import {ToastService} from "../../../../../services/aps-services/toast-service";

export const billPaymentHistoryFilter = [
    {
        displayName: "Biller Name",
        type: 'select',
        name: 'billerId',
        url: 'billPaymentHistoryService/private/getBillerList',
        mandatory: true
    },
    {
        displayName: "Channel",
        name: "makerChannel",
        type: 'select',
        url: 'billPaymentHistoryService/private/getAllChannels'
    },
    {
        displayName: "Consumer Name",
        type: 'String',
        name: "subscriberName",
        mandatory: true
    },
    {
        displayName: "Reference Field 1",
        type: 'String',
        name: "referenceField1",

    },
    {
        displayName: "Bill Date",
        type: "Date",
        rangeFilter: true,
        childFilters: [
            {name: "billFromDate", type: "Date"},
            {name: "billToDate", type: "Date"}
        ]
    },
    {
        displayName: "Bill Due Date",
        type: "Date",
        rangeFilter: true,
        childFilters: [
            {name: "billDueDateFrom", type: "Date"},
            {name: "billDueDateTo", type: "Date"}
        ]
    },
    {
        displayName: "Status",
        name: "cmbstatus",
        type: 'select',
        url: 'billPaymentHistoryService/private/getBillPaymentStatus'
    },
    {
        displayName: "Transaction ID",
        name: "batchNo",
        type: 'String',
    },
    {
        displayName: "Product",
        name: "productName",
        type: 'String',
    },
    {
        displayName: "Amount",
        type: "amount",
        rangeFilter: true,
        childFilters: [
            {name: "fromAmount"},
            {name: "toAmount"}
        ]
    },
];

@Component({
    selector: 'app-bill-payment-history',
    templateUrl: './bill-payment-history.page.html',
    styleUrls: ['./bill-payment-history.page.scss'],
    providers: [TranslatePipe]
})
export class BillPaymentHistoryPage implements OnDestroy {

    dataItemList: any = [];
    unsub$ = new Subject();
    @ViewChildren("sliding") sliding: QueryList<ElementRef>;
    @ViewChild("contentBox", { static: false }) contentBox: ElementRef;
    constructor(private txnQueryService: TransactionQueryService,
                private router: Router,
                private route: ActivatedRoute,
                private objTransSrv: ObjTransferService,
                private helpPageSrv: HelpPageService,
                private listingService: ListingService,
                private toastSrv: ToastService,
                private translate: TranslatePipe) {

    }

    ngOnDestroy() {
        this.unsub$.next();
        this.unsub$.complete();
        this.unsub$.unsubscribe();
        this.txnQueryService.billPaymentResponseData$.next(null);
    }

    ionViewDidEnter() {
        this.dataItemList = [];
        this.txnQueryService.billPaymentResponseData$
            .pipe(takeUntil(this.unsub$))
            .subscribe((value: any) => {
                if ( value != null ) {
                    this.dataItemList = value;
                    this.parseViewData();
                }
            });

        this.txnQueryService.clickedHelp$
            .pipe(takeUntil(this.unsub$))
            .subscribe((val) => {
                if (val === 'BILLPAYMENTHISTORY') {
                    if (this.dataItemList && this.dataItemList.length === 0 ) {
                        this.toastSrv.presentToast('No Data Found');
                        return;
                    }
                    this.showHelpPage();
                }
            });
      }

      parseViewData() {
        const dataItems = [];
        if (this.dataItemList == null) {
            return;
        }
        this.dataItemList.forEach(element => {
            dataItems.push({
                id: element.Id,
                serviceProvider: element["Service Provider"],
                consumerName: element["Consumer Name"],
                valueDate: element['Bill Date'],
                serviceType: element["Service Type"],
                accountNumber: element["Account Number"],
                transactionID: element["Transaction ID"],
                amount: element.Amount,
                ahannel: element.Channel,
                Status: element.Status,
                failReason: element["Fail Reason"],
            });
        });
        this.dataItemList = dataItems;
    }


    view(details, $event) {

        this.objTransSrv.setObjData("details", {
            details,
            ajaxUrl: "billPaymentHistoryService/private/view",
          });
        this.router.navigate(["bill-payment-history-view"], { relativeTo: this.route });
    }

    showHelpPage() {
        const labelArray = [{
            name: 'serviceProvider',
            text: this.translate.transform("lbl_service_provider")
        }, {
            name: 'transactionID',
                text: this.translate.transform("lbl_transaction_id")
        }, {
            name: 'valueDate',
                text: this.translate.transform("lbl_bill_date")
        }, {
            name: 'accountNumber',
                text: this.translate.transform("lbl_account_number")
        }, {
            name: 'serviceType',
                text: this.translate.transform("lbl_service_Type")
        }, {
            name: 'amount',
                text: this.translate.transform("lbl_currency_amount")
        }];
        this.helpPageSrv.showHelpPage({
            labelArray,
            elArray: this.sliding.toArray(),
            elParent: this.contentBox
        });
    }
}
