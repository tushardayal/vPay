import {Component, OnInit, ViewChild} from '@angular/core';
import {SuperTabs} from "@ionic-super-tabs/angular";
import {AllBeneficiaryPage} from "./all-beneficiary/all-beneficiary.page";
import {FrequentlyUsedBeneficiaryPage} from "./frequently-used-beneficiary/frequently-used-beneficiary.page";

@Component({
    selector: 'app-select-beneficiary',
    templateUrl: './select-beneficiary.page.html',
    styleUrls: ['./select-beneficiary.page.scss'],
})
export class SelectBeneficiaryPage implements OnInit {

    @ViewChild('superTabs', { static: false, read: SuperTabs }) st: SuperTabs;

    activeTabIndex = 0;
    tabsArray: any[] = [];
    constructor() {
    }

    ngOnInit() {
        this.tabsArray = [
            {
                page: FrequentlyUsedBeneficiaryPage,
                displayName: 'Mostly Used Beneficiary'
            },
            {
                page: AllBeneficiaryPage,
                displayName: 'All Beneficiary'
            }
        ];
    }

    onTabChange(ev) {
        if (ev.detail.changed) {
            this.activeTabIndex = ev.detail.index;
        }
    }

}
