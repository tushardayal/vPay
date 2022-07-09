import { InputFieldValidationService } from './../directives/input-field-validation.directive';
import {Injectable, Renderer2, RendererFactory2} from "@angular/core";
import {BehaviorSubject, of, interval, Observable, Subject, EMPTY} from "rxjs";
import {AngularAjaxService} from "../services/aps-services/ajaxService/angular-ajax.service";
import {catchError, map, take, takeUntil} from "rxjs/operators";
import {AlertController} from "@ionic/angular";
import { AlertButton } from '@ionic/core';
import {UserService} from '../services/aps-services/user.service';
import {ToastService} from '../services/aps-services/toast-service';
import {appConstants} from "../appConstants";
import { DatePipe } from "@angular/common";

@Injectable({
  providedIn: "root",
})
export class ListingService {
  private LISTING_CONST = {
    GENERATE_OTP: "authenticationService/private/generateOTP"
  };

  // new listing code added start
  dataItemList: any;
  selectedIds: string[] = [];
  currentPageNo: number;
  enrichments: any;
  isLastPage: boolean;
  isNextPageCall = false;
  refreshTargetEvent: any;
  resendOTPTImer$:BehaviorSubject<any> = new BehaviorSubject<any>(null);
  singleRecord = false;
  destroyOtp$ = new Subject();
  public currentListType;
  private _dataItemList: BehaviorSubject<[]> = new BehaviorSubject(null);
  public dataItemList$ = this._dataItemList.asObservable();
  // new listing code added end

  // tslint:disable-next-line:variable-name
  private _multiSelectionMode: BehaviorSubject<boolean> = new BehaviorSubject(false);

  public multiSelectionMode$ = this._multiSelectionMode.asObservable();

  private _clickedHelp: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public clickedHelp$ = this._clickedHelp.asObservable();
  // tslint:disable-next-line:variable-name
  private _filters: BehaviorSubject<any[]> = new BehaviorSubject(null);
  public filters$ = this._filters.asObservable();
  private _modifyFilters: BehaviorSubject<any[]> = new BehaviorSubject(null);
  public modifyFilters$ = this._modifyFilters.asObservable();

  defaultCurrentfilter: any[] = [];
  public selectedTab;

  private _listingState: BehaviorSubject<any> = new BehaviorSubject(null);
  public listingState$ = this._listingState.asObservable();
  renderer: Renderer2;
    showEditForEntities = []; // ["BSINGLEPAYMENTREQUEST"];
  constructor(
    private ajaxService: AngularAjaxService,
    private userService: UserService,
    private toastService: ToastService,
    private alertCtrl: AlertController,
    private datePipe: DatePipe,
    private inputFieldValidator: InputFieldValidationService
  ) { }
   
  setMultiSelectionMode(mode: boolean) {
    this._multiSelectionMode.next(mode);
  }

  setFilters(filters: any[]) {
    console.log('filters ', filters);
    this._filters.next(filters);
  }

  // new listing code added start
  refreshTab(currentFilter?) {
    this._clickedHelp.next(false);
    this._dataItemList.next(null);
    this.dataItemList = [];
    this.selectedIds = [];
    this._multiSelectionMode.next(false);
    this.currentPageNo = 1;
    this.isLastPage = false;
    this.isNextPageCall = false;
    this._listingState.next('loading');
    // tslint:disable-next-line:no-unused-expression
    currentFilter = currentFilter ? currentFilter.concat(this.defaultCurrentfilter) : this.defaultCurrentfilter;
    this.getData(this.currentPageNo, this.currentListType, currentFilter);
  }

  getData(pageNo, type, currentFilter?) {
    console.log(pageNo);
    if (!this.isLastPage) {
      const inputData = {
        pageNumber: pageNo,
        entityName: this.selectedTab.entityName,
        filters: currentFilter ? currentFilter : []
      };
      const url = this.selectedTab.serviceUrl + this.currentListType.url;
      this.ajaxService.sendAjaxRequest(url, inputData,'POST',false)
      .pipe(
        catchError((err) => {
          this._listingState.next('err');
          return of(false);
        })
      )
      .subscribe(response => {
        if (response && this.selectedTab.entityName === response.entityName) {
        console.log(response.totalPages);
        const dataList: [] = response.dataList;
        if (response.totalPages === pageNo) {
          this.isLastPage = true;
        }
        this._filters.next(response.filters);
        this._modifyFilters.next(response.filters);
        const validHeaders: any = {};
        // tslint:disable-next-line:forin
        if (dataList && dataList.length > 0) {
            const useMethodName = appConstants.USE_METHODNAME_IN_LISTING.includes(response.entityName);
            dataList.forEach(value => {
            const dataItem: any = {};
            // tslint:disable-next-line: forin
            for (const index in response.headers) {
                // tslint:disable-next-line:max-line-length
                const displayName = useMethodName && response.headers[index].methodName ? response.headers[index].methodName : response.headers[index].displayName;
                validHeaders[displayName] = index;
                dataItem[displayName] = value[index];
            }
            dataItem.links = [];
            this.dataItemList.push(dataItem);
          });
          this.setActions(response, this.dataItemList);
          this.currentPageNo = response.pageNumber;
          this.enrichments = response.enrichments;
          console.log("this.dataItemList", this.dataItemList);
          this._dataItemList.next(this.dataItemList);
          if (this.isNextPageCall) {
            this.isNextPageCall = false;
          } else {
            this._listingState.next('success');
          }
        } else {
          this._listingState.next('notFound');
        }
      }
      });
    } else {
      this._listingState.next('success');
      return true;
    }
  }

  getNextPage() {
    this.isNextPageCall = true;
    return of(this.getData(this.currentPageNo + 1, this.currentListType));
  }

  setActions(response, dataItemList) {
    for (let i = 0, j = 0; i < dataItemList.length; i++) {
      dataItemList[i].selected = this.selectedIds.includes(dataItemList[i].Id);
      if (dataItemList[i].links.length <= 0) {
        dataItemList[i].links = response.links[j];
        dataItemList[i].actions = this.getLinksDisplayName(
          dataItemList[i].links
        );
        j++;
      }
    }
  }

  getLinksDisplayName(array) {
    const returnArray = [];
    for (const item of array) {
      let temp: any = {};
      if (item.onClick != null) {
        if (item.onClick.includes('view(')) {
          temp = { icon: 'eye-outline', displayName: item.displayName, onClick: item.onClick };
        } else if ((item.onClick.includes('edit(') )
            && this.showEditForEntities.includes(this.selectedTab.entityName)) {
          temp = { icon: 'pencil-outline', displayName: item.displayName, onClick: item.onClick };
        } else if ((item.onClick.includes('resubmit('))
            && this.showEditForEntities.includes(this.selectedTab.entityName)) {
          temp = { icon: 'paper-plane-outline', displayName: item.displayName, onClick: item.onClick };
        } else if (item.onClick.includes('authorize(')) {
          temp = { icon: 'checkmark', displayName: item.displayName, onClick: item.onClick };
        } else if (item.onClick.includes('reject')) {
          temp = { icon: 'close', displayName: item.displayName, onClick: item.onClick };
        } else if (item.onClick.includes('verify(')) {
          temp = { icon: 'checkmark', displayName: item.displayName, onClick: item.onClick };
        } else if (item.onClick.includes('decline(')) {
          temp = { icon: 'close', displayName: item.displayName, onClick: item.onClick };
        } else if (item.onClick.includes('delete(')) {
          temp = { icon: 'trash', displayName: item.displayName, onClick: item.onClick };
        } else if (item.onClick.includes('selectAuthorizer(')) {
          temp = { icon: 'checkmark-done-outline', text: true, displayName: "Select\nAuthorizer", onClick: item.onClick };
        } else if (item.onClick.includes('selectVerifier(')) {
          temp = { icon: 'checkmark-done-circle-outline', text: true, displayName: "Select\nVerifier", onClick: item.onClick };
        } else if (item.onClick.includes('acceptReject(')) {
          temp = { icon: 'checkmark', text: true, displayName: "Accept\nRejection", onClick: item.onClick };
        } else if (item.onClick.includes('openViewAuthRemarks(')) {
          temp = { icon: 'checkmark', text: true, displayName: "View\nRemarks", onClick: item.onClick };
        } else if (item.onClick.includes('confirm(')) {
          temp = { icon: 'checkmark-done-circle-outline', text: true, displayName: "Confirm", onClick: item.onClick };
        } else if (item.onClick.includes('viewError(')) {
          temp = { icon: 'alert-circle-outline', text: false, displayName: "View Error", onClick: item.onClick };
        } else if (item.onClick.includes('receipt(')) {
          temp = { icon: 'alert-circle-outline', text: true, displayName: item.displayName, onClick: item.onClick };
        }

        if (temp.icon !== undefined) {
          returnArray.push(temp);
        }
      }
    }
    return returnArray;
  }

  generateOTP = function() {
    if(this.resendOTPTImer$.value){
      return new Observable(observer => {
        observer.next(null);
      });
    }
    this.setOtpTimer()
    const data = { pageFrom: "AUTHORIZATION" };
    return this.ajaxService
      .sendAjaxRequest(this.LISTING_CONST.GENERATE_OTP, data)
      .pipe(
        map(value => {
          this.toastService.presentToast(
            "OTP sent to your registered mobile number"
          );
          return value;
        })
      );
  };

  async showWarningAlert(data, msg) {
    const alert = await this.alertCtrl.create({
      header: "CUT OFF TIME",
      message:
        "<p class='ion-margin-top ion-no-margin'>" + msg.message + "</p>",
      cssClass: "alert-subscribe",
      buttons: [
        {
          text: "Cancel",
          role: "cancel",
          handler: () => {
            this.refreshTab();
          }
        },
        {
          text: "Ok",
          handler: () => {
            data.cutOffTime = 'Y';
            this.processAuthorize(data);
            console.log("warning accepted");
          }
        }
      ]
    });

    await alert.present();
  }

    processAuthorize(data, url1?) {
        const ids: string[] = this.selectedIds;
        console.log(ids);
        const inputData = {
            dataMap: {
                ids, tokenNo: data.OTP, authRemarks: data.authRemarks, cutOffTime: undefined, isChildRecord: undefined
            }
        };
        inputData.dataMap.cutOffTime = data.cutOffTime === 'Y' ? 'Y' : undefined;
        inputData.dataMap.isChildRecord = data.isChildRecord ? 'Y' : undefined;

        let url;
        if (data.isVerifier) {
            url = url1 ? url1 : this.selectedTab.serviceUrl + "/private/verify";
        } else {
            url = url1 ? url1 : this.selectedTab.serviceUrl + "/private/authorize";
        }
        this.ajaxService
            .sendAjaxRequest(url, inputData)
            .pipe(catchError((err) => {
                if (err.originalError.status === '1') {
                    // this.selectedIds = [];
                }
                return err;
            }))
            .subscribe(
                (response: any) => {
                    if (response.responseStatus.status === "4") {
                        console.log("cut of time");
                        this.showWarningAlert(data, response.responseStatus);
                    } else if (response.responseStatus.status === '0') {
                        this.refreshTab();
                    }
                    console.log("auth sucess");
                });
    }

  processDelete(data) {
    const inputData = {
      dataMap: { id: data.id }
    };
    const url = this.selectedTab.serviceUrl + "/private/delete";
    this.ajaxService
      .sendAjaxRequest(url, inputData)
      .subscribe(
        (response: any) => {
          if (response.responseStatus.status === '0') {
            this.refreshTab();
          }
          console.log("DELETE sucess");
        });
  }

    reject(data, rejectReason, url1?) {
        const ids: string[] = this.selectedIds;
        console.log(ids);
        const inputData = {
            dataMap: {ids, rejectReason, isChildRecord: undefined}
        };
        let url;
        if (data.isVerifier) {
            url = url1 ? url1 : this.selectedTab.serviceUrl + "/private/decline";
        } else {
            url = url1 ? url1 : this.selectedTab.serviceUrl + "/private/reject";
        }

        inputData.dataMap.isChildRecord = data.isChildRecord ? 'Y' : undefined;
        this.ajaxService
            .sendAjaxRequest(url, inputData)
            .subscribe(
                (response: any) => {
                    if (response.responseStatus.status === '0') {
                        this.refreshTab();
                    }
                    console.log("reject sucess");
                });
    }

    acceptReject(id, url1?) {
        // console.log('acceptReject', id.id);
        const selectedID = id.id;
        const inputData = {
            dataMap: {id: selectedID}
        };
        const url = url1 ? url1 : this.selectedTab.serviceUrl + "/private/acceptReject";
        this.ajaxService
            .sendAjaxRequest(url, inputData)
            .subscribe(
                (response: any) => {
                    if (response.responseStatus.status === '0') {
                        this.refreshTab();
                    }
                    console.log("reject accept sucess");
                });
    }

  view(id: string, extraData?) {
    const inputData = {
      dataMap: { id, extraData }
    };
    if (extraData) {
      inputData.dataMap.extraData = extraData;
    }

    const url = this.selectedTab.serviceUrl + "/private/view";
    return this.ajaxService
      .sendAjaxRequest(url, inputData)
      .pipe(
        map((response: any) => {
          if (response.responseStatus.status === '0') {
            return response;
          } else {
            catchError(err => of([]));
          }
        })
      );
  }

  async showAuthRemarkAlert() {
    const inputData: any = {};
    const authRemarkAlert = await this.alertCtrl.create({
      header: "Remark",
      inputs: [
        {
          name: "Remarks",
          type: 'textarea',
          placeholder: "Enter Remarks"
        }
      ],
      cssClass: "alert-subscribe",
      backdropDismiss: false,
      buttons: [
        {
          text: "Cancel",
          role: "cancel",
          handler: () => {
            console.log("close");
          }
        },
        {
          text: "Ok",
          handler: (data) => {
            inputData.authRemarks = data.Remarks;
            this.processAuthorize(inputData);
          }
        }
      ]
    });

    await authRemarkAlert.present();
  }

  viewErrorAlert(id: string) {
      id = id.split(',')[0];
      const inputData = {
        dataMap: {id, entityKey: this.selectedTab.entityName}
      };
      const url = this.selectedTab.serviceUrl + "/private/viewErrors";
      this.ajaxService.sendAjaxRequest(url, inputData)
          .pipe(take(1))
          .subscribe(async response => {
              if (response.dataMap.errors.length) {
                  let messages = "";
                  response.dataMap.errors.map(errorMsg => {
                    messages = messages + `<p class="ion-no-margin ion-margin-top">${errorMsg}</p><br>`;
                  });
                  const alert = await this.alertCtrl.create({
                      cssClass: 'my-custom-class',
                      header: 'View Error',
                      // subHeader: 'Subtitle',
                      message: messages,
                      buttons: ['OK']
                  });
                  await alert.present();
              }
      });
  }
  
  async showOtpAlert(inputData, url?) {
    const fieldsArray = [];
    fieldsArray.push({
      name: "OTP",
      type: "password",
      placeholder: "Enter OTP"
    });
    if (appConstants.authRemarksApplicableEntities.includes(this.selectedTab.entityName) && !inputData.isConfirm) {
      fieldsArray.push({
        name: "Remarks",
        type: 'textarea',
        placeholder: "Remarks"
      });
    }
    const otpAlert = await this.alertCtrl.create({
      header: "Validate OTP",
      inputs: [
          ...fieldsArray
      ],
      cssClass: "alert-subscribe",
      backdropDismiss: false,
      buttons: [
        {
          text: '',
          handler: () => {
            if (this.resendOTPTImer$.value){
              return false;
            }
            this.generateOTP().subscribe(value => console.log("resend"));
            return false;
          },
          cssClass:'authOptTimer'
        },
        {
          text: "Cancel",
          role: "cancel",
          handler: () => {
            if(this.singleRecord){
              this.selectedIds = [];
            }
            this.destroyOtp$.next();
            this.destroyOtp$.complete();
            this.destroyOtp$.unsubscribe();
            this.resendOTPTImer$.next(null);
            console.log("close");
          }
        },
        {
          text: "Ok",
          handler: (data) => {
            if (data.OTP === undefined || data.OTP === '') {
              return false;
            }
            if (this.inputFieldValidator.validateInput(data.OTP) || this.inputFieldValidator.validateInput(data.Remarks)) {
                  return false;
            }
            inputData.OTP = data.OTP;
            inputData.authRemarks = data.Remarks;
            if (inputData.type === "authorize") {
                this.processAuthorize(inputData, url);
            } else if (inputData.isConfirm) {
              this.processConfirm(inputData, url);
            }
          }
        }
      ]
    });

    await otpAlert.present();
    await this.updateOTPBtnText();
  }

    updateOTPBtnText() {
        const el: any = document.querySelector('.authOptTimer');
        if (el) {
            el.innerHTML = this.resendOTPTImer$.value ? this.resendOTPTImer$.value : 'Resend OTP';
            el.disabled = this.resendOTPTImer$.value ? true : false;
        }
    }
  setOtpTimer() {
    const otpTimeoutSeconds = appConstants.otpTimeOutInSec;
    this.destroyOtp$ = new Subject();
    interval(1000)
        .pipe(takeUntil(this.destroyOtp$))
        .subscribe(value => {
            const seconds = (otpTimeoutSeconds - value) ;
            if (seconds === 0) {
              this.resendOTPTImer$.next(null);
              this.updateOTPBtnText()
              this.destroyOtp$.next();
              this.destroyOtp$.complete();
            } else {
                const timeObj = new Date(1970, 0, 1).setSeconds(seconds);
                this.resendOTPTImer$.next('<ion-icon name="stopwatch-outline"></ion-icon> ' + this.datePipe.transform(timeObj, 'mm:ss'));
                this.updateOTPBtnText()  
            }
        });
  }

    async showConfirmationBox(data, url?) {
        const inputs: any[] = [];
        if (data.type === 'reject') {
            inputs.push({
                name: "rejectReason",
                placeholder: "Enter Reject Reason",
                type: 'textarea'
            });
        }
        const alert = await this.alertCtrl.create({
            header: data.header,
            message:
                "<p class='ion-margin-top ion-no-margin'>" + data.msg + "</p>",
            cssClass: (data.type === 'reject') ? "rejectReasonMsgBox" : "alert-subscribe",
            inputs,
            buttons: [
                {
                    text: "Cancel",
                    role: "cancel",
                    handler: () => {
                        if (this.singleRecord) {
                            this.selectedIds = [];
                        }
                    }
                },
                {
                    text: "Ok",
                    handler: (input) => {
                        if (data.type === 'delete') {
                            this.processDelete(data);
                        } else if (data.type === 'reject') {
                            if (input.rejectReason === undefined || input.rejectReason === '') {
                                return false;
                            }
                            this.reject(data, input.rejectReason, url);
                        } else if (data.type === 'acceptReject') {
                            this.acceptReject(data, url);
                        }
                        console.log("confirmation accepted");
                    }
                }
            ]
        });

        await alert.present();
    }

  cancelMultiSelectMode() {
    this.selectedIds = [];
    this._multiSelectionMode.next(false);
    for (const item of this.dataItemList) {
     item.selected = false;
    }
    this._dataItemList.next(this.dataItemList);
  }

  helpPageClick() {
    this._clickedHelp.next(true);
  }

  getFilterDropdownOptions(url, data) {
    return this.ajaxService.sendAjaxRequest(url, data);
  }

    private processConfirm(inputData: any, url1?) {
        const ids: string[] = this.selectedIds;
        const data = {dataMap: {id: ids[0], isSelfAuth: "true", tokenNo: inputData.OTP}};
        const url = url1 ? url1 : this.selectedTab.serviceUrl + "/private/confirm";

        this.ajaxService.sendAjaxRequest(url, data)
            .subscribe((response: any) => {
                if (response.responseStatus.status === "4") {
                    console.log("cut of time");
                    this.showWarningAlert(data, response.responseStatus);
                }
                if (response.responseStatus.status === '0') {
                    this.refreshTab();
                }
                console.log("Confirm Success");
            });
    }
}
