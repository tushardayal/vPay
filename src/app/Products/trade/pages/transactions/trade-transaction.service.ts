import { Injectable } from '@angular/core';
import { UserService } from "../../../../services/aps-services/user.service";
//
import { BehaviorSubject } from "rxjs";
import * as _ from 'lodash';
import { LetterOfCreditListingPage } from './letter-of-credit/listing/letter-of-credit-listing.page';
import { LetterOfCreditAmendListingPage } from './letter-of-credit-amend/listing/letter-of-credit-amend-listing.page';
import { ShippingGuaranteeListingPage } from './shipping-guarantee/listing/shipping-guarantee-listing.page';
import { BillAcceptanceListingPage } from './bill-acceptance/listing/bill-acceptance-listing.page';
import { BillPaymentTradeListingPage } from './bill-payment/listing/bill-payment-listing.page';
import { OTTPaymentListingPage } from './ott-payment/listing/ott-payment-listing.page';
import { RequestFinanceListingPage } from './request-finance/listing/request-finance-listing.page';
import { BankGuaranteeListingPage } from './bank-guarantee/listing/bank-guarantee-listing.page';
import { BankGuaranteeAmendListingPage } from './bank-guarantee-amend/listing/bank-guarantee-amend-listing.page';
import { BillPresentmentListingPage } from './bill-presentment/listing/bill-presentment-listing.page';
import { RequestFinanceExportListingPage } from './request-finance-export/listing/request-finance-export-listing.page';

export const tradeListTabs = [
  {
    entityName: 'LETTEROFCREDIT',
    page: LetterOfCreditListingPage,
  },
  {
    entityName: 'LETTEROFCREDITAMEND',
    page: LetterOfCreditAmendListingPage,
  },
  {
    entityName: 'SHIPPINGGUARANTEE',
    page: ShippingGuaranteeListingPage,
  },
  {
    entityName: 'TRADEBILLACCEPTANCE',
    page: BillAcceptanceListingPage,
  },
  {
    entityName: 'TRADEBILLPAYMENTREQUEST',
    page: BillPaymentTradeListingPage,
  },
  {
    entityName: 'OTT',
    page: OTTPaymentListingPage,
  },
  {
    entityName: 'IMPORTREQUESTFINANCE',
    page: RequestFinanceListingPage,
  },
  {
    entityName: 'BANKGUARANTEE',
    page: BankGuaranteeListingPage
  },
  {
    entityName: 'BANKGUARANTEEAMEND',
    page: BankGuaranteeAmendListingPage
  },
  {
    entityName: 'TRADEBILLPRESENTMENT',
    page: BillPresentmentListingPage
  },
  {
    entityName: 'EXPORTREQUESTFINANCE',
    page: RequestFinanceExportListingPage
  }


];


@Injectable({
  providedIn: 'root'
})
export class TradeTransactionService {

  private _filterApplicable: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  public filterApplicable$ = this._filterApplicable.asObservable();

  constructor(public userService: UserService) {
  }

  getTabs(entityName?) {
    const menus = this.userService.getMenu();
    const listingIndex = _.findIndex(menus, ['entityName', entityName]);
    const tabs = menus[listingIndex].menus;
    for (const tab of tabs) {
      const paytab: any = _.find(tradeListTabs, ['entityName', tab.entityName]);
      if (paytab) {
        tab.page = paytab.page;
      }
    }
    console.log(menus[listingIndex].menus);
    return menus[listingIndex].menus;
  }

}
