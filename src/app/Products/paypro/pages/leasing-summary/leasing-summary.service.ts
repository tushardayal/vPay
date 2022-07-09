import { Injectable } from '@angular/core';
import {AngularAjaxService} from "../../../../services/aps-services/ajaxService/angular-ajax.service";
import {Observable, of} from "rxjs";
import {map} from "rxjs/operators";
import {UserService} from "../../../../services/aps-services/user.service";

@Injectable({
    providedIn: 'root'
})
export class LeasingSummaryService {

    CONSTANTS = {
        GET_LEASINGSUMMARY: "leasingSummaryService/private/getLeasingSummary",
        GET_LEASINGACCOUNTDETAILS: "leasingSummaryService/private/getLeasingAccountDetails",
        GET_GROUP_APPLICANT: "corporateUser/private/getApplicant"
    };

    groupCorprorateList$: Observable<any>;
    selectedCorporate: any;

    constructor(private angularAjax: AngularAjaxService,
                private userService: UserService) {
    }

    getApplicant() {
        this.groupCorprorateList$ = this.angularAjax.sendAjaxRequest(this.CONSTANTS.GET_GROUP_APPLICANT, {})
            .pipe(map(response => {
                console.log(response);
                this.selectedCorporate = response.dataList[0];
                return response.dataList;
            }));
    }

    getLeasingSummary() {
        const data = this.userService.isGroupSelected ? {dataMap: {id: this.selectedCorporate.enrichments.id}} : {};
        return this.angularAjax.sendAjaxRequest(this.CONSTANTS.GET_LEASINGSUMMARY, data);
    }

    getLeasingAccountDetails(agrementNo) {
        const data = {dataMap: {agreementNo: agrementNo, id: undefined} };
        data.dataMap.id = this.userService.isGroupSelected ? this.selectedCorporate.enrichments.id : undefined;
        // tslint:disable-next-line:max-line-length
        /*const response = {"responseStatus":{"message":"","status":"0"},"additionalDetails":[{"responseStatus":{"message":"","status":"0"},"label":"Agreement Detail","data":[{"header":"Agreement Start Date","value":"6/28/2019 12:00:00 AM","type":"String","isDisplay":"Y"},{"header":"Agreement Maturity Date","value":"7/1/2021 12:00:00 AM","type":"String","isDisplay":"Y"},{"header":"Tenor","value":"24","type":"String","isDisplay":"Y"},{"header":"Next Due Date","value":"10/1/2020 12:00:00 AM","type":"String","isDisplay":"Y"},{"header":"Agreement Branch","value":"KIRIBATHGODA","type":"String","isDisplay":"Y"},{"header":"Facility Amount","value":"10000000","type":"String","isDisplay":"Y"},{"header":"Rental Value","value":"486056","type":"String","isDisplay":"Y"},{"header":"No Of Future rentals","value":"10","type":"String","isDisplay":"Y"},{"header":"Total Receivables","value":"7793104.71","type":"String","isDisplay":"Y"}],"loggable":false,"entityIdentifier":""},{"responseStatus":{"message":"","status":"0"},"label":"Arrears Breakdown","data":[{"header":"Rental in Arrears","value":"2916336","type":"String","isDisplay":"Y"},{"header":"Overdue Interest","value":"16208.71","type":"String","isDisplay":"Y"},{"header":"Charges","value":"0","type":"String","isDisplay":"Y"},{"header":"Total Arrears","value":"2932544.71","type":"String","isDisplay":"Y"},{"header":"No of Month in Arrears","value":"6","type":"String","isDisplay":"Y"}],"loggable":false,"entityIdentifier":""},{"responseStatus":{"message":"","status":"0"},"label":"Vehicle Detail","data":[{"responseStatus":{"message":"","status":"0"},"make":{"header":"Make","value":"MERCEDES BENZ","type":"String","isDisplay":"Y"},"model":{"header":"Model","value":"E200 W213","type":"String","isDisplay":"Y"},"loggable":false,"entityIdentifier":""}],"loggable":false,"entityIdentifier":""}],"loggable":false,"entityIdentifier":""};
        return of(response);*/
        return this.angularAjax.sendAjaxRequest(this.CONSTANTS.GET_LEASINGACCOUNTDETAILS, data);
    }
}
