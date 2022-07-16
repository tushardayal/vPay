import {Component, ElementRef, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren} from '@angular/core';
import {TransactionQueryService} from "../transaction-query.service";
import {ActivatedRoute, Router} from '@angular/router';
import {ObjTransferService} from 'src/app/services/aps-services/obj-transfer.service';
import {HelpPageService} from 'src/app/components/help-page/help-page.service';
import {ListingService} from 'src/app/listing/listing.service';
import {takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {TranslatePipe} from '@ngx-translate/core';
import {ToastService} from "../../../../../services/aps-services/toast-service";

@Component({
    selector: 'app-lpopp-transaction-query',
    templateUrl: './lpopp-transaction-query.page.html',
    styleUrls: ['./lpopp-transaction-query.page.scss'],
    providers: [TranslatePipe]
})
export class LpoppTransactionQueryPage implements OnInit, OnDestroy {
    dataItemList: any[] = [];
    unsub$ = new Subject();
    @ViewChildren("sliding") sliding: QueryList<ElementRef>;
    @ViewChild("contentBox", { static: false }) contentBox: ElementRef;
    private loadMoreEvent: any;
    private isNextPageCall: boolean;
    constructor(private txnQueryService: TransactionQueryService,
                private router: Router,
                private route: ActivatedRoute,
                private objTransSrv: ObjTransferService,
                private helpPageSrv: HelpPageService,
                private listingService: ListingService,
                private toastSrv: ToastService,
                private translate: TranslatePipe) {
        console.log("LpoppTransactionQueryPage Constructor");
    }

    ionViewDidEnter() {
        console.log("lpoppTxnQuery viewdidLoad");
        this.dataItemList  = [];
        this.txnQueryService.lpoppTxnQueryResponseData$
            .pipe(takeUntil(this.unsub$))
            .subscribe(value => {
                console.log("#", value);
                if ( value != null ) {
                    this.isNextPageCall ? this.dataItemList.push(...value) : this.dataItemList = value;
                    this.isNextPageCall = false;
                    // this.parseViewData();
                }
            });

        this.txnQueryService.clickedHelp$
            .pipe(takeUntil(this.unsub$))
            .subscribe((val) => {
                if (val === 'LPOPPREQUEST') {
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
        /*this.dataItemList.forEach(element => {
            dataItems.push({
                id: element.Id,
                paymentMethodCode: element["Payment Method Code"],
                paymentMethodType: element["Payment Type"],
                element.BatchNo,
                element.ValueDate,
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
        this.dataItemList = dataItems;*/
    }

    view(details, index) {
        this.objTransSrv.setObjData("details", {
            details,
            ajaxUrl: "paypro/transactionEnquiry/private/view",
          });
         //  this.router.navigate(["/menu/paypro/view/paymentTransactionQueryView", '']);
        this.router.navigate(["lpopp-transaction-query-view"], { relativeTo: this.route });
    }

    showHelpPage() {
        if (this.sliding && this.contentBox) {
            const labelArray = [{
                name: 'batchNo',
                text: this.translate.transform("lbl_batch_no.")
            }, {
                name: 'debitAccountNo',
                text: this.translate.transform("lbl_debit_from_account")
            }, {
                name: 'amount',
                text: this.translate.transform("lbl_total_amount")
            }, {
                name: 'valueDate',
                text: this.translate.transform("lbl_value_date")
            }, {
                name: 'uiStatus',
                text: this.translate.transform("lbl_status")
            }, {
                name: 'institutionType',
                text: this.translate.transform("lbl_institution_type")
            }];
            this.helpPageSrv.showHelpPage({
                labelArray,
                elArray: this.sliding.toArray(),
                elParent: this.contentBox
            });
        }
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

    ngOnDestroy() {
        this.unsub$.next();
        this.unsub$.complete();
        this.unsub$.unsubscribe();
        this.txnQueryService.lpoppTxnQueryResponseData$.next(null);
    }

    ngOnInit(): void {
        console.log(" LPOPPP INIT");
        this.ionViewDidEnter();
    }

    loadMoreData($event: CustomEvent<any>) {
        this.isNextPageCall = true;
        this.loadMoreEvent = event;
        this.txnQueryService.getNextPage()
            .pipe(takeUntil(this.unsub$))
            .subscribe((value) => {
                if (this.loadMoreEvent) {
                    this.loadMoreEvent.target.complete();
                    this.loadMoreEvent.target.disabled = this.txnQueryService.isLastPage;
                }
            });
    }
}
