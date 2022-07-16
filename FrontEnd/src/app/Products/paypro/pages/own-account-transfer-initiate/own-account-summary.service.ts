import {Injectable} from '@angular/core';
import {AngularAjaxService} from "../../../../services/aps-services/ajaxService/angular-ajax.service";

@Injectable({
  providedIn: 'root'
})
export class OwnAccountSummaryService {

  CONSTANTS = {
    ENTITY_NAME: 'OWNACCOUNTTRANSFER',
    GET_PAYMENTMETHODS : 'ownAccountTransferService/private/getPaymentMethods',
    GET_DEBITACCOUNTS : 'ownAccountTransferService/private/getDebitAccounts',
    GET_CREDITACCOUNTS : 'ownAccountTransferService/private/getCreditAccounts',
    CREATE: 'ownAccountTransferService/private/create',
    CHECK_SELFAUTH: 'ownAccountTransferService/private/checkSelfAuth',
    GET_SELECT_AUTHORIZER : "ownAccountTransferService/private/getAuthorizerToSelect",
    SET_SELECT_AUTHORIZER : "ownAccountTransferService/private/setAuthorizerToSelect",
    GET_BENEFICIARY_DETAILS_FOR_MOBILE : "payPro/searchService/private/getBeneficiaryDetailsForMobile",
    GENERATE_OTP: "authenticationService/private/generateOTP",
    GET_CHARGE_TYPES : "singlePaymentService/private/getChargeTypes",
    GET_REMITTANCE_PURPOSE : 'singlePaymentService/private/getRemittancePurpose',
    GET_ONLINEBALANCE : 'corporateAccountService/private/getOnlineBalance',
    UPLOAD: 'paypro/fileUploadService/private/upload',
    DOWNLOAD_FILE :  'ownAccountTransferService/private/getSupportingDocDownload',
  };

  constructor(private ajaxService: AngularAjaxService) {

  }

  getPaymentMethods() {
    return this.ajaxService.sendAjaxRequest(this.CONSTANTS.GET_PAYMENTMETHODS, {});
  }

  getDebitAccounts() {
    return this.ajaxService.sendAjaxRequest(this.CONSTANTS.GET_DEBITACCOUNTS, {});
  }

  getChargeType(selectedPaymentmethodCode) {
    const filters = [];
    filters.push({
      name: 'paymentMethod',
      value: selectedPaymentmethodCode,
      type: 'String'
    });
    return this.ajaxService.sendAjaxRequest(this.CONSTANTS.GET_CHARGE_TYPES, {filters});
  }

  getRemittancePurpose(selectedPaymentmethodCode) {
    const filters = [];
    const val = selectedPaymentmethodCode === 'EP17' ? 'SHA1' : 'SHA';
    filters.push({
      name: "charge",
      value: val,
      type: "String"
    });
    return this.ajaxService.sendAjaxRequest(this.CONSTANTS.GET_REMITTANCE_PURPOSE, {filters});
  }

  checkOnlineBalance(obcDataToSend) {
    return this.ajaxService.sendAjaxRequest(this.CONSTANTS.ENTITY_NAME, obcDataToSend);
  }

  getOnlineBalance(account) {
    if (!account || account === "") {
      return;
    }
    // console.log("account", account);
    const accountNo = account.displayName.split("-")[0];
    const data = {
      filters: [
        {
          name: "accountNo", value: accountNo.trim(), type: "String"
        }, {
          name: "currencyCode", value: account.enrichments.currencyCode, type: "String"
        },
        {
          name: "accountId", value: account.id, type: "String"
        }
      ]
    };
    console.log(data);
    return this.ajaxService.sendAjaxRequest(this.CONSTANTS.GET_ONLINEBALANCE, data);
  }

  getCreditAccounts(debitAccount, paymentMethod) {

    const data = {
      filters: [
        {
          name: "debitAccountId",
          value: debitAccount.id,
          type: "String"
        },
        {
          name: "paymentMethodId",
          value: paymentMethod.id,
          type: "String"
        }]
    };
    return this.ajaxService.sendAjaxRequest(this.CONSTANTS.GET_CREDITACCOUNTS, data);
  }

  getBeneficiaryDetails(data) {
    return this.ajaxService.sendAjaxRequest(this.CONSTANTS.GET_BENEFICIARY_DETAILS_FOR_MOBILE, data);
  }


  submitToServer(data) {
    return this.ajaxService.sendAjaxRequest(this.CONSTANTS.CREATE, data);
  }

  checkSelfAuth(data) {
    return this.ajaxService.sendAjaxRequest(this.CONSTANTS.CHECK_SELFAUTH, data);
  }

  generateOTP(data) {
    return this.ajaxService.sendAjaxRequest(this.CONSTANTS.GENERATE_OTP, data);
  }

  uploadFile(fileData, entityKey) {
    return this.ajaxService.uploadFileToServer(this.CONSTANTS.UPLOAD, fileData, entityKey);
  }
}
