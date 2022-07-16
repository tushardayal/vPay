import { Injectable } from '@angular/core';
import {BehaviorSubject} from "rxjs";
import {AngularAjaxService} from "../../services/aps-services/ajaxService/angular-ajax.service";
import { map } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private NOTIFICATION_CONST = {
    GROUPED_UNREAD_ALERTS: "commons/OnlineAlerts/private/getGroupedUnreadAlerts",
    GET_UNREAD_ALERTS: "commons/OnlineAlerts/private/getUnreadAlerts",
    MARK_AS_READ: "commons/OnlineAlerts/private/markAsRead"

  }

  private _notificationData: BehaviorSubject<[]> = new BehaviorSubject(null);
  public notificationData$ = this._notificationData.asObservable();

  private _allMessages: BehaviorSubject<[]> = new BehaviorSubject(null);
  public allMessages$ = this._allMessages.asObservable();

  private _unreadNotificationCount: BehaviorSubject<any> = new BehaviorSubject(0);
  public unreadNotificationCount$ = this._unreadNotificationCount.asObservable();
  constructor(private ajaxService: AngularAjaxService) { }

  getDashboardNotificationData() {
    const reqData = {dataMap: {topRecords: "3"}};
    return this.getNotificationData(reqData)
    .subscribe(value => {
      this._unreadNotificationCount.next(value.unReadCount);
    });
  }

  getAllNotificationData() {
    const reqData = {dataMap: {topRecords: ""}};
    return this.getNotificationData(reqData)
    .subscribe(value => {});
  }

  private getNotificationData(reqData) {
    return this.ajaxService.sendAjaxRequest(this.NOTIFICATION_CONST.GROUPED_UNREAD_ALERTS, reqData)
    .pipe(map((value) => {
      this._notificationData.next(value);
      return value;
    }));
  }

  getUnreadAlerts(reqData: any) {
    return this.ajaxService.sendAjaxRequest(this.NOTIFICATION_CONST.GET_UNREAD_ALERTS, reqData).subscribe(value => {
      this._allMessages.next(value);
    });
  }

  markAsRead(id: string) {
    const data = {dataMap: {id}};
    return this.ajaxService.sendAjaxRequest(this.NOTIFICATION_CONST.MARK_AS_READ, data);
  }
}

