import {Component, OnDestroy, OnInit, ViewChild, AfterViewInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {SuperTabs} from "@ionic-super-tabs/angular";
import {SuperTabChangeEventDetail} from '@ionic-super-tabs/core';
import {ActionSheetController, MenuController} from "@ionic/angular";
import {ListingService} from "./listing.service";
import {Observable, Subject} from "rxjs";
import {takeUntil} from "rxjs/operators";
import * as _ from 'lodash';
import { TransactionService } from '../Products/paypro/pages/transactions';
import { AuthorizeRejectListingBtnComponent } from '../directives/authorize-reject-listing-btn/authorize-reject-listing-btn.component';
import { ObjTransferService } from '../services/aps-services/obj-transfer.service';
import { TradeTransactionService } from '../Products/trade/pages/transactions';
import { DatePipe } from '@angular/common';
import { appConstants } from '../appConstants';
import { TranslatePipe } from '@ngx-translate/core';
import { Filter } from '../interfaces/generic-interfaces';

export interface ITab {
    indexNo: number;
    displayName: string;
    entityName: string;
    url: any; // page
    reqRole: string;
    service?: any;
    defaultURL?: any;
}

@Component({
    selector: 'app-listing',
    templateUrl: './listing.page.html',
    styleUrls: ['./listing.page.scss'],
    providers: [TranslatePipe]
})
export class ListingPage implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild('superTabs', { static: false, read: SuperTabs }) st: SuperTabs;
    @ViewChild(AuthorizeRejectListingBtnComponent, { static: false}) listActionBtns: AuthorizeRejectListingBtnComponent;
    tabsArray;
    listServices = {};
    private product: string;
    activeTabIndex: number;
    selectedListType;
    private service;
    multiSelectMode: Observable<boolean>;
    filterApplicable$: Observable<boolean>;
    filters$: Observable<any[]>;
    avaliableLists: any[];
    listingState;
    private unsub$ = new Subject<any>();

    constructor(private payProListingService: TransactionService,
                private tradeListingService: TradeTransactionService,
                private route: ActivatedRoute,
                private actionSheetController: ActionSheetController,
                public listingService: ListingService,
                private menu: MenuController,
                private router: Router,
                public objTransSrv: ObjTransferService,
                private datePipe: DatePipe,
                private translate: TranslatePipe) {
        let pageDetails;
        pageDetails =  objTransSrv.getObjData('state').page;
        const tabEntityName = objTransSrv.getObjData('tabEntityName');
        this.listServices = {
            paypro: payProListingService,
            trade : tradeListingService
        };

        this.product = this.route.snapshot.paramMap.get('product');
        this.service = this.listServices[this.product];
        this.tabsArray = this.service.getTabs(pageDetails.entityName);
        if (tabEntityName) {
            this.activeTabIndex = _.findIndex(this.tabsArray, ['entityName', tabEntityName]);
            objTransSrv.removeObj('tabEntityName');
        }
        this.filterApplicable$ = this.service.filterApplicable$;
        this.filters$ = this.listingService.filters$;

        this.multiSelectMode = this.listingService.multiSelectionMode$;
        console.log("constructor");
  }

  setCurrentEntity(type) {
    this.avaliableLists = this.tabsArray[this.activeTabIndex].menuLinksDetail.link;
    this.selectedListType = _.find(this.avaliableLists, ['key', type]);
    if (this.selectedListType === undefined) {
        this.selectedListType = _.find(this.avaliableLists, ['key', this.tabsArray[this.activeTabIndex].defaultURL]);
    }
    this.createListType();
    this.listingService.selectedTab = this.tabsArray[this.activeTabIndex];
    this.listingService.currentListType = this.selectedListType;
   }
  ngOnInit() {
        this.activeTabIndex = this.activeTabIndex ? this.activeTabIndex : 0;
        this.setCurrentEntity(this.tabsArray[this.activeTabIndex].defaultURL);
        this.listingService.refreshTab();
        this.multiSelectMode = this.listingService.multiSelectionMode$;
        this.listingService.listingState$
        .pipe(takeUntil(this.unsub$))
        .subscribe((state) => {
            this.listingState = state;
            if (this.listingState !== 'loading' && this.listingState !== 'scroll' && this.listingService.refreshTargetEvent) {
                this.listingService.refreshTargetEvent.target.complete();
            }
        });

        this.listingService.modifyFilters$.subscribe((filters: Filter[]) => {
            if (filters) {
            for (const obj of filters) {
            if (obj.displayName === "Channel") {
                this.listingService.getFilterDropdownOptions("paypro/transactionQuery/private/getAllChannels", {})
                .subscribe(data => {
                filters.map(filter => {
                    if (filter.displayName === "Channel") {
                        filter.options = data.dataList;
                        filter.type = 'select';
                    }
                });
                this.listingService.setFilters(filters);
                });
                break;
            }}
            }
        });
  }

    onTabChange(ev: CustomEvent<SuperTabChangeEventDetail>) {
        this.listingService.setFilters(null);
        if (ev.detail.changed) {
            this.activeTabIndex = ev.detail.index;
            this.setCurrentEntity(this.selectedListType.key);
            this.listingService.refreshTab();
        }
    }

    createListType() {
        if (this.listActionBtns !== undefined) {
            this.listActionBtns.createListType(this.selectedListType, this.avaliableLists);
        }
    }
    ngAfterViewInit() {
        this.listActionBtns.createListType(this.selectedListType, this.avaliableLists);
    }
    setSelectedListType(selectedListType) {
        this.selectedListType = selectedListType;
    }

    showFilter() {
        this.menu.open('filterMenuId');
    }


    ngOnDestroy(): void {
        this.unsub$.next();
        this.unsub$.complete();
        this.unsub$.unsubscribe();
    }

    applyFilter(currentFilter) {
        console.log('Listing', currentFilter);
        this.menu.close('filterMenuId');
        for (const filter of currentFilter) {
            if (filter.type === 'Date') {
                filter.value = this.datePipe.transform(filter.value, appConstants.requestDateFormat);
            } else if (filter.type === 'select') {
                filter.type = "String";
                delete filter.options;
                filter.value = filter.value.id;
            }
        }
        this.listingService.refreshTab(currentFilter);
    }

    cancelMultiSelectMode() {
        this.listingService.cancelMultiSelectMode();
    }

    /*getDisplayName(key) {
        const oldValue = key;
        key = "menu_" + key.replace(/\s/g, "_");
        key = key.toLowerCase();
        const newValue = this.translate.transform(key);
        const setValue = newValue === key ? key : newValue;
        return setValue;
    }*/
    showHelpPage() {
        this.listingService.helpPageClick();
    }
}
