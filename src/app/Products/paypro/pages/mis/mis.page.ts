import {Component, OnInit, ViewChild} from '@angular/core';
import {SuperTabs} from "@ionic-super-tabs/angular";
import {FrequentlyUsedBeneficiaryPage} from "../single-payment-intiate/frequently-used-beneficiary/frequently-used-beneficiary.page";
import {AllBeneficiaryPage} from "../single-payment-intiate/all-beneficiary/all-beneficiary.page";
import {AccountSummaryGraphComponent} from "./account-summary-graph/account-summary-graph.component";
import {PaymentVolumeComponent} from "./payment-volume/payment-volume.component";

@Component({
    selector: 'app-mis',
    templateUrl: './mis.page.html',
    styleUrls: ['./mis.page.scss'],
})
export class MISPage implements OnInit {

    activeTabIndex = 0; //
    tabsArray: any[];
    @ViewChild('superTabs', { static: false, read: SuperTabs }) st: SuperTabs;
    constructor() {
    }
    ngOnInit() {
        this.tabsArray = [
            {
                page: AccountSummaryGraphComponent,
                displayName: 'Account Summary'// src/app/Products/paypro/pages/mis
            },
            {
                page: PaymentVolumeComponent,
                displayName: 'Payment Volume'
            }
        ];
    }

    onTabChange(ev) {
        if (ev.detail.changed) {
            this.activeTabIndex = ev.detail.index;
        }
    }
}
