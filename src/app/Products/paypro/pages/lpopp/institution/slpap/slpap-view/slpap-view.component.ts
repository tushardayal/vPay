import {Component, Input, OnInit} from '@angular/core';
import {LpoppService} from "../../../lpopp.service";

@Component({
    selector: 'app-slpap-view',
    templateUrl: './slpap-view.component.html',
    styleUrls: ['./slpap-view.component.scss'],
})
export class SlpapViewComponent implements OnInit {

    @Input() data: any;
    dataObj: any;

    constructor(public lpoppService: LpoppService) {
    }

    ngOnInit() {
        this.dataObj = this.data.lpoppRequestDets[0];
    }

}
