import {Injectable} from '@angular/core';
import {AngularAjaxService} from "../../../../services/aps-services/ajaxService/angular-ajax.service";
import {BehaviorSubject, of, Subject} from "rxjs";
import {GeneralService, LoadingStatus} from "../../../../services/general.service";
import {catchError, map} from "rxjs/operators";
import {AlertController, ModalController, NavController} from "@ionic/angular";
import {ObjTransferService} from "../../../../services/aps-services/obj-transfer.service";
import {SelectAuthorizerComponent} from "../../../../components/select-authorizer/select-authorizer/select-authorizer.component";
import {UserService} from "../../../../services/aps-services/user.service";

@Injectable()
export class LpoppService {

    pageTitle: string;
    onlyAlphanumeric = "^[a-zA-Z0-9]+$";
    amountRgx = "^[0-9,.]+$"; /*  /^[0-9]*$/  */
    CONSTANTS = {
        ENTITY_NAME: "LPOPPREQUEST",
        GET_GENERAL_API: 'paypro/generalService/private/getValueByType',
        GET_INSTITUITION_TYPES: 'paypro/lpoppRequestService/private/getInstitutionTypes',
        GET_DEBIT_ACCOUNTS: 'paypro/lpoppRequestService/private/getDebitAccounts',
        CREATE: 'paypro/lpoppRequestService/private/create',
        GET_RECEIPT: 'paypro/lpoppRequestService/private/getReceipt',
        VALID_SLCP_REQUEST: 'paypro/lpoppRequestService/private/validSlcpRequest',
        GET_AUTHORIZER_TO_SELECT: 'paypro/lpoppRequestService/private/getAuthorizerToSelect',
        SET_AUTHORIZER_TO_SELECT: 'paypro/lpoppRequestService/private/setAuthorizerToSelect',
        CHECK_SELF_AUTH: 'paypro/lpoppRequestService/private/checkSelfAuth',
        GET_INSTITUTION_LIST: 'paypro/lpoppRequestService/private/getInstitutionList',
        GET_EPF_DETAILS: 'paypro/lpoppRequestService/private/getEpfDetails',
        GET_TAXABLE_PERIOD: 'paypro/lpoppRequestService/private/getTaxablePeriod',
        GET_TAX_TYPE: '3002',
        GET_PAYMENT_TYPE: '3003',
        LPOPP_SLPAP_PAYMENTTYPE : '3004',
        LPOPP_SLPAP_TYPEOFPAYEMNT : '3005',
        LPOPP_SLPAP_BILLTYPE: '3006'
    };
    creatingRecord$ = new BehaviorSubject<boolean>(false);

    lpoppData: any = {type: "Paypro-LpoppRequest"};
    lpoppDetailData: any = {};
    _lpoppRequestDet: any = {};

    taxTypeList;
    lpoppRequestDetObj: any = {};
    _lodingDetObj: BehaviorSubject<LoadingStatus> = new BehaviorSubject<LoadingStatus>(null);

    epfDetails: Subject<any> = new Subject();
    singleSelection: boolean;
    // validatedSlide1: BehaviorSubject<boolean> = new BehaviorSubject(true);
    disableSlide2: BehaviorSubject<boolean> = new BehaviorSubject(true);
    // validatedSlide3: BehaviorSubject<boolean> = new BehaviorSubject(false);
    institutionTypeList$: BehaviorSubject<any[]> = new BehaviorSubject(null);
    onNextFunc: BehaviorSubject<any[]> = new BehaviorSubject(null);


    constructor(private ajaxService: AngularAjaxService,
                private alertCtrl: AlertController,
                private objTransSrv: ObjTransferService,
                private modalController: ModalController,
                private navCtrl: NavController,
                private userService: UserService,
                private genericService: GeneralService) {
        this.getInstitutionTypes();
    }
    getDetTypeObj() {
        return {
            type: "Paypro-LpoppRequest" + this.lpoppData.institutionType
        };
    }

    get institutionType() {
        return this.lpoppData.institutionType;
    }
    get lpoppRequestDet() {
        return this._lpoppRequestDet;
    }

    set lpoppRequestDet(detData) {
        this._lpoppRequestDet = {
            ...this.getDetTypeObj(),
            ...detData
        };
    }

    getInstitutionList(data) {
        console.log(data);
        return this.ajaxService.sendAjaxRequest(this.CONSTANTS.GET_INSTITUTION_LIST, data);
    }

    getInstitutionTypes() {
        this.ajaxService.sendAjaxRequest(this.CONSTANTS.GET_INSTITUITION_TYPES, {})
            .subscribe((response) => {
                if (response) {
                    this.institutionTypeList$.next(response.dataList);
                }
            });
    }

    getDebitAccount() {
        return this.ajaxService.sendAjaxRequest(this.CONSTANTS.GET_DEBIT_ACCOUNTS, {})
            .pipe(map(value => {
                const data = value.dataList;
                let dataList = value.dataList;
                if (data && this.userService.isGroupSelected) {
                    data.sort((a, b) => a.group < b.group ? -1 : (a.group > b.group ? 1 : 0));
                    const groups = new Set();
                    for (const obj of data) {
                        if (obj.enrichments.group) {
                            groups.add(obj.enrichments.group);
                        }
                    }
                    dataList = [];
                    if (groups.size > 0) {
                        for (const grp of groups) {
                            const tempData = [{
                                id: undefined,
                                displayName: grp
                            }, ...data.filter(a => a.enrichments.group === grp)];
                            dataList.push(...tempData);
                        }
                    }
                }
                console.log('group select ', dataList);
                return dataList;
            }));
    }

    typeFilterData(data) {
        return {
            filters: [
                {name: "typeId", value: data, type: "String"},
                {name: "productIdAppend", value: "Y", type: "String"}]
        };
    }
    getTaxType() {
        return this.ajaxService.sendAjaxRequest(this.CONSTANTS.GET_GENERAL_API, this.typeFilterData(this.CONSTANTS.GET_TAX_TYPE))
            .pipe(map(value => value.dataList));
    }

    getpaymentType() {
        return this.ajaxService.sendAjaxRequest(this.CONSTANTS.GET_GENERAL_API, this.typeFilterData(this.CONSTANTS.GET_PAYMENT_TYPE))
            .pipe(map(value => value.dataList));
    }

    getTaxablePeriod() {
        return this.ajaxService.sendAjaxRequest(this.CONSTANTS.GET_TAXABLE_PERIOD, {})
            .pipe(map(value => value.dataList));
    }

    checkSelfAuth() {
        const dataMap: any = {};
        if (this.lpoppData.debitAccountNo) {
            dataMap.corpDebitAccountNo = this.lpoppData.debitAccountNo.split("-")[0];
            dataMap.transactionAmount = this.lpoppData.totalAmount;

            const data = {dataMap};
            this.creatingRecord$.next(true);
            this.ajaxService.sendAjaxRequest(this.CONSTANTS.CHECK_SELF_AUTH, data)
                .pipe(
                    catchError(err => {
                        this.creatingRecord$.next(false);
                        return err;
                    }))
                .subscribe(((response) => {
                    const selectedAuthType = response.dataMap.selectedAuthType;
                    this.lpoppData.isSelfAuth = response.dataMap.isUserSelfAuth;
                    this.lpoppData.isSelfAuth ? this.generateOTP() : this.create();
                }));
        }

    }

    private generateOTP() {
        this.genericService.generateOTP()
            .pipe(
                catchError(err => {
                    this.creatingRecord$.next(false);
                    return err;
                }))
            .subscribe(async (res) => {
            const otpModal = this.genericService.showOtpAlert(this.lpoppData, "");
            /*await otpModal.present();*/
            otpModal.then((modalData) => {
                console.log('modalData', modalData);
                console.log("otpModal Close", this.lpoppData);
                if (modalData.role !== "cancel" && modalData.data.values.OTP) {
                    this.lpoppData.tokenNo = modalData.data.values.OTP;
                    delete this.lpoppData.OTP;
                    this.create();
                } else {
                    this.creatingRecord$.next(false);
                }
            });
        });
    }

    modifyRequestDetListing(updatedRequestDetObj) {
        this.lpoppData.lpoppRequestDets = [];
        const listingData = updatedRequestDetObj;
        if (listingData && listingData.dataList) {
            for (const dataObj of listingData.dataList) {
                const headerObj = listingData.headers;
                const lpoppRequestDet = this.getDetTypeObj();
                if (dataObj && dataObj.selected && dataObj.selected === 'Y') {
                    // tslint:disable-next-line:forin
                    for (const j in dataObj) {
                        const val = dataObj[j];
                        const methodName = headerObj[j] && headerObj[j].methodName;
                        if (methodName) {
                            const field = this.firstToLowerCase(methodName);
                            lpoppRequestDet[field] = val;
                        }
                    }
                    this.lpoppData.lpoppRequestDets.push(lpoppRequestDet);
                }
            }
        }
    }

    modifyRequestDetObj() {
        const lpoppRequestDet = this.getDetTypeObj();
        if (this.lpoppData.lpoppRequestDets && this.lpoppData.lpoppRequestDets.length === 0) {
            Object.assign(lpoppRequestDet, this.lpoppDetailData);
            this.lpoppData.lpoppRequestDets.push(lpoppRequestDet);
        } else {
            for (const det of this.lpoppData.lpoppRequestDets) {
                Object.assign(det, this.lpoppDetailData);
            }
        }
    }

    create() {
        this.ajaxService.sendAjaxRequest(this.CONSTANTS.CREATE, this.lpoppData)
            .pipe(
                catchError(err => {
                    this.creatingRecord$.next(false);
                    return err;
                }))
            .subscribe((response) => {
                this.creatingRecord$.next(false);
                if (response) {
                    console.log('create API Success', response);
                    // Transaction with reference no. 22140521208 successfully initiated
                    if (response && response.responseStatus.status === "0") {
                        this.successAlert({
                            responseData: response
                        });
                    }
                }
            });
    }

    async successAlert(data) {
        const msg = data.responseData.responseStatus.message;
        const successAlert = await this.alertCtrl.create({
            header: 'Successfully Initiated',
            message: `<p>${msg}</p>`,
            buttons: [
                {
                    text: 'OK',
                    handler: () => {
                        // this.alertCtrl.dismiss({ successResponse: data });
                    }
                },
            ],
        });

        successAlert.onWillDismiss().then((res) => {
            // this.recordSubmitted = true;
            const navigateLink = "menu/paypro/listing/paypro";
            this.objTransSrv.setObjData('state', { page: { entityName: "TRANSACTIONS"} });
            this.objTransSrv.setObjData('tabEntityName', this.CONSTANTS.ENTITY_NAME);
            if ((data.responseData.dataMap.displaySelectVerifierScreen
                || data.responseData.dataMap.displaySelectAuthScreen) && !this.lpoppData.isSelfAuth &&
                (data.responseData.dataMap.authLevel === "B" || data.responseData.dataMap.authLevel === "T" )) {
                const inputData = {
                    submitResponse: data.responseData,
                    dataFrom: 'INIT',
                    getLink: this.CONSTANTS.GET_AUTHORIZER_TO_SELECT,
                    setLink: this.CONSTANTS.SET_AUTHORIZER_TO_SELECT,
                    recordListType: 'SINGLE',
                    navigateLink
                };
                this.presentSelectAuthorizer(inputData);
            } else {
                this.navCtrl.navigateRoot(navigateLink);
            }
        });

        await successAlert.present();

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
            console.log("modal close");
        });
    }

    getFilter(name, value) {
        value = value || "";
        return {name, value, type: "String"};
    }

    getListingData(isEdit?) {
        this.lpoppRequestDetObj = {};
        const isInterfaceCall = isEdit ? "N" : "Y";
        let entityName = this.lpoppData.institutionType;
        if (entityName === 'IRDP') {
            const typeId = this.lpoppDetailData.paymentType === 'SELFASSESSED' ? '01' : '02';
            entityName = entityName + "_" + typeId;
        }
        const data = {pageNumber: 1, entityName, filters: []};
        const filters = data.filters;
        filters.push(this.getFilter("institutionType", this.lpoppData.institutionType));
        filters.push(this.getFilter("mstId",  this.lpoppData.id));
        filters.push(this.getFilter("isInterfaceCall",  isInterfaceCall));
        filters.push(this.getFilter("tin", this.lpoppDetailData.tin));
        filters.push(this.getFilter("taxType", this.lpoppDetailData.taxType));
        filters.push(this.getFilter("taxablePeriod", this.lpoppDetailData.taxablePeriod));
        filters.push(this.getFilter("PaymentType", this.lpoppDetailData.paymentType));
        filters.push(this.getFilter("paymentsType", this.lpoppDetailData.paymentsType));
        filters.push(this.getFilter("agentCode", this.lpoppDetailData.agentCode));
        filters.push(this.getFilter("vesselReferenceNo", this.lpoppDetailData.vesselReferenceNo));
        this.ajaxService.sendAjaxRequest(this.CONSTANTS.GET_INSTITUTION_LIST, data)
            .subscribe((response) => {
                if (response) {
                    // this._lpoppRequestDetObj.listingObj = response;

                    if (this.lpoppData.institutionType === '_IRDP') {
                        if (this.lpoppRequestDet.paymentType === 'SELFASSESSED') {
                        // tslint:disable-next-line:max-line-length
                            response = { responseStatus: { message: "", status: "0" }, entityName: "BSINGLEPAYMENTREQUEST", headers: [{ displayName: "Id", type: "String", isDisplay: "N", methodName: "Id" }, { displayName: "Tax Period", type: "String", isDisplay: "Y", methodName: "TaxPeriod" }, { displayName: "Payment Period", type: "String", isDisplay: "Y", methodName: "PaymentPeriod" }, { displayName: "Due Date", type: "Date", isDisplay: "Y", methodName: "DueDate" }, { displayName: "DIN", type: "String", isDisplay: "Y", methodName: "Din" }, { displayName: "Payment Period Begin Date", type: "Date", isDisplay: "Y", methodName: "PaymentPeriodBeginDate" }, { displayName: "Payment Period End Date", type: "Date", isDisplay: "Y", methodName: "PaymentPeriodEndDate" }], dataList: [ ["AHocGlGsA6E=,1", "1718", "18030", "15-Apr-2018", "100001141714435", "01-Mar-2018", "31-Mar-2018"], ["BHocGlGsA6E=,1", "1718", "18030", "15-Mar-2018", "100001141714425", "01-Feb-2018", "31-Feb-2018"], ["CHocGlGsA6E=,1", "1718", "18030", "15-Feb-2018", "100001141714415", "01-Jan-2018", "31-Jan-2018"], ["DHocGlGsA6E=,1", "1718", "17120", "15-Jan-2018", "100001141714405", "01-Dec-2017", "31-Dec-2017"] ], filters: [], pageNumber: 1, totalPages: 1, totalRecords: 1, access: ["VIEW", "DATA-ENTRY", "AUTHORIZE", "EXECUTE"], links: [ [{ index: 1, displayName: "View", icon: "fa fa-eye", url: null, onClick: "view('0HocGlGsA6E=,1')", onMouseOver: null, onMouseLeave: null }] ], enrichments: { selectedAuthType: "SOFTTOKEN" }, entityIdentifier: "", loggable: false };
                        } else {
                            // tslint:disable-next-line:max-line-length
                            response = { responseStatus: { message: "", status: "0" }, entityName: "BSINGLEPAYMENTREQUEST", headers: [{ displayName: "Id", type: "String", isDisplay: "N", methodName: "Id" }, { displayName: "Tax Period", type: "String", isDisplay: "Y", methodName: "TaxPeriod" }, { displayName: "Payment Period", type: "String", isDisplay: "Y", methodName: "PaymentPeriod" }, { displayName: "Due Date", type: "Date", isDisplay: "Y", methodName: "DueDate" }, { displayName: "DIN", type: "String", isDisplay: "Y", methodName: "Din" }, { displayName: "Charge No", type: "String", isDisplay: "Y", methodName: "ChargeNo" }, { displayName: "ASMT Seq", type: "String", isDisplay: "Y", methodName: "AsmtSeq" }, { displayName: "Payment Period Begin Date", type: "Date", isDisplay: "Y", methodName: "PaymentPeriodBeginDate" }, { displayName: "Payment Period End Date", type: "Date", isDisplay: "Y", methodName: "PaymentPeriodEndDate" }], dataList: [ ["ASocGlGsA6E=,1", "1617", "16170", "15-Sep-2017", "100001121918035", "0201617001", "1", "01-Apr-2016", "31-Mar-2017"], ["BSocGlGsA6E=,1", "1617", "16170", "15-Sep-2017", "100001121918037", "0201617002", "2", "01-Apr-2016", "31-Mar-2017"] ], filters: [], pageNumber: 1, totalPages: 1, totalRecords: 1, access: ["VIEW", "DATA-ENTRY", "AUTHORIZE", "EXECUTE"], links: [ [{ index: 1, displayName: "View", icon: "fa fa-eye", url: null, onClick: "view('0HocGlGsA6E=,1')", onMouseOver: null, onMouseLeave: null }] ], enrichments: { selectedAuthType: "SOFTTOKEN" }, entityIdentifier: "", loggable: false };
                        }
                    } else if (this.lpoppData.institutionType === '_SLPAP') {
                        // tslint:disable-next-line:max-line-length
                        response = {responseStatus: {message: "", status: "0"}, entityName: "BSINGLEPAYMENTREQUEST", headers: [{displayName: "Id", type: "String", isDisplay: "N", methodName: "Id"}, {displayName: "Bill Type", type: "String", isDisplay: "Y", methodName: "BillType"}, {displayName: "Description", type: "String", isDisplay: "Y", methodName: "Description"}, {displayName: "Amount", type: "Amount", isDisplay: "Y", methodName: "Amount", isEditable: "Y", mandatory: "Y", fieldType: "Amount"}], dataList: [["A5ocGlGsA6E=,1", "NM", "Nevigation Dues", "1,250"], ["B5ocGlGsA6E=,1", "SO", "Stevedoring Bill", "2,250"], ["C5ocGlGsA6E=,1", "SG", "Stevedoring Gear", "3,250"], ["D5ocGlGsA6E=,1", "SH", "Harbour Tonnage", "4,250"], ["E5ocGlGsA6E=,1", "SW", "Stevedoring Water Bill", "5,250"], ["F5ocGlGsA6E=,1", "SE", "Stevedoring Electricity Bill", "6,250"]], filters: [], pageNumber: 1, totalPages: 1, totalRecords: 1, access: ["VIEW", "DATA-ENTRY", "AUTHORIZE", "EXECUTE"], links: [[{index: 1, displayName: "View", icon: "fa fa-eye", url: null, onClick: "view('0HocGlGsA6E=,1')", onMouseOver: null, onMouseLeave: null}]], enrichments: {selectedAuthType: "SOFTTOKEN"}, entityIdentifier: "", loggable: false};
                    } else if (this.lpoppData.institutionType === 'CICTP') {
                        // tslint:disable-next-line:max-line-length
                        response = {responseStatus: {message: "", status: "0"}, entityName: "BSINGLEPAYMENTREQUEST", headers: [{displayName: "Id", type: "String", isDisplay: "N", methodName: "Id"}, {displayName: "Container No", type: "String", isDisplay: "Y", methodName: "containerNo"}, {displayName: "Line Release", type: "String", isDisplay: "Y", methodName: "lineRelease"}, {displayName: "SLPA WARF Paid", type: "Amount", isDisplay: "Y", methodName: "slpaWarfPaid"}, {displayName: "Weight Charges", type: "String", isDisplay: "Y", methodName: "weightCharges", isEditable: "Y", fieldType: "Select", mandatory: "Y", url: "corporateBranchService/private/getPrintBranches"}, {displayName: "Collection Date", type: "Date", isDisplay: "Y", methodName: "collectionDate", isEditable: "Y", fieldType: "Date", mandatory: "Y"}, {displayName: "Outstanding Amount", type: "Amount", isDisplay: "Y", methodName: "outstandingAmount"}, {displayName: "Tax", type: "Amount", isDisplay: "Y", methodName: "tax"}, {displayName: "Total", type: "Amount", isDisplay: "Y", methodName: "total"}, {displayName: "Action", type: "String", isDisplay: "Y", methodName: "Action", isEditable: "Y", fieldType: "Link", linkDisplayName: "Fetch Amount", linkFunction: "fetchAmount"}], dataList: [["A5ocGlGsA6E=,1", "CMHU123", "Y", "Y", "TWOWAY", "05-Mar-2018", "XXX,XXX.XX", "XXX,XXX.XX", "XXX,XXX.XX", ""], ["B5ocGlGsA6E=,1", "CMHU123", "Y", "Y", "", "05-Mar-2018", "XXX,XXX.XX", "XXX,XXX.XX", "XXX,XXX.XX", ""]], filters: [], pageNumber: 1, totalPages: 1, totalRecords: 1, access: ["VIEW", "DATA-ENTRY", "AUTHORIZE", "EXECUTE"], links: [[{index: 1, displayName: "View", icon: "fa fa-eye", url: null, onClick: "view('0HocGlGsA6E=,1')", onMouseOver: null, onMouseLeave: null}]], enrichments: {selectedAuthType: "SOFTTOKEN"}, entityIdentifier: "", loggable: false};
                    }
                    this.sortListingData(response, isInterfaceCall);
                    this.getFilterListingData(response);
                    this.lpoppRequestDetObj = response;
                    this.lpoppRequestDetObj.listingObjCopy = JSON.parse(JSON.stringify(this.lpoppRequestDetObj));
                    this._lodingDetObj.next(LoadingStatus.COMPLETE);
                }
            });
    }

    sortListingData(dataObj, isInterfaceCall) {
        const headerList = [];
        // let header;
        if (dataObj) {
            // tslint:disable-next-line:forin
            for (const i in dataObj.dataList) {
                const data = dataObj.dataList[i];
                const newData: any = [];
                // tslint:disable-next-line:forin
                for (const j in data) {
                    let dataVal = data[j];
                    const header = dataObj.headers[j];
                    if (header && header.isDisplay === 'Y' || header.methodName === 'Id' || header.methodName == 'TransactionIdNo') {
                        if (header.methodName === 'TransactionIdNo') {
                            this.lpoppRequestDetObj.transactionIdNo = dataVal;
                        }
                        if (!this.lpoppData.authorized && header.methodName == 'PostingReturnReason') {
                            continue;
                        }
                        if (header.isEditable === 'Y' && dataVal === '-' && isInterfaceCall === "Y") {
                            dataVal = undefined;
                        }
                        newData.push(dataVal);
                    }
                }
                if (isInterfaceCall === "N") {
                    newData.selected = 'Y';
                }
                dataObj.dataList[i] = newData;
            }
            for (const header1 of dataObj.headers) {
                // header = dataObj.headers[k];
                if (header1 && header1.isDisplay === 'Y' || header1.methodName === 'Id' || header1.methodName == 'TransactionIdNo') {
                    if (!this.lpoppData.authorized && header1.methodName == 'PostingReturnReason') {
                        continue;
                    }
                    headerList.push(header1);
                }
            }
        }
        dataObj.headers = headerList;
    }

    getFilterListingData(dataObj) {
        const filterList = [];
        if (dataObj) {
            for (const header of dataObj.headers) {
                if (header && header.isEditable === 'Y' && header.fieldType === 'Select') {

                    if (header.url) {
                        const urlData = header.urlData || {};
                        this.ajaxService.sendAjaxRequest(this.CONSTANTS.GET_INSTITUTION_LIST, urlData)
                            .subscribe((response) => {
                                response = {
                                    responseStatus: {message: "", status: "0"},
                                    dataList: [{id: "TWOWAY", displayName: "2-Way"}, {
                                        id: "ONEWAY",
                                        displayName: "1-Way"
                                    }, {id: "ZEROWAY", displayName: "0-Way"}],
                                    entityIdentifier: "",
                                    loggable: false
                                };
                                const dataList = response.dataList;
                                filterList[header.methodName] = dataList;
                                if (response) {
                                    this.taxTypeList = response.dataList;
                                }
                            });
                    }
                }
            }
        }

        dataObj.filterList = filterList;
    }

    getAmount(val) {
        val = val ? val : "0";
        return parseFloat(val.replaceAll("," , ""));
    }

    firstToLowerCase(data) {
        return data.charAt(0).toLowerCase() + data.slice(1);
    }

    getPaymentsTypeList() {
        return this.ajaxService.sendAjaxRequest(this.CONSTANTS.GET_GENERAL_API, this.typeFilterData(this.CONSTANTS.LPOPP_SLPAP_PAYMENTTYPE))
            .pipe(map(value => value.dataList));
    }

    getTypeOfPaymentList() {
        // tslint:disable-next-line:max-line-length
        return this.ajaxService.sendAjaxRequest(this.CONSTANTS.GET_GENERAL_API, this.typeFilterData(this.CONSTANTS.LPOPP_SLPAP_TYPEOFPAYEMNT))
            .pipe(map(value => value.dataList));
    }

    getbillTypeFullList() {
        return this.ajaxService.sendAjaxRequest(this.CONSTANTS.GET_GENERAL_API, this.typeFilterData(this.CONSTANTS.LPOPP_SLPAP_BILLTYPE))
            .pipe(map(value => value.dataList));
    }

    getEpfDetails(data) {
        this.ajaxService.sendAjaxRequest(this.CONSTANTS.GET_EPF_DETAILS, data)
            .subscribe(response => this.epfDetails.next(response.dataMap));
    }
}
