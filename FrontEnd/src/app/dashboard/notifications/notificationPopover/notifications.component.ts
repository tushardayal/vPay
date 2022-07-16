import {Component, OnInit} from '@angular/core';
import {PopoverController} from "@ionic/angular";
import {ActivatedRoute, Router} from "@angular/router";
import {NotificationService} from "../notification.service";
import {Observable} from "rxjs";
import { ObjTransferService } from 'src/app/services/aps-services/obj-transfer.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
})
export class NotificationsComponent implements OnInit {

  notificationData$: Observable<any>;
  constructor(private notificationService: NotificationService,
              private route: ActivatedRoute,
              private popoverController: PopoverController,
              private router: Router,
              private objTransferService: ObjTransferService) {}

  ngOnInit() {
    // const reqData = {dataMap: {topRecords: "3"}};
    // this.notificationService.getNotificationData(reqData);
    this.notificationData$ = this.notificationService.notificationData$;
  }

  seeAllNotification() {
    this.popoverController.dismiss();
    this.router.navigate(['/menu/dashboard/allNotifications'], {relativeTo: this.route});
  }

  viewNotificationGroup(notificationGroup: any) {
    this.objTransferService.setObjData('notificationData', notificationGroup.referenceEntityName);
    this.objTransferService.setObjData('fromDashboard', true);
    this.router.navigate(['/dashboard/notificationsTimeline'], {relativeTo: this.route});
  }
}
