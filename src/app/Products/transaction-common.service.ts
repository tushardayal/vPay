import {Injectable} from "@angular/core";
import {ListingService} from "src/app/listing/listing.service";
import {ModalController} from '@ionic/angular';
import {SelectAuthorizerComponent} from 'src/app/components/select-authorizer/select-authorizer/select-authorizer.component';
import {AngularAjaxService} from 'src/app/services/aps-services/ajaxService/angular-ajax.service';
import {UserService} from 'src/app/services/aps-services/user.service';
import {ViewAuthRemarksComponent} from "../components/view-auth-remarks/view-auth-remarks.component";
import {ToastService} from "../services/aps-services/toast-service";

@Injectable()
export class TransactionCommonService {

  CONSTANTS = {
    DOWNLOAD_FILE: '/trade/fileUploadService/private/getSupportingDocDownload',
  };

  securityId;
  isVerifierSelect = false;
  constructor(private listingService: ListingService,
              private modalController: ModalController,
              private angularAjaxSrv: AngularAjaxService,
              private userSrv: UserService,
              private toastService: ToastService
              ) {
                userSrv.securityId$.subscribe(id => {
                  this.securityId = id;
                });
              }

  authorize(id: string, isVerifier, isChildRecord, url?) {
    if (id !== undefined) {
      this.listingService.singleRecord = true;
      if (!this.listingService.selectedIds.includes(id)) {
        this.listingService.selectedIds.push(id);
      }
    } else {
      this.listingService.singleRecord = false;
    }
    console.log("authorize");
    if (this.listingService.enrichments && this.listingService.enrichments.selectedAuthType === "SOFTTOKEN") {
      this.listingService.generateOTP().subscribe((value) => {
        this.listingService.showOtpAlert({type: "authorize", isVerifier, isChildRecord}, url);
      });
    } else {
      this.listingService.showAuthRemarkAlert();
    }
  }
  delete(id: string) {
      this.listingService.showConfirmationBox({
        type: "delete",
        id,
        msg: 'Are you sure you want to Delete?',
        header: 'DELETE'
      });
  }
  reject(id: string, isVerifier, isChildRecord, url?) {
    if (id !== undefined) {
      this.listingService.singleRecord = true;
      if (!this.listingService.selectedIds.includes(id)) {
        this.listingService.selectedIds.push(id);
      }
    } else {
      this.listingService.singleRecord = false;
    }
    this.listingService.showConfirmationBox({
      type: "reject",
      id,
      msg: 'Are you sure you want to ' + (isVerifier ? 'Decline?' : 'Reject?'),
      header: isVerifier ? 'DECLINE' : 'REJECT',
      isVerifier,
      isChildRecord
    }, url);
  }
  view(id: string) {
    this.listingService.view(id);
  }

  async viewInModal(id: string, component: any) {
    const viewModal = await this.modalController.create({
      component,
      cssClass: "aps-modal-height90",
      swipeToClose: true,
      componentProps: {
        id,
      }
    });
    await viewModal.present();
  }

  closeModal() {
    this.modalController.dismiss();
  }

  checkViewAccess(item, showErrorMsg) {
    if (item.actions && item.actions.length > 0) {
      const viewAccess = item.actions.filter((a) => a.onClick.includes('view('));
      if (showErrorMsg && viewAccess.length === 0) {
        this.toastService.presentToast('No view access');
      }
      return viewAccess.length > 0;
    }
    return false;
  }

  checkAuthorizationAccess(actionList) {
    // tslint:disable-next-line: forin
    for (const i in actionList) {
      if (actionList[i].onClick &&
          ( actionList[i].onClick.includes("authorize(")
          || actionList[i].onClick.includes("reject("))) {
        this.isVerifierSelect = false;
        return true;
      }
      if (actionList[i].onClick &&
          (actionList[i].onClick.includes("verify(")
          || actionList[i].onClick.includes("decline("))) {
        this.isVerifierSelect = true;
        return true;
      }
    }
    return false;
  }
  selectAuthorizerVerifier(item, selectorType) {
    const params = item.split("(")[1].split(")")[0].split(",");

    const id = params[0].split("'").join('');
    const version = params[1].split("'").join('');
    const debitAccount = params[2].split("'").join('');
    const authorizationLevel = params[3] ? params[3].split("'").join('') : undefined;
    const corporateProductId = params[4] ? params[4].split("'").join('') : undefined;
    const recordListType = params[5] ? params[5].split("'").join('') : 'BULK';

    let getLink = this.listingService.selectedTab.serviceUrl + "/private/getAuthorizerToSelect";
    getLink = getLink.replace('bulkPaymentRequestDetailsService', 'bulkPaymentService');
    let setLink = this.listingService.selectedTab.serviceUrl + "/private/setAuthorizerToSelect";
    setLink = setLink.replace('bulkPaymentRequestDetailsService', 'bulkPaymentService');

    const inputData = {
      dataFrom: "LISTING",
      getLink,
      setLink,
      selectorType,
      authorizationLevel,
      id,
      debitAccount,
      corporateProductId,
      recordListType,
    };
    this.presentSelectAuthorizer(inputData);
  }

  async openViewAuthRemarks(fun) {
    // const params = fun.split('openViewAuthRemarks(')[1].split(')');
    // params[0].split("'").join("").split("\\").join("");
    const id = this.getId(fun, 'openViewAuthRemarks(');
    const remarkModal = await this.modalController.create({
      component: ViewAuthRemarksComponent,
      cssClass: "",
      swipeToClose: true,
      componentProps: {
        id,
        serviceURL: this.listingService.selectedTab.serviceUrl
      }
    });
    await remarkModal.present();
  }

  getId(fun: any, functionName: string) {
    const params = fun.split(functionName)[1].split(')');
    return params[0].split("'").join("").split("\\").join("");
  }

  async presentSelectAuthorizer(inputData) {
    console.log("res data", inputData);
    const modal = await this.modalController.create({
      component: SelectAuthorizerComponent,
      cssClass: "select-authorizer-modal",
      componentProps: {
        inputData,
      },
      backdropDismiss: false,
    });
    await modal.present();
    modal.onDidDismiss().then(() => {
      this.listingService.refreshTab();
      console.log("modal close");
    });
  }

  onActionClicked(arr, url?) {
    const fun = arr[1];
    const item = arr[2];
    if (fun.includes("authorize(")) {
      this.authorize(item.id, false, item.isChildRecord, url);
    } else if (fun.includes("delete(")) {
      this.delete(item.id);
    } else if (fun.includes("reject(")) {
      this.reject(item.id, false, item.isChildRecord, url);
    } else if (fun.includes("selectAuthorizer(")) {
      this.selectAuthorizerVerifier(fun, 'SELECTAUTHORIZER');
    } else if (fun.includes("selectVerifier(")) {
      this.selectAuthorizerVerifier(fun, 'SELECTVERIFIER');
    } else if (fun.includes("verify(")) {
      this.authorize(item.id, true, item.isChildRecord);
    } else if (fun.includes("decline(")) {
      this.reject(item.id, true, item.isChildRecord);
    } else if (fun.includes("acceptReject(")) {
      this.listingService.showConfirmationBox({
        type: "acceptReject",
        id: item.id,
        msg: 'Are you sure you want to Accept Rejection?',
        header: 'ACCEPT REJECTION'
      }, url);
    } else if (fun.includes("openViewAuthRemarks(")) {
      this.openViewAuthRemarks(fun);
    } else if (fun.includes("confirm(")) {
      this.extractAndCallMethod(this, fun);

    } else if (fun.includes("viewError(")) {
      this.listingService.viewErrorAlert(item.id);
    }
  }

  doRefresh(event) {
    this.listingService.refreshTargetEvent = event;
    this.listingService.refreshTab();
  }
  downloadFile(downloadUrl, fileName, sysFileName) {
    const downloadLink = downloadUrl
    + "?uploadFileName=" + encodeURIComponent(fileName)
    + "&systemFileName=" + encodeURIComponent(sysFileName)
    // + "&securityId=" + encodeURIComponent(this.securityId);
    + "&paramter1=" + encodeURIComponent(this.securityId);
    this.angularAjaxSrv.downloadFile(downloadLink, sysFileName);
  }

  getListTypeForUiStatusFilter(currentListTypeKey) {
    let listingType;
    switch (currentListTypeKey) {
      case 'PENDINGLIST':
        listingType = 'unauthorized';
        break;
      case 'AUTHORIZEDLIST':
        listingType = 'authorized';
        break;
      case 'REJECTLIST':
        listingType = 'rejected';
        break;
      case 'REPAIRQUEUELIST':
        listingType = 'repairQueue';
        break;
      default:
        listingType = 'unauthorized';
        break;
    }
    return listingType;
  }

  confirm(id: any, version) {
    if (id !== undefined) {
      this.listingService.selectedIds.push(id + ',' + version);
    }

    this.listingService.generateOTP().subscribe((value) => {
      this.listingService.showOtpAlert({isConfirm: true});
    });
  }

  extractAndCallMethod(scope, method) {
    const methodName = method.substring(0, method.indexOf('('));
    let tempPramList = method.substring(method.indexOf('(') + 1, method.indexOf(')')).split('\'');
    tempPramList = tempPramList.slice(1, tempPramList.length - 1);
    const pramList = [];
    for (const i in tempPramList) {
      if (tempPramList[i] !== ',' && tempPramList[i] !== ' ,' && tempPramList[i] !== ' , ') {
        pramList.push(tempPramList[i]);
      }
    }
    this[methodName].apply(this, pramList || []);
  }
}
