import {Component, ElementRef, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren} from '@angular/core';
import {TransactionQueryService} from "../transaction-query.service";
import {ActivatedRoute, Router} from '@angular/router';
import {ObjTransferService} from 'src/app/services/aps-services/obj-transfer.service';
import {HelpPageService} from 'src/app/components/help-page/help-page.service';
import {ListingService} from 'src/app/listing/listing.service';
import {shareReplay, takeUntil, tap} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {TranslatePipe} from '@ngx-translate/core';
import {typeFilterData} from "../../../../../services/general.service";
import {ToastService} from "../../../../../services/aps-services/toast-service";

export const paymentProductFilter = [{
    displayName: "Product",
    name: "product",
    type: 'select',
    url: 'paypro/generalService/private/getValueByType',
    onChangeEvent: true,
    reqData: typeFilterData('2450'),
    mandatory: true
}];
export const paymentTransactionQueryFilter = [
    {
        displayName: "Payment Method",
        name: "PaymentMethodId",
        type: 'select',
        url: 'paypro/transactionQuery/private/getAllPaymentMethods',
        mandatory: false
    },
    {
        displayName: "Channel",
        name: "Channel",
        type: "select",
        url: "paypro/transactionQuery/private/getAllChannels",
    },
    {
        displayName: "Batch Number",
        name: "BatchNo",
        type: 'String',
    },
    {
        displayName: "Beneficiary Name",
        name: "BeneficiaryName",
        type: 'String',
    },
    {
        displayName: "Value Date",
        type: "Date",
        rangeFilter: true,
        childFilters: [
            {name: "ActivationStartDate", type: "Date"},
            {name: "ActivationEndDate", type: "Date"}
        ]
    },
    {
        displayName: "Transaction Date",
        type: "Date",
        rangeFilter: true,
        childFilters: [
            {name: "TransactionStartDate", type: "Date"},
            {name: "TransactionEndDate", type: "Date"}
        ]
    },
    {
        displayName: "Instrument Date",
        type: "Date",
        rangeFilter: true,
        childFilters: [
            {name: "InstrumentStartDate", type: "Date"},
            {name: "InstrumentEndDate", type: "Date"}
        ]
    },
    {
        displayName: "Instrument Number",
        type: "String",
        rangeFilter: true,
        childFilters: [
            {name: "InstrumentStartNo"},
            {name: "InstrumentEndNo"}
        ]
    },
    {
        displayName: "Corporate Reference Number",
        name: "CorporateRefNo",
        type: "String",
    },
    {
        displayName: "Transaction Number",
        name: "UtrNo",
        type: "String",
    },
    {
        displayName: "SI Batch Number",
        name: "BankRefNo",
        type: "String",
    },
    {
        displayName: "Amount",
        type: "amount",
        rangeFilter: true,
        childFilters: [
            {name: "StartAmount"},
            {name: "EndAmount"}
        ]
    },
];


@Component({
    selector: 'app-payment-transaction-query',
    templateUrl: './payment-transaction-query.page.html',
    styleUrls: ['./payment-transaction-query.page.scss'],
    providers: [TranslatePipe]
})
export class PaymentTransactionQueryPage implements OnInit, OnDestroy {

    dataItemList: any = [];
    unsub$ = new Subject();
    @ViewChildren("sliding") sliding: QueryList<ElementRef>;
    @ViewChild("contentBox", {static: false}) contentBox: ElementRef;
    selectedProduct$;

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
        this.txnQueryService.paymentTxnQueryResponseData$.next(null);
    }

    ionViewDidEnter() {
        this.dataItemList = [];
        this.txnQueryService.paymentTxnQueryResponseData$
            .pipe(takeUntil(this.unsub$))
            .subscribe(value => {
                if (value != null) {
                    this.dataItemList = value;
                    this.parseViewData();
                }
            });

        this.txnQueryService.clickedHelp$
            .pipe(takeUntil(this.unsub$))
            .subscribe((val) => {
                if (val === 'PAYMENTREQUEST') {
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
                paymentMethodCode: element["Payment Method Code"],
                paymentMethodType: element["Payment Type"],
                batchNo: element["Batch No."],
                valueDate: element['Value Date'],
                channel: element.Channel,
                paymentType: element["Payment Type"],
                beneficiary: element.Beneficiary,
                instrumentDate: element["Instrument Date"],
                instrumentNo: element["Instrument No"],
                debitAccountNo: element["Debit Account No."],
                amount: element.Amount,
                statusOfInstrument: element["Status of Instrument"],
                rejectReason: element['Reject Reason'],
                action: element.Action,
                moduleType: element['Module Type']
            });
        });
        this.dataItemList = dataItems;
    }

    view(details, index) {
        this.objTransSrv.setObjData("details", {
            details,
            ajaxUrl: "paypro/transactionQuery/private/viewInstrumentDetails",
        });
        //  this.router.navigate(["/menu/paypro/view/paymentTransactionQueryView", '']);
        this.router.navigate(["payment-transaction-query-view"], {relativeTo: this.route});
    }

    showHelpPage() {
        const labelArray = [{
            name: 'batchNo',
            text: this.translate.transform("lbl_batch_number")
        }, {
            name: 'beneficiary',
            text: this.translate.transform("lbl_beneficiary")
        }, {
            name: 'valueDate',
            text: this.translate.transform("lbl_value_date")
        }, {
            name: 'statusOfInstrument',
            text: this.translate.transform("lbl_status_of_instrument")
        }, {
            name: 'paymentMethodType',
            text: this.translate.transform("lbl_payment_method")
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

    resetEnquiryData() {
        /*this._listingState.next(null);
        this._dataItemList.next(null);
        this.isNextPageCall = false;
        this.selectedEntityName = null;
        this.loadMoreEvent = null;
        this.isLastPage = false;*/
        this.dataItemList = [];
        // this.headers = [];
    }

    ngOnInit(): void {
        console.log(" payment-transaction-query  INIT");
        this.ionViewDidEnter();
    }

}
