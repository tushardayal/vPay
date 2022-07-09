import { Component, OnInit } from '@angular/core';
import {DashboardService} from "../../dashboard-service";
import {ActivatedRoute, Router} from "@angular/router";
import {NotificationService} from "../notification.service";
import {Observable} from "rxjs";
import { ObjTransferService } from 'src/app/services/aps-services/obj-transfer.service';

@Component({
  selector: 'app-notification-list',
  templateUrl: './notification-list.component.html',
  styleUrls: ['./notification-list.component.scss'],
})
export class NotificationListComponent implements OnInit {

  notificationData$: Observable<any>;
  constructor(private notificationService: NotificationService,
              private route: ActivatedRoute,
              private router: Router,
              private objTransferService: ObjTransferService) {
    console.log('NotificationListComponent constructor');
  }

  ngOnInit() {
    console.log('NotificationListComponent init');
    this.notificationService.getAllNotificationData();
    this.notificationData$ = this.notificationService.notificationData$;
  }

  ionViewWillLeave() {
      this.notificationService.getDashboardNotificationData();
  }

  viewNotificationGroup(notification: any) {
    this.objTransferService.setObjData('notificationData', notification.referenceEntityName);
    this.router.navigate(['/dashboard/notificationsTimeline'], {relativeTo: this.route});
  }
}
