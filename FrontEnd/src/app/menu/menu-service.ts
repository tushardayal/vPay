import {IService} from '../services/IService';
import {Injectable} from '@angular/core';
import {EMPTY, Observable} from 'rxjs';
import {LoadingService} from '../services/aps-services/loading-service';
import {UserService} from "../services/aps-services/user.service";
import {AngularAjaxService} from "../services/aps-services/ajaxService/angular-ajax.service";
import {concatMap, map} from "rxjs/operators";
import {DeviceDetailsService} from '../services/aps-services/device-details.service';

// import {FileTransferObject, FileUploadOptions} from '@ionic-native/file-transfer/ngx';


@Injectable({ providedIn: 'root' })
export class MenuService implements IService {

 private CONSTANTS = {
    LOGOUT: 'authenticationService/private/logout',
     UPDATE_PROFILE_IMAGE: 'userDetailsService/private/updateProfileImageForMobile',
    // UPDATE_PROFILE_IMAGE: 'userDetailsService/private/updateProfileImage',
    SWITCH_USER_LOGIN: 'authenticationService/private/switchUserLogin',
    GET_MENU: 'menuService/public/getMenus',
  };
  // fileTransfer: FileTransferObject = this.transfer.create();
  constructor(
              private loadingService: LoadingService,
              private ajaxService: AngularAjaxService,
              private userService: UserService,
              private deviceDetailsSrv: DeviceDetailsService,
              /*private transfer: FileTransfer*/) { }

 

  getId = (): string => 'menu';

  getTitle = (): string => 'UIAppTemplate';


  getDataForTheme = (menuItem: any) => {
    return {
      background: 'assets/imgs/background/30.jpg',
      //image: 'assets/imgs/logo/2.png',
      title: 'Ionic5 UI - Letto Theme'
    };
  }

  getEventsForTheme = (menuItem: any): any => {
    return {};
  }

  prepareParams = (item: any) => {
    return {
      title: item.title,
      data: {},
      events: this.getEventsForTheme(item)
    };
  }

  load(item: any): Observable<any> {
    // this.loadingService.show();
    return new Observable(observer => {
        // this.loadingService.hide();
        observer.next(this.getDataForTheme(item));
        observer.complete();
      });
  }

  getAllThemes(): Array<any> {
    return [];
  }

  getMenus() {
    return this.userService.getMenu();
  }

  uploadProfilePic(data) {
    return this.ajaxService.sendAjaxRequest(this.CONSTANTS.UPDATE_PROFILE_IMAGE, data);
    // return this.ajaxService.uploadForNative(this.CONSTANTS.UPDATE_PROFILE_IMAGE, data);
    /*.pipe(
        map((result: any) => {
          console.log(result);
          return result.response ? JSON.parse(result.response) : result;
        })/*,
        catcrror((error) => {
          console.log(error);
          return error;
        }));*/
    // return this.ajaxService.sendAjaxRequest(this.CONSTANTS.UPDATE_PROFILE_IMAGE, data);
  }

  logout() {
    return this.ajaxService.sendAjaxRequest(this.CONSTANTS.LOGOUT, {});
  }

  switchUserLogin(groupObj) {
    if (this.userService.selectedGroup.id === groupObj.id) {
      return EMPTY;
    }
    const data = {
      dataMap: {
        userId: this.userService.getUserDetails().userId,
        password: "",
        version: 1,
        source: "MOBILE",
        authType: "SOFTTOKEN",
        groupId: undefined,
        deviceDetails: this.deviceDetailsSrv.getDeviceDetails()
      }
    };
    if (groupObj.id !== "0") {
      data.dataMap.groupId = groupObj.id;
    }

    const switchUserAjx = this.ajaxService.sendAjaxRequest(this.CONSTANTS.SWITCH_USER_LOGIN, data);
    const getMenuAjx = this.ajaxService.sendAjaxRequest(this.CONSTANTS.GET_MENU, {});

    return switchUserAjx.pipe(concatMap(() => getMenuAjx))
            .pipe(
                map(menuReponse => {
                  this.userService.selectedGroup = groupObj;
                  // refetch menu
                  this.userService.setMenu(menuReponse.modules);
                })
            );
  }
}
