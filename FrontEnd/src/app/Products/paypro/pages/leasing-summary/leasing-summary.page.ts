import {Component, OnInit} from '@angular/core';
import {LeasingSummaryService} from "./leasing-summary.service";
import {LeasingSummaryModel} from "./leasing-summary-model";
import {ActivatedRoute, Router} from "@angular/router";
import {UserService} from "../../../../services/aps-services/user.service";
import {environment} from "../../../../../environments/environment";

@Component({
    selector: 'app-leasing-summary',
    templateUrl: './leasing-summary.page.html',
    styleUrls: ['./leasing-summary.page.scss'],
})
export class LeasingSummaryPage implements OnInit {

    summaryData: LeasingSummaryModel;
    environment = environment;
    constructor(public leasingService: LeasingSummaryService,
                public userService: UserService,
                private router: Router, private route: ActivatedRoute) {}

    ngOnInit() {
        if (this.userService.isGroupSelected) {
            this.leasingService.getApplicant();
        } else {
            this.getLeasingSummary();
        }
    }

    getLeasingSummary() {
        this.leasingService.getLeasingSummary().subscribe(data => {
            this.summaryData = data;
        });
    }

    getDetails(data) {
        this.router.navigate(["../view" , data.agreementNo], {relativeTo: this.route});
    }

    toggleGroup(group: any) {
        if (event) {
            event.stopPropagation();
        }
        group.show = !group.show;
    }
}


