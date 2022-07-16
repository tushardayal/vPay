import {Component, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import * as _ from "lodash";
import { ObjTransferService } from 'src/app/services/aps-services/obj-transfer.service';
import { RoutingStateService } from "../../../../../services/aps-services/routing-state.service";

@Component({
    selector: 'app-view',
    templateUrl: './view.component.html',
    styleUrls: ['./view.component.scss'],
})
export class ViewComponent implements OnInit {
    data: any;
    prevUrl;
    statusMap = {
        A: "Active",
        C: "Closed",
        D: "Dormant",
        FC: "Credit Freeze",
        FD: "Debit Freeze",
        FT: "Total Freez",
        I: "Inactive",
        NPA: "NPA"
    };
    constructor(private router: Router, private objTransSrv: ObjTransferService,
                private routingState: RoutingStateService) {
        this.prevUrl = this.routingState.getPreviousUrl();
    }

    ngOnInit() {
        const stateData =  this.objTransSrv.getObjData('accountStatementView');
        this.objTransSrv.removeObj('accountStatementView');
        this.data = JSON.parse(JSON.stringify(stateData.data));
        try {
            this.data.dataList.status.value = this.statusMap[this.data.dataList.status.value];
        } catch (e) {
            console.error(e);
        }
        this.data.dataList = Object.values(this.data.dataList);
        console.log(Object.values(stateData.data.dataList));
    }

}
