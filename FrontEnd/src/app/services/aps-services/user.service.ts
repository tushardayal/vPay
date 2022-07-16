import {Injectable} from '@angular/core';
import * as _ from "lodash";
import {BehaviorSubject, Observable, of} from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class UserService {

    private _securityId: BehaviorSubject<any> = new BehaviorSubject(null);
    public securityId$ = this._securityId.asObservable();

    private userDetails: any;
    private enrichmentMap: any;

    private role: string[];
    private _menus: BehaviorSubject<any> = new BehaviorSubject(null);
    public menu$ = this._menus.asObservable();

    private _authType: BehaviorSubject<any> = new BehaviorSubject(null);
    public authType$ = this._authType.asObservable();

    private _avaliableGroups: BehaviorSubject<any> = new BehaviorSubject(null);
    public avaliableGroups$ = this._avaliableGroups.asObservable();

    private _showGroupSelection: BehaviorSubject<boolean> = new BehaviorSubject(null);
    public showGroupSelection$ = this._showGroupSelection.asObservable();

    private _selectedGroup: any;

    private selectedProduct;

    constructor() {
        // tslint:disable-next-line:max-line-length
        // const menuResponse = {responseStatus: {message: "", status: "0"}, modules: [{index: 2, moduleId: "puzEZCXC/HA=", moduleName: "Payments", menus: [{displayName: "Account Summary", id: "4001", url: "menu/paypro/account-summary", entityName: "ACCOUNTSUMMARY", access: ["VIEW"], faIcon: "icon-arrow-right", menuCategory: "Other"}, {displayName: "Account Statement", id: "4002", url: "menu/paypro/account-statement", entityName: "ACCOUNTSTATEMENTDOWNLOAD", access: ["VIEW", "EXECUTE"], faIcon: "icon-arrow-right", menuCategory: "Other"}, {displayName: "Transactions", id: "3000", url: "menu/paypro/listing/paypro", entityName: "TRANSACTIONS", access: ["VIEW", "DATA-ENTRY", "AUTHORIZE", "EXECUTE"], menus: [{displayName: "Own Account Transfer", id: "3027", url: "OwnAccountTransferListingPage", entityName: "OWNACCOUNTTRANSFER", defaultURL: "PENDINGLIST", serviceUrl: "ownAccountTransferService", access: ["VIEW", "DATA-ENTRY"], menuCategory: "Other", menuLinksDetail: {link: [{displayName: "Review List", url: "/private/getAuthorizedList", icon: "checkmark-circle-outline", access: "VIEW", key: "AUTHORIZEDLIST", hide: "N"}, {displayName: "Pending Authorization List", url: "/private/getPendingList", icon: "time", access: "VIEW", key: "PENDINGLIST", hide: "N"}, {displayName: "Rejected List", url: "/private/getRejectedList", icon: "close-circle-outline", access: "VIEW", key: "REJECTLIST", hide: "N"}]}}, {displayName: "Single Payment Request", id: "3012", url: "SinglePaymentListPage", entityName: "BSINGLEPAYMENTREQUEST", defaultURL: "PENDINGLIST", serviceUrl: "singlePaymentService", access: ["VIEW", "DATA-ENTRY", "EXECUTE"], menuCategory: "Other", menuLinksDetail: {link: [{displayName: "Review List", url: "/private/getAuthorizedList", icon: "checkmark-circle-outline", access: "VIEW", key: "AUTHORIZEDLIST", hide: "N"}, {displayName: "Pending Authorization List", url: "/private/getPendingList", icon: "time", access: "VIEW", key: "PENDINGLIST", hide: "N"}, {displayName: "Rejected List", url: "/private/getRejectedList", icon: "close-circle-outline", access: "VIEW", key: "REJECTLIST", hide: "N"}, {displayName: "Bank Rejected List", url: "/private/getBranchRejectedList", icon: "close-circle-outline", access: "VIEW", key: "BANKREJECTLIST", hide: "N"}]}}, {displayName: "Bulk Payment", id: "3012", url: "BulkPaymentPage", entityName: "BBULKPAYMENTREQUEST", defaultURL: "PENDINGLIST", serviceUrl: "bulkPaymentService", access: ["VIEW", "DATA-ENTRY", "EXECUTE"], menuCategory: "Other", menuLinksDetail: {link: [{displayName: "Review List", url: "/private/getAuthorizedList", icon: "checkmark-circle-outline", access: "VIEW", key: "AUTHORIZEDLIST", hide: "N"}, {displayName: "Pending Authorization List", url: "/private/getPendingList", icon: "time", access: "VIEW", key: "PENDINGLIST", hide: "N"}, {displayName: "Rejected List", url: "/private/getRejectedList", icon: "close-circle-outline", access: "VIEW", key: "REJECTLIST", hide: "N"}, {displayName: "Bank Rejected List", url: "/private/getBranchRejectedList", icon: "close-circle-outline", access: "VIEW", key: "BANKREJECTLIST", hide: "N"}]}}, {displayName: "Bill Payment", id: "3012", url: "BillPaymentPage", entityName: "BILLPAYMENT", defaultURL: "PENDINGLIST", serviceUrl: "billPaymentService", access: ["VIEW", "DATA-ENTRY", "EXECUTE"], menuCategory: "Other", menuLinksDetail: {link: [{displayName: "Review List", url: "/private/getAuthorizedList", icon: "checkmark-circle-outline", access: "VIEW", key: "AUTHORIZEDLIST", hide: "N"}, {displayName: "Pending Authorization List", url: "/private/getPendingList", icon: "time", access: "VIEW", key: "PENDINGLIST", hide: "N"}, {displayName: "Rejected List", url: "/private/getRejectedList", icon: "close-circle-outline", access: "VIEW", key: "REJECTLIST", hide: "N"}]}}], faIcon: "icon-arrow-right", menuCategory: "Tabs"}, {displayName: "Own Account Transfer", id: "3027", url: "menu/paypro/own-account-transfer-initiate", entityName: "OWNACCOUNTTRANSFER", access: ["VIEW", "DATA-ENTRY"], faIcon: "icon-arrow-right", menuCategory: "Other"}, {displayName: "Single Payment Request", id: "3012", url: "menu/paypro/single-payment-intiate", entityName: "BSINGLEPAYMENTREQUEST", access: ["VIEW", "DATA-ENTRY", "EXECUTE"], faIcon: "icon-arrow-right", menuCategory: "Other"}, {displayName: "Pay Bill", id: "4017", url: "menu/paypro/pay-bill-initiate", entityName: "BILLPAYMENT", access: ["VIEW", "DATA-ENTRY", "EXECUTE"], faIcon: "icon-arrow-right", menuCategory: "Other"}, {displayName: "Transaction Query", id: "6000", url: "menu/paypro/transaction-query", entityName: "PROCESS", access: ["EXECUTE"], menus: [{displayName: "Payment Transaction", id: "4022", url: "payment-transaction-query", entityName: "INSTRUMENTQUERYREQUEST", access: ["VIEW"], menuCategory: "Other"}, {displayName: "Bill Payment History", id: "4022", url: "bill-payment-history", entityName: "BILLPAYMENTHISTORY", access: ["VIEW"], menuCategory: "Other"}], faIcon: "icon-arrow-right", menuCategory: "Tabs"}]}, {index: 3, menus: [{access: ["VIEW", "DATA-ENTRY"], allowCorporateVsGroup: "false", displayName: "Import - Transactions", entityName: "IMPORTTRANSACTIONS", faIcon: "icon-arrow-right", id: "17041", menuCategory: "Tabs", menus: [{access: ["VIEW", "DATA-ENTRY"], allowCorporateVsGroup: "false", defaultURL: "PENDINGLIST", displayName: "Letter of Credit", entityName: "LETTEROFCREDIT", id: "17042", menuCategory: "Other", menuLinksDetail: {link: [{access: "VIEW", displayName: "Review List", hide: "N", icon: "checkmark-circle-outline", key: "AUTHORIZEDLIST", url: "/private/getAuthorizedList"}, {access: "VIEW", displayName: "Pending Authorization List", hide: "N", icon: "time", key: "PENDINGLIST", url: "/private/getPendingList"}, {access: "VIEW", displayName: "Rejected List", hide: "N", icon: "close-circle-outline", key: "REJECTLIST", url: "/private/getRejectedList"}]}, serviceUrl: "ownAccountTransferService", url: "OwnAccountTransferListingPage"}, {access: ["VIEW", "DATA-ENTRY"], allowCorporateVsGroup: "false", defaultURL: "PENDINGLIST", displayName: "Letter of Credit Amend", entityName: "LETTEROFCREDITAMEND", id: "17043", menuCategory: "Other", menuLinksDetail: {link: [{access: "VIEW", displayName: "Review List", hide: "N", icon: "checkmark-circle-outline", key: "AUTHORIZEDLIST", url: "/private/getAuthorizedList"}, {access: "VIEW", displayName: "Pending Authorization List", hide: "N", icon: "time", key: "PENDINGLIST", url: "/private/getPendingList"}, {access: "VIEW", displayName: "Rejected List", hide: "N", icon: "close-circle-outline", key: "REJECTLIST", url: "/private/getRejectedList"}]}, serviceUrl: "singlePaymentService", url: "SinglePaymentListPage"}], url: "menu/paypro/listing/paypro"}], moduleId: "8TP24AhiMiw=", moduleName: "Trade"}], entityIdentifier: "EntityIdentifier : null", loggable: false};
        // this._menus.next(menuResponse.modules);
        this.selectedProduct = "Payments";

        // console.log('user');

    }

    public get isGroupSelected(): boolean {
        return this._selectedGroup.id !== '0';
    }

    public set selectedGroup(group) {
        if (!group || !group.hasOwnProperty('id') || group.id === '0') {
            this._selectedGroup = {id: "0", displayName: "Normal", text: "Normal"};
            return;
        }
        this._selectedGroup = group;
    }

    public get selectedGroup(): any {
        return this._selectedGroup;
    }


    setEnrichmentDetails(enrichmentDetails) {
        this.enrichmentMap = enrichmentDetails;
    }


    setUserDetails(userDetails) {
        this.userDetails = userDetails;
        this._authType.next(userDetails.authType);
        this._showGroupSelection.next(userDetails.isGroupUser === 'Y');
    }

    addDataInUserDetails(key, val) {
        this.userDetails[key] = val;
    }

    setAvaliableGroups(groups: any[]) {
        this._avaliableGroups.next(groups);
    }

    createGroupSelectionActionSheet(availableOptions, selectedObj ) {
        const actionListData = [];
        for (const obj of availableOptions) {
            const btn = {
                text: obj.displayName,
                cssClass:
                    selectedObj.value && selectedObj.value.id === obj.id ? "selected-list-type" : "",
                handler: () => {
                    selectedObj.value = obj;
                    for (const btn1 of actionListData) {
                        if (btn === btn1) {
                            btn1.cssClass = "selected-list-type";
                        } else {
                            delete btn1.cssClass;
                        }
                    }
                },
            };
            actionListData.push(btn);
        }
        const cancel = {
            text: "Cancel",
            icon: "close",
            role: "cancel",
            handler: () => {
                // console.log("Cancel clicked");
            },
        };
        actionListData.push(cancel);
        return actionListData;
    }



    getUserDetails() {
        return this.userDetails;
    }

    getEnrichmentDetails() {
        return this.enrichmentMap;
    }

    setSecurityId(securityId) {
        this._securityId.next(securityId);
    }

    getRole() {
        return this.role;
    }

    setRole(role) {
        this.role = role;
    }


    getMenu() {
        if (this._menus.value && this._menus.value.modules) {
            this._menus.next(this._menus.value.modules);
        }
        const productIndex = _.findIndex(this._menus.value, ["moduleName", this.selectedProduct]);
        if (productIndex < 0 ) {
            throw new Error(("Selected Product not found"));
        }
        return this._menus.value[productIndex].menus;
    }

    setMenu(value: any) {
        const menu = this.parseMenuResponse(value);
        this._menus.next(menu);
    }

    parseMenuResponse(menus) {
        const finalMenus = [];
        for (const menu of menus) {
            if (menu.moduleName === 'Trade') {
                const importMenu = [];
                const exportMenu = [];
                for (const obj of menu.menus) {
                    if (obj.belongsTo === 'IMPORT') {
                        importMenu.push(obj);
                    } else if (obj.belongsTo === 'EXPORT') {
                        exportMenu.push(obj);
                    }
                }

                finalMenus.push({
                    displayName: "Import Trade",
                    index: menu.index,
                    moduleId: menu.moduleId,
                    moduleName: 'Import' + menu.moduleName,
                    menus: importMenu
                });

                finalMenus.push({
                    displayName: "Export Trade",
                    index: menu.index,
                    moduleId: menu.moduleId,
                    moduleName: 'Export' + menu.moduleName,
                    menus: exportMenu
                });
            } else if (menu.moduleName === "Payments") {
                menu.menus = menu.menus.filter((childMenu) => {
                    if (childMenu.entityName === 'TRANSACTIONS') {
                        if (childMenu.menus && childMenu.menus.length > 0) {
                            return childMenu;
                        }
                    } else {
                        return childMenu;
                    }
                });
                if (menu.menus && menu.menus.length > 0) {
                    menu.displayName = menu.moduleName;
                    finalMenus.push(menu);
                }
            } else {
                menu.displayName = menu.moduleName;
                finalMenus.push(menu);
            }
        }
        return finalMenus;
    }

    getSelectedProduct() {
        return this.selectedProduct;
    }

    setSelectedProduct(value) {
        this.selectedProduct = value;
    }

    getPaymentApplicationDate() {
        if (this.userDetails
            && this.userDetails.moduleDetails
            && this.userDetails.moduleDetails.Payments
            && this.userDetails.moduleDetails.Payments.currentDate) {
            // return new Date(Date.parse(this.userDetails.moduleDetails.Payments.currentDate));
            return this.userDetails.moduleDetails.Payments.currentDate;
        }
    }

    formatDate(date) {
        let d = new Date(date),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear();

        if (month.length < 2) {
            month = '0' + month;
        }
        if (day.length < 2) {
            day = '0' + day;
        }

        return [year, month, day].join('-');
    }
    onErrorProfilePic() {
        return 'assets/svg/defaultProfileImage.svg';
        // console.log('onErrorProfilePic');
    }
}
