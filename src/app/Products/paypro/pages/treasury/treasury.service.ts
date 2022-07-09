import { Injectable } from '@angular/core';
import {AngularAjaxService} from "../../../../services/aps-services/ajaxService/angular-ajax.service";
import {Observable, of} from "rxjs";
import {map} from "rxjs/operators";
import {UserService} from "../../../../services/aps-services/user.service";

@Injectable({
    providedIn: 'root'
})
export class TreasuryService {

    CONSTANTS = {
        GET_PRODUCTLIST: "ratesAndForignExchangeService/private/getProductList",
        GET_PRODUCTDETAILSLIST: "ratesAndForignExchangeService/private/getProductDetailsList",
        GET_GROUP_APPLICANT: "corporateUser/private/getApplicant",
        GET_NEWSFLASHLINK: "contentManagementService/public/getNewsFlashLink"
    };

    groupCorprorateList$: Observable<any>;
    selectedCorporate: any;

    constructor(private angularAjax: AngularAjaxService,
                private userService: UserService) {}

    getProductList() {
        const data = this.userService.isGroupSelected ? {dataMap: {id: this.selectedCorporate.enrichments.id}} : {};
        // tslint:disable-next-line:max-line-length
        // const response = {"responseStatus":{"message":"","status":"0"},"counterParty":"50552068","cif":"50552068","productList":[{"responseStatus":{"message":"","status":"0"},"productKey":"1","productName":"FX Completed Transaction History","reccount":"4","productDetails":[],"loggable":false,"entityIdentifier":""},{"responseStatus":{"message":"","status":"0"},"productKey":"2","productName":"Outstanding Forward Contract","reccount":"4","productDetails":[],"loggable":false,"entityIdentifier":""},{"responseStatus":{"message":"","status":"0"},"productKey":"GMO","productName":"Global Market Overview","reccount":"-","productDetails":[],"loggable":false,"entityIdentifier":""}],"loggable":false,"entityIdentifier":""};
        // return of(response);

        return this.angularAjax.sendAjaxRequest(this.CONSTANTS.GET_PRODUCTLIST, data);
    }

    getApplicant() {
        this.groupCorprorateList$ = this.angularAjax.sendAjaxRequest(this.CONSTANTS.GET_GROUP_APPLICANT, {})
            .pipe(map(response => {
                console.log(response);
                this.selectedCorporate = response.dataList[0];
                return response.dataList;
            }));
    }

    getProductDetailsList(productKey) {
        const data = {dataMap: {pCode: productKey, id: undefined}};
        data.dataMap.id = this.userService.isGroupSelected ? this.selectedCorporate.enrichments.id : undefined;

        // FX COMPLETED TRANSACTION SUMMARY
        // tslint:disable-next-line:max-line-length
        // const response = {"responseStatus":{"message":"","status":"0"},"productKey":"1","productDetails":[{"label":"FX COMPLETED TRANSACTION SUMMARY","header":["Deal Type","Deal Date","Bank Buy/Sell","Currency","Amount","Value Date","Ccy Pair","Other Ccy","Deal Rate","Other Amount","Deal No"],"data":[[{"header":"deal type","value":"FXSPOT","type":"String","isDisplay":"Y"},{"header":"deal date","value":"17-NOV-2020","type":"String","isDisplay":"Y"},{"header":"purchase sale","value":"BUY","type":"String","isDisplay":"Y"},{"header":"Currency","value":"USD","type":"String","isDisplay":"Y"},{"header":"Amount","value":"1,000,000.00","type":"Amount","isDisplay":"Y"},{"header":"Value Date","value":"19-NOV-2020","type":"String","isDisplay":"Y"},{"header":"Ccy Pair","value":"USD/LKR","type":"String","isDisplay":"Y"},{"header":"other ccy","value":"LKR","type":"String","isDisplay":"Y"},{"header":"deal rate","value":"185.70","type":"Amount","isDisplay":"Y"},{"header":"Other amount","value":"185,700,000.00","type":"Amount","isDisplay":"Y"},{"header":"deal No","value":"3310401","type":"String","isDisplay":"Y"}],[{"header":"deal type","value":"FXSPOT","type":"String","isDisplay":"Y"},{"header":"deal date","value":"28-FEB-2020","type":"String","isDisplay":"Y"},{"header":"purchase sale","value":"BUY","type":"String","isDisplay":"Y"},{"header":"Currency","value":"USD","type":"String","isDisplay":"Y"},{"header":"Amount","value":"1,000,000.00","type":"Amount","isDisplay":"Y"},{"header":"Value Date","value":"03-MAR-2020","type":"String","isDisplay":"Y"},{"header":"Ccy Pair","value":"USD/LKR","type":"String","isDisplay":"Y"},{"header":"other ccy","value":"LKR","type":"String","isDisplay":"Y"},{"header":"deal rate","value":"181.86","type":"Amount","isDisplay":"Y"},{"header":"Other amount","value":"181,860,000.00","type":"Amount","isDisplay":"Y"},{"header":"deal No","value":"2838305","type":"String","isDisplay":"Y"}],[{"header":"deal type","value":"FXSPOT","type":"String","isDisplay":"Y"},{"header":"deal date","value":"06-JAN-2020","type":"String","isDisplay":"Y"},{"header":"purchase sale","value":"BUY","type":"String","isDisplay":"Y"},{"header":"Currency","value":"USD","type":"String","isDisplay":"Y"},{"header":"Amount","value":"2,000,000.00","type":"Amount","isDisplay":"Y"},{"header":"Value Date","value":"08-JAN-2020","type":"String","isDisplay":"Y"},{"header":"Ccy Pair","value":"USD/LKR","type":"String","isDisplay":"Y"},{"header":"other ccy","value":"LKR","type":"String","isDisplay":"Y"},{"header":"deal rate","value":"181.40","type":"Amount","isDisplay":"Y"},{"header":"Other amount","value":"362,800,000.00","type":"Amount","isDisplay":"Y"},{"header":"deal No","value":"2725680","type":"String","isDisplay":"Y"}],[{"header":"deal type","value":"FXSPOT","type":"String","isDisplay":"Y"},{"header":"deal date","value":"06-JAN-2020","type":"String","isDisplay":"Y"},{"header":"purchase sale","value":"BUY","type":"String","isDisplay":"Y"},{"header":"Currency","value":"USD","type":"String","isDisplay":"Y"},{"header":"Amount","value":"2,000,000.00","type":"Amount","isDisplay":"Y"},{"header":"Value Date","value":"08-JAN-2020","type":"String","isDisplay":"Y"},{"header":"Ccy Pair","value":"USD/LKR","type":"String","isDisplay":"Y"},{"header":"other ccy","value":"LKR","type":"String","isDisplay":"Y"},{"header":"deal rate","value":"181.40","type":"Amount","isDisplay":"Y"},{"header":"Other amount","value":"362,800,000.00","type":"Amount","isDisplay":"Y"},{"header":"deal No","value":"2725428","type":"String","isDisplay":"Y"}]]}],"loggable":false,"entityIdentifier":""};

        /*FX FORWARD CONTRACTS*/
        // const response = {"responseStatus":{"message":"","status":"0"},"productKey":"2","productDetails":[{"label":"FX FORWARD CONTRACTS","header":["Deal Type","Deal Date","Bank Buy/Sell","Currency","Amount","Value Date","Ccy Pair","Other Ccy","Deal Rate","Other Amount","Deal No"],"data":[[{"header":"Deal Type","value":"FXSPOT","type":"String","isDisplay":"Y"},{"header":"Deal Date","value":"01-JAN-2021","type":"String","isDisplay":"Y"},{"header":"Purchase Sale","value":"SELL","type":"String","isDisplay":"Y"},{"header":"Currency","value":"USD","type":"String","isDisplay":"Y"},{"header":"Amount","value":"1,000,000.00","type":"Amount","isDisplay":"Y"},{"header":"Value Date","value":"05-JAN-2021","type":"String","isDisplay":"Y"},{"header":"label","value":"USD/LKR","type":"Ccy Pair","isDisplay":"Y"},{"header":"Other Ccy","value":"LKR","type":"String","isDisplay":"Y"},{"header":"Deal Rate","value":"187.50","type":"Amount","isDisplay":"Y"},{"header":"Other Amount","value":"187,500,000.00","type":"Amount","isDisplay":"Y"},{"header":"deal No","value":"3381489","type":"String","isDisplay":"Y"},{"transactionType":"SPOT","currencyPair":"USD/LKR","swapDiff":"SFXI","legDetails":[{"legType":"Leg 1","transactionSide":"BUY","counterPartyName":"50552068","amount":1000000,"rate":0,"valueDate":"05-JAN-2021"},{"legType":"Leg 2","transactionSide":"SELL","counterPartyName":"50552068","amount":187500000,"rate":187.5,"valueDate":"05-JAN-2021"}]}],[{"header":"Deal Type","value":"FXOUTS","type":"String","isDisplay":"Y"},{"header":"Deal Date","value":"01-JAN-2021","type":"String","isDisplay":"Y"},{"header":"Purchase Sale","value":"SELL","type":"String","isDisplay":"Y"},{"header":"Currency","value":"USD","type":"String","isDisplay":"Y"},{"header":"Amount","value":"2,000,000.00","type":"Amount","isDisplay":"Y"},{"header":"Value Date","value":"04-JAN-2021","type":"String","isDisplay":"Y"},{"header":"label","value":"USD/LKR","type":"Ccy Pair","isDisplay":"Y"},{"header":"Other Ccy","value":"LKR","type":"String","isDisplay":"Y"},{"header":"Deal Rate","value":"186.00","type":"Amount","isDisplay":"Y"},{"header":"Other Amount","value":"371,835,000.00","type":"Amount","isDisplay":"Y"},{"header":"deal No","value":"3381495","type":"String","isDisplay":"Y"},{"transactionType":"FWD","currencyPair":"USD/LKR","swapDiff":"SFXI","legDetails":[{"legType":"Leg 1","transactionSide":"BUY","counterPartyName":"50552068","amount":2000000,"rate":186,"valueDate":"05-JAN-2021"},{"legType":"Leg 2","transactionSide":"SELL","counterPartyName":"50552068","amount":371835000,"rate":185.9175,"valueDate":"05-JAN-2021"}]}],[{"header":"Deal Type","value":"FXOUTL","type":"String","isDisplay":"Y"},{"header":"Deal Date","value":"01-JAN-2021","type":"String","isDisplay":"Y"},{"header":"Purchase Sale","value":"SELL","type":"String","isDisplay":"Y"},{"header":"Currency","value":"USD","type":"String","isDisplay":"Y"},{"header":"Amount","value":"1,000,000.00","type":"Amount","isDisplay":"Y"},{"header":"Value Date","value":"12-JAN-2021","type":"String","isDisplay":"Y"},{"header":"label","value":"USD/LKR","type":"Ccy Pair","isDisplay":"Y"},{"header":"Other Ccy","value":"LKR","type":"String","isDisplay":"Y"},{"header":"Deal Rate","value":"186.00","type":"Amount","isDisplay":"Y"},{"header":"Other Amount","value":"184,500,000.00","type":"Amount","isDisplay":"Y"},{"header":"deal No","value":"3381490","type":"String","isDisplay":"Y"},{"transactionType":"FWD","currencyPair":"USD/LKR","swapDiff":"SFXI","legDetails":[{"legType":"Leg 1","transactionSide":"BUY","counterPartyName":"50552068","amount":1000000,"rate":186,"valueDate":"05-JAN-2021"},{"legType":"Leg 2","transactionSide":"SELL","counterPartyName":"50552068","amount":184500000,"rate":184.5,"valueDate":"05-JAN-2021"}]}],[{"header":"Deal Type","value":"FXSWAP","type":"String","isDisplay":"Y"},{"header":"Deal Date","value":"01-JAN-2021","type":"String","isDisplay":"Y"},{"header":"Purchase Sale","value":"BUY","type":"String","isDisplay":"Y"},{"header":"Currency","value":"USD","type":"String","isDisplay":"Y"},{"header":"Amount","value":"1,000,000.00","type":"Amount","isDisplay":"Y"},{"header":"Value Date","value":"05-JAN-2021","type":"String","isDisplay":"Y"},{"header":"label","value":"USD/LKR","type":"Ccy Pair","isDisplay":"Y"},{"header":"Other Ccy","value":"LKR","type":"String","isDisplay":"Y"},{"header":"Deal Rate","value":"187.50","type":"Amount","isDisplay":"Y"},{"header":"Other Amount","value":"187,500,000.00","type":"Amount","isDisplay":"Y"},{"header":"deal No","value":"3381491","type":"String","isDisplay":"Y"},{"transactionType":"FWD","currencyPair":"USD/LKR","swapDiff":"SFXI","legDetails":[{"legType":"Leg 1","transactionSide":"BUY","counterPartyName":"50552068","amount":187500000,"rate":187.5,"valueDate":"05-JAN-2021"},{"legType":"Leg 2","transactionSide":"SELL","counterPartyName":"50552068","amount":1000000,"rate":185,"valueDate":"05-JAN-2021"}]}]]}],"loggable":false,"entityIdentifier":""};
        // return of(response);
        return this.angularAjax.sendAjaxRequest(this.CONSTANTS.GET_PRODUCTDETAILSLIST, data);
    }
    getNewsFlashLink(){
        return this.angularAjax.sendAjaxRequest(this.CONSTANTS.GET_NEWSFLASHLINK, {});
    }
}
