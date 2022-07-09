import { Injectable } from '@angular/core';
import { UserService } from "../../../../services/aps-services/user.service";
//
import { BehaviorSubject } from "rxjs";

import { SinglePaymentListingPage } from './single-payment/listing/single-payment-listing.page';
import { BulkPaymentListingPage } from './bulk-payment/listing/bulk-payment-listing.page';
import { BillPaymentListingPage } from './bill-payment/listing/bill-payment-listing.page';
import { OwnAccountTransferListingPage } from './own-account-transfer/listing/own-account-transfer-listing.page';
import * as _ from 'lodash';
import {BillPaymentUploadListingPage} from "./bill-payment-upload/listing/bill-payment-upload-listing.page";
import {LpoppListingPage} from "./lpopp/listing/lpopp-listing.page";

export const payProListTabs = [
  {
    entityName: 'OWNACCOUNTTRANSFER',
    page: OwnAccountTransferListingPage,
  },
  {
    entityName: 'BSINGLEPAYMENTREQUEST',
    page: SinglePaymentListingPage,
  },
  {
    entityName: 'BBULKPAYMENTREQUEST',
    page: BulkPaymentListingPage,
  },
  {
    entityName: 'LPOPPREQUEST',
    page: LpoppListingPage,
  },
  {
    entityName: 'BILLPAYMENT',
    page: BillPaymentListingPage,
  },
  {
    entityName: 'BILLPAYMENTUPLOAD',
    page: BillPaymentUploadListingPage,
  }
];


@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private _filterApplicable: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  public filterApplicable$ = this._filterApplicable.asObservable();

  constructor(public userService: UserService) {
  }

  getTabs(entityName?) {
    const menus = this.userService.getMenu();
    const listingIndex = _.findIndex(menus, ['entityName', entityName]);
    const tabs = menus[listingIndex].menus;
    for (const tab of tabs) {
      try {
        const paytab: any = _.find(payProListTabs, ['entityName', tab.entityName]);
        tab.page = paytab.page;
      } catch (e) {
        console.log(e);
      }
    }
    console.log(menus[listingIndex].menus);
    return menus[listingIndex].menus;
  }

}
