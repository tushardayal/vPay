import {Component, Input, OnInit} from '@angular/core';
import {LpoppService} from "../../../lpopp.service";

@Component({
    selector: 'app-slcp-view',
    templateUrl: './slcp-view.component.html',
    styleUrls: ['./slcp-view.component.scss'],
})
export class SlcpViewComponent implements OnInit {

    @Input() data: any;
    dataObj: any;

    constructor(public lpoppService: LpoppService) {
    }

    ngOnInit() {
        this.dataObj = this.data.lpoppRequestDets[0];
    }

}
