import {Component, OnInit} from '@angular/core';
import {AngularAjaxService} from "../../services/aps-services/ajaxService/angular-ajax.service";
import {ModalController} from "@ionic/angular";

@Component({
    selector: 'app-view-auth-remarks',
    templateUrl: './view-auth-remarks.component.html',
    styleUrls: ['./view-auth-remarks.component.scss'],
})
export class ViewAuthRemarksComponent implements OnInit {

    id;
    serviceURL;
    remarksData: any[];
    private url = "/private/viewAuthRemarks";

    constructor(private ajaxSrv: AngularAjaxService, private modalCtrl: ModalController) {
    }

    ngOnInit() {
        console.log('ViewAuthRemarksComponent', this.remarksData);
        this.ajaxSrv.sendAjaxRequest(this.serviceURL + this.url, {dataMap: {id: this.id}}).subscribe(response => {
            this.remarksData = response.dataMap && response.dataMap.authRemarks ? response.dataMap.authRemarks : [];
            console.log(this.remarksData);
        });
    }

    closeModal() {
        this.modalCtrl.dismiss();
    }

    toggleGroup(event, grp) {
        if (event) {
            event.stopPropagation();
        }
        grp.show = !grp.show;
    }
}
