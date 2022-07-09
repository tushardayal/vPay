import {Component, ElementRef, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren} from "@angular/core";
import {ListingService} from "src/app/listing/listing.service";
import {ActivatedRoute, Router} from "@angular/router";
import * as _ from "lodash";
import {TransactionCommonService} from "../../../../../transaction-common.service";
import {Observable, Subject, Subscription} from "rxjs";
import {AuthorizeRejectListingBtnComponent} from "src/app/directives/authorize-reject-listing-btn/authorize-reject-listing-btn.component";
import {ActionUrls, BaseTransaction} from "../../../../../interfacaes/base-transaction";
import {ObjTransferService} from "src/app/services/aps-services/obj-transfer.service";
import {takeUntil} from 'rxjs/operators';
import {HelpPageService} from "src/app/components/help-page/help-page.service";
import {TranslatePipe} from "@ngx-translate/core";
import {billPaymentDetailsEntity} from "./bill-payment-upload-details-enitity";
import {BillPaymentUploadViewPage} from "../view/bill-payment-upload-view.page";

@Component({
    selector: "app-bill-payment-upload-transaction-level-listing",
    templateUrl: "./bill-payment-upload-transaction-level-listing.page.html",
    styleUrls: ["./bill-payment-upload-transaction-level-listing.page.scss"],
    providers: [TranslatePipe]
})
export class BillPaymentUploadTransactionLevelListingPage implements OnInit, OnDestroy, BaseTransaction {
    @ViewChild(AuthorizeRejectListingBtnComponent, {static: false})
    listActionBtns: AuthorizeRejectListingBtnComponent;
    @ViewChild("dynamicList", {static: false}) dynamicList;
    @ViewChildren("sliding") sliding: QueryList<ElementRef>;
    @ViewChild("contentBox", {static: false}) contentBox: ElementRef;

    id;
    menuEntity = billPaymentDetailsEntity;
    multiSelectionMode;
    dataItemList: any[];
    avaliableLists;
    selectedListType;
    requestBatchId;
    selectedBatch: any = {};
    refreshTargetEvent;
    loadMoreEvent;
    dataItemList$: Subscription;
    listingState;
    multiSelectMode: Observable<boolean>;
    private unsub$ = new Subject<any>();

    actionUrls: ActionUrls = {
        AUTHORIZE: 'billPaymentUploadDetService/private/authorize',
        REJECT: 'billPaymentUploadDetService/private/reject',
        ACCEPT_REJECT: 'billPaymentUploadDetService/private/acceptReject',
    };

    constructor(
        private listingService: ListingService,
        public transactionService: TransactionCommonService,
        private router: Router,
        private activeRoute: ActivatedRoute,
        private objTransfSrv: ObjTransferService,
        private helpPageSrv: HelpPageService,
        private translate: TranslatePipe
    ) {
        console.log("bill pending constructor");
        /*activeRoute.paramMap
            .pipe(takeUntil(this.unsub$))
            .subscribe((val) => {
                this.requestBatchId = val.get("id");
            });*/
        this.setListData(this.listingService.currentListType.key);
        this.selectedBatch = this.objTransfSrv.getObjData("billBatchData");
        this.objTransfSrv.removeObj('billBatchData');
    }

    ngOnInit() {
        this.requestBatchId = this.id;
        const filters = [
            {
                name: "uploadMstId",
                value: this.requestBatchId,
                type: "String",
            },
            {
                name: "listingType",
                value: "unauthorized",
                type: "String"
            }
        ];
        this.listingService.defaultCurrentfilter.push(...filters);
        this.setDefaultFilter(this.listingService.currentListType);
        this.listingService.refreshTab();
        this.listingService.listingState$
            .pipe(takeUntil(this.unsub$))
            .subscribe((state) => {
                this.listingState = state;
                if (this.listingState !== 'loading' && this.refreshTargetEvent) {
                    try {
                        this.refreshTargetEvent.target.complete();
                    } catch (e) {
                        console.log(e);
                    }
                }
            });
    }

    ionViewDidEnter() {
        this.listActionBtns.createListType(
            this.selectedListType,
            this.avaliableLists
        );
        console.log('ionViewDidEnter');
        this.dataItemList$ = this.listingService.dataItemList$
            .pipe(takeUntil(this.unsub$))
            .subscribe((val) => {
                if (
                    this.listingService.selectedTab.entityName ===
                    "BILLPAYMENTUPLOADDET"
                ) {
                    if (this.loadMoreEvent) {
                        this.loadMoreEvent.target.complete();
                        this.loadMoreEvent.target.disabled = this.listingService.isLastPage;
                    }
                    this.dataItemList = val;
                    if (this.dataItemList) {
                        this.parseViewData();
                        if (this.refreshTargetEvent) {
                            try {
                                this.refreshTargetEvent.target.complete();
                            } catch (e) {
                                console.log(e);
                            }
                        }
                    }
                }
            });
        this.listingService.multiSelectionMode$
            .pipe(takeUntil(this.unsub$)).subscribe(
            (value) => (this.multiSelectionMode = value)
        );

        this.multiSelectMode = this.listingService.multiSelectionMode$;
        // this.listingService.dataItemList$.subscribe((val) => {
        //   this.dataItemList = val;
        //   this.parseViewData();
        // });
        console.log("item route");
        // this.listingService.multiSelectionMode$.subscribe(
        //   (value) => (this.multiSelectionMode = value)
        // );
    }

    ionViewWillLeave(): void {
        console.log("ionViewWillLeave details");
        if (!this.objTransfSrv.getObjData("isForView")) {
            this.listingService.selectedTab = this.objTransfSrv.getObjData(
                "billMenuData"
            ).tabData;
            this.listingService.currentListType = this.objTransfSrv.getObjData(
                "billMenuData"
            ).selectedListing;
            this.listingService.defaultCurrentfilter = [];
            this.listingService.refreshTab();
            this.listActionBtns.createListType(
                this.listingService.currentListType,
                this.listingService.selectedTab.menuLinksDetail.link,
            );
            this.dataItemList$.unsubscribe();
            this.objTransfSrv.removeObj('isForView');
            this.objTransfSrv.removeObj('billBatchData');
        }
    }

    setListData(type?) {
        this.listingService.selectedTab = this.menuEntity;
        this.avaliableLists = this.menuEntity.menuLinksDetail.link;
        this.selectedListType = _.find(this.avaliableLists, ["key", type]);
        if (this.selectedListType === undefined) {
            this.selectedListType = _.find(this.avaliableLists, [
                "key",
                this.menuEntity.defaultURL,
            ]);
        }
        this.listingService.currentListType = this.selectedListType;
    }

    setDefaultFilter(selectedListType) {
        this.listingService.defaultCurrentfilter.map(a => {
            if (a.name === "listingType") {
                if (selectedListType.key === "REJECTLIST") {
                    a.value = "rejected";
                } else if (selectedListType.key === "PENDINGLIST") {
                    a.value = "unauthorized";
                } else if (selectedListType.key === "AUTHORIZEDLIST") {
                    a.value = "authorized";
                }
            }
        });
    }

    setSelectedListType(selectedListType) {
        this.setDefaultFilter(selectedListType);
        this.selectedListType = selectedListType;
    }

    parseViewData() {
        const dataItems = [];
        if (this.dataItemList == null) {
            return;
        }
        this.dataItemList.forEach((element) => {
            /*if (this.selectedBatch.isTransactionLevelAuth !== 'Y') {
                element.actions = element.actions.filter(item => {
                    if (item.onClick.includes('authorize') || item.onClick.includes('reject')
                        || item.onClick.includes('verify') || item.onClick.includes('decline')) {
                        return false;
                    }
                    return true;
                });
            }*/
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
                selected: element.selected,
                actions: element.actions,
            });
        });
        this.dataItemList = dataItems;
        console.log("parseViewData", this.dataItemList);
    }

    selectItem(item: any) {
        if (!this.transactionService.checkAuthorizationAccess(item.actions)) {
            return;
        }
        item.selected = !item.selected;
        if (item.selected === true) {
            this.listingService.selectedIds.push(item.id);
        } else {
            _.remove(this.listingService.selectedIds, (id) => {
                return id === item.id;
            });
        }
        this.listingService.setMultiSelectionMode(
            _.every(this.dataItemList, ["selected", false]) === false
        );
    }

    view(item, $event: MouseEvent) {
        if (this.multiSelectionMode) {
            this.selectItem(item);
            return;
        } else {
            this.objTransfSrv.setObjData("isForView", true);
            this.transactionService.viewInModal(item.id, BillPaymentUploadViewPage);
            // this.router.navigate(["/menu/paypro/view/billPaymentUpload", item.id]);
        }
        console.log("view Id", item.id);
    }

    doRefresh(event) {
        const filters = [
            {
                name: "requestBatchId",
                value: this.requestBatchId,
                type: "String",
            },
        ];
        this.refreshTargetEvent = event;
        this.listingService.refreshTab();
    }

    loadMoreData(event) {
        this.loadMoreEvent = event;
        this.listingService.getNextPage()
            .pipe(takeUntil(this.unsub$))
            .subscribe((value) => {
                if (this.loadMoreEvent) {
                    this.loadMoreEvent.target.complete();
                    this.loadMoreEvent.target.disabled = this.listingService.isLastPage;
                }
            });
    }

    onActionClicked(arr) {
        const event = arr[0];
        if (event) {
            event.stopPropagation();
        }
        /*if (this.selectedBatch.isTransactionLevelAuth === 'Y') {
            arr[2].isChildRecord = true;
        }*/
        this.dynamicList.closeSlidingItems();
        let url;
        if (arr && arr.length >= 2) {
            if (arr[1].includes("authorize(")) {
                url = this.actionUrls.AUTHORIZE;
            } else if (arr[1].includes("reject(")) {
                url = this.actionUrls.REJECT;
            } else if (arr[1].includes("acceptReject(")) {
                url = this.actionUrls.ACCEPT_REJECT;
            }
        }
        this.transactionService.onActionClicked(arr, url);
    }

    ngOnDestroy() {
        this.dataItemList$.unsubscribe();
        this.unsub$.next();
        this.unsub$.complete();
        this.unsub$.unsubscribe();
    }

    showHelpPage() {
        const labelArray = [
            {name: 'consumerName', text: this.translate.transform("lbl_consumer_name")},
            // {name: 'productName', text: this.translate.transform("lbl_product_name")},
            {name: 'consumerNo', text: this.translate.transform("lbl_consumer_no")},
            {name: 'paymentAmount', text: this.translate.transform("lbl_payment_amount")},
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
