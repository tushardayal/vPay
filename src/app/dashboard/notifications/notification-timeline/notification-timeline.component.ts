import {Component, OnInit} from '@angular/core';
import {AlertController, PopoverController} from "@ionic/angular";
import {NotificationService} from "../notification.service";
import {Observable} from "rxjs";
import {map} from "rxjs/operators";
import { ObjTransferService } from 'src/app/services/aps-services/obj-transfer.service';

@Component({
    selector: 'app-notification-timeline',
    templateUrl: './notification-timeline.component.html',
    styleUrls: ['./notification-timeline.component.scss'],
})
export class NotificationTimelineComponent implements OnInit {

    allMessages$: Observable<any>;
    refEntity: string;

    constructor(private notificationService: NotificationService,
                public alertController: AlertController,
                private popoverController: PopoverController,
                private objTransferService: ObjTransferService) {
    }

    ngOnInit() {
        this.popoverController.getTop().then((v) => {
            if (v) {
                this.popoverController.dismiss();
            }
        });
        this.refEntity = this.objTransferService.getObjData('notificationData');
        const reqData = {dataMap: {topRecords: "", referenceEntity: this.refEntity}};
        this.notificationService.getUnreadAlerts(reqData);
        this.allMessages$ = this.notificationService.allMessages$.pipe(map((value: any) => {
            if (value) {
                return value.onlineAlertDetails;
            }
            return;
        }));
    }

    ionViewWillLeave() {
        if (this.objTransferService.getObjData('fromDashboard')) {
            this.notificationService.getDashboardNotificationData();
            this.objTransferService.removeObj('fromDashboard');
        }
    }

    async viewMessage(msg) {
        const alert = await this.alertController.create({
            header: msg.subject,
            subHeader: msg.generationDate,
            message: msg.message,
            buttons: ['OK']
        });
        await alert.present();
        if (msg.alertStatus === 'UNREAD') {
            this.notificationService.markAsRead(msg.id).subscribe(value => {
                const reqData = {dataMap: {topRecords: "", referenceEntity: this.refEntity}};
                this.notificationService.getUnreadAlerts(reqData);
            });
        }
    }

}
