import { Component, OnInit } from '@angular/core';
import {LeasingSummaryService} from "../leasing-summary.service";
import {map, takeUntil} from "rxjs/operators";
import {ActivatedRoute} from "@angular/router";
import {BehaviorSubject, Observable, Subject} from "rxjs";

@Component({
    selector: 'app-leasing-view',
    templateUrl: './leasing-view.component.html',
    styleUrls: ['./leasing-view.component.scss'],
})
export class LeasingViewComponent implements OnInit {

    unsub$ = new Subject();
    viewData$: Observable<any>;
    constructor(private leasingService: LeasingSummaryService,
                private route: ActivatedRoute) {}

    ngOnInit() {
        this.route.paramMap.pipe(takeUntil(this.unsub$)).subscribe(val => {
            const id = val.get("id");
            this.viewData$ = this.leasingService.getLeasingAccountDetails(id)
                .pipe(map(response => response.additionalDetails));
        });
    }

}
