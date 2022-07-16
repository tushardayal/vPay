import {Component, Input, OnInit} from '@angular/core';
import {LpoppService} from "../../../lpopp.service";

@Component({
    selector: 'app-irdp-view',
    templateUrl: './irdp-view.component.html',
    styleUrls: ['./irdp-view.component.scss'],
})
export class IrdpViewComponent implements OnInit {

    @Input() data: any;
    dataObj: any;

    constructor(public lpoppService: LpoppService) {
    }

    ngOnInit() {
        this.dataObj = this.data.lpoppRequestDets[0];
    }

}
