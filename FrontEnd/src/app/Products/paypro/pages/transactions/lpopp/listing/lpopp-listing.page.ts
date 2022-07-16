import {ChangeDetectorRef, Component, ElementRef, OnDestroy, QueryList, ViewChild, ViewChildren} from "@angular/core";
import * as _ from "lodash";
import {BaseTransaction} from "../../../../../interfacaes/base-transaction";
import {ListingService} from "src/app/listing/listing.service";
import {TransactionCommonService} from "../../../../../transaction-common.service";
import {Router} from "@angular/router";
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {HelpPageService} from 'src/app/components/help-page/help-page.service';
import {TranslatePipe} from '@ngx-translate/core';
import {AngularAjaxService} from "../../../../../../services/aps-services/ajaxService/angular-ajax.service";
import {ModalController} from "@ionic/angular";
import {LpoppViewPage} from "../view/lpopp-view.page";
import {LpoppReceiptComponent} from "../lpopp-receipt/lpopp-receipt.component";
import {Filter} from "../../../../../../interfaces/generic-interfaces";

@Component({
    selector: "lpopp-listing",
    templateUrl: "./lpopp-listing.page.html",
    styleUrls: ["./lpopp-listing.page.scss"],
    providers: [TranslatePipe]
})
export class LpoppListingPage implements OnDestroy, BaseTransaction {
    @ViewChildren("sliding") sliding: QueryList<ElementRef>;
    @ViewChild("contentBox", {static: false}) contentBox: ElementRef;
    @ViewChild("dynamicList", {static: false}) dynamicList;
    multiSelectionMode;
    dataItemList: any[] = [];
    loadMoreEvent;
    dataItemList$;
    unsub$ = new Subject();
    CONSTANTS = {
        GET_INSTITUTIONTYPES : 'paypro/lpoppRequestService/private/getInstitutionTypes'
    };

    constructor(
        public listingService: ListingService,
        public transactionService: TransactionCommonService,
        private router: Router,
        private cdr: ChangeDetectorRef,
        private helpPageSrv: HelpPageService,
        private translate: TranslatePipe,
        public modalController: ModalController,
        private ajaxService: AngularAjaxService
    ) {
        console.log("SinglePaymentListPage constructor");
    }

    ionViewDidEnter() {
        this.dataItemList$ = this.listingService.dataItemList$
            .pipe(takeUntil(this.unsub$)).subscribe((val) => {
                if (this.checkForCurrenctEntity()) {
                    if (this.loadMoreEvent) {
                        this.loadMoreEvent.target.disabled = this.listingService.isLastPage;
                    }
                    this.dataItemList = val;
                    if (this.dataItemList) {
                        this.parseViewData();
                    }
                }
            });
        console.log("item route");
        this.listingService.multiSelectionMode$
            .pipe(takeUntil(this.unsub$))
            .subscribe(
                (value) => (this.multiSelectionMode = value)
            );

        this.listingService.clickedHelp$
            .pipe(takeUntil(this.unsub$))
            .subscribe((val) => {
                if (val) {
                    this.showHelpPage();
                }
            });

        this.listingService.modifyFilters$
            .pipe(takeUntil(this.unsub$))
            .subscribe((filters: Filter[]) => {
                if (!this.checkForCurrenctEntity() && filters == null) {
                    return;
                }
                console.log("Filters", filters);

                const data = {};
                this.listingService.getFilterDropdownOptions(this.CONSTANTS.GET_INSTITUTIONTYPES, data)
                    .pipe(takeUntil(this.unsub$))
                    .subscribe(statusData => {
                        filters.map(filter => {
                            if (filter.type === "select" && filter.name === "institutionTypeValue") {
                                filter.options = statusData.dataList.map(a => {
                                    a.id = a.displayName;
                                    return a;
                                });
                            }
                        });
                        this.listingService.setFilters(filters);
                    });
            });

    }

    ngOnDestroy() {
        this.unsub$.next();
        this.unsub$.complete();
        this.unsub$.unsubscribe();
        this.dataItemList$.unsubscribe();
    }

    parseViewData() {
        const dataItems = [];
        if (this.dataItemList == null) {
            return;
        }
        this.dataItemList.forEach((element) => {
            dataItems.push({
                id: element.Id,
                batchNo: element.BatchNo,
                uiStatus: element.UiStatus,
                institutionType: element.InstitutionTypeValue,
                valueDate: element.ValueDate,
                totalAmount: element.TotalAmount,
                debitAccountNo: element.DebitAccountNo,
                channel: element.MakerChannel,
                rejectReason: element.RejectReason,
                selected: element.selected,
                actions: element.actions,
            });
        });
        this.dataItemList = dataItems;
        console.log("pass", this.dataItemList);
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

    viewTransactionCommonService(item, $event: MouseEvent) {
        if (this.multiSelectionMode) {
            this.selectItem(item);
            return;
        } else {
            this.goToViewPage(item);
            // this.router.navigate(["/menu/paypro/view/lpopp", item.id]);
        }
        console.log("view Id", item.id);
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
        const fun = arr[1];
        const item = arr[2];
        if (event) {
            event.stopPropagation();
        }
        this.dynamicList.closeSlidingItems();
        if (fun && fun.includes('receipt(')) {
            const id = this.transactionService.getId(fun, 'receipt(');
            this.receipt(id);
            return;
        }
        this.transactionService.onActionClicked(arr);
    }

    goToViewPage(item) {
        this.transactionService.viewInModal(item.id, LpoppViewPage);
        // this.router.navigate(["menu", "paypro", "view", "lpopp", item.id]);
    }

    view(item, $event: MouseEvent): void {
        if (this.multiSelectionMode) {
            this.selectItem(item);
            return;
        } else {
            // this.transactionService.view(item.id);
            this.goToViewPage(item);
        }
    }

    doRefresh(event) {
        this.transactionService.doRefresh(event);
    }

    showHelpPage() {
        let labelArray = [{
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
        if ('REJECTLIST' === this.listingService.currentListType.key) {
            labelArray = labelArray.filter(f => f.name !== 'uiStatus');
        }
        this.helpPageSrv.showHelpPage({
            labelArray,
            elArray: this.sliding.toArray(),
            elParent: this.contentBox
        });
    }

    async receipt(id: string) {

        const modal = await this.modalController.create({
            component: LpoppReceiptComponent,
            componentProps: {
                id,
            },
            id: 'lpopp-receipt'
        });
        return await modal.present();
        // this.router.navigate(["/menu/paypro/lpopp-receipt", id]);
    }


    private checkForCurrenctEntity(): boolean {
        return this.listingService.selectedTab.entityName === "LPOPPREQUEST";
    }
}
