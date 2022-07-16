import {Injectable} from '@angular/core';
import {ToastService} from '../services/aps-services/toast-service';
import {LoadingService} from '../services/aps-services/loading-service';
import {map, switchMap} from "rxjs/operators";
import {AngularAjaxService} from "../services/aps-services/ajaxService/angular-ajax.service";
import {BehaviorSubject, of} from "rxjs";
import {UserService} from "../services/aps-services/user.service";

export const ALL_WIDGETS = [
    {
        moduleName: 'Payments',
        widgetList: [
            { widgetName: "PENDINGTRANSACTIONCOUNT", index: 5 },
            { widgetName: "PROCESSQUEUECOUNT", index: 2 },
            { widgetName: "ACCOUNTSUMMARY", index: 3 },
            { widgetName: "UPCOMINGEVENTS", index: 4 },
            { widgetName: "PROCESSINGTXNCOUNT", index: 1 }
        ]
    },
    {
        moduleName: 'ImportTrade',
        widgetList: [
            { widgetName: "TRANSACTIONWISESUMMARY", index: 1 },
            { widgetName: "TRANSACTIONSTATUSSUMMARY", index: 2 },
        ]
    },
    {
        moduleName: 'ExportTrade',
        widgetList: [
            { widgetName: "TRANSACTIONWISESUMMARY", index: 1 },
            { widgetName: "TRANSACTIONSTATUSSUMMARY", index: 2 }
        ]
    }
];


@Injectable({ providedIn: 'root' })
export class DashboardService {

    private DASHBOARD_CONST = {
        GET_USERPERSONALIZATION_DETAILS: 'dashboardService/private/getUserPersonalizationDetails',
        SET_USERPERSONALIZATION_DETAILS: 'dashboardService/private/setUserPersonalizationDetails',
        GET_TRANSACTION_COUNT: 'dashboardService/private/getTransactionCount',
        GET_PROCESSING_TXN_COUNT: 'dashboardService/private/getProcessingTxnCount',
        GET_UPCOMING_EVENTS_DETAILS: 'dashboardService/private/getUpcomingEventsDetails',
        GET_PROCESS_QUEUE_COUNT: 'dashboardService/private/getProcessQueueCount',
        GET_ACCOUNT_TYPE_WISE_BALANCE: 'accountSummaryService/private/getAccountTypeWiseBalanceMobile',
        GET_TRANSACTION_WISE_SUMMARY_IMPORT: 'trade/dashboardService/private/getTransactionWiseSummaryImport',
        GET_TRANSACTION_STATUS_SUMMARY_IMPORT: 'trade/dashboardService/private/getTransactionStatusSummaryImport',
        GET_TRANSACTION_WISE_SUMMARY_EXPORT: 'trade/dashboardService/private/getTransactionWiseSummaryExport',
        GET_TRANSACTION_STATUS_SUMMARY_EXPORT: 'trade/dashboardService/private/getTransactionStatusSummaryExport',
        GET_APPLICANTS:"corporateUser/private/getApplicant"
    };
    widgetsData: any = {};
    private _tabsArray: BehaviorSubject<any[]> = new BehaviorSubject([]);
    tabsArray$ = this._tabsArray.asObservable();
    allWidgets = ALL_WIDGETS;

    private _applicableModules: BehaviorSubject<any[]> = new BehaviorSubject([]);
    applicableModules$ = this._applicableModules.asObservable();

    private _transactionAuthAvailable: BehaviorSubject<any> = new BehaviorSubject(null);
    transactionAuthAvailable$ = this._transactionAuthAvailable.asObservable();

     

    widgetEditMode = false;

    constructor(
        private loadingService: LoadingService,
        private toastCtrl: ToastService,
        private ajaxService: AngularAjaxService,
        private userService: UserService) {

        console.log('DashboardService ngOnInit');
        this.userService.menu$.subscribe((modules: any[]) => {
            console.log('Dashboard serv menu$', modules);
            if (modules) {
                const tabs = [];
                modules.forEach((module) => {
                    tabs.push({
                        moduleId: module.moduleId,
                        moduleName: module.moduleName,
                        displayName: module.displayName
                    });
                });
                this._applicableModules.next(tabs);
            }
        });
        this.getTransactionCout().subscribe(res=>{console.log(res)});
    }

    getUserPersonalizationDetails(moduleId, tradeloginType?) {
        const data = {
            dataMap: {
                moduleId,
                moduleName: undefined
            }
        };
        if (tradeloginType === 'IMPORT') {
            data.dataMap.moduleName = "TRADE_IMPORT";
        } else if (tradeloginType === 'EXPORT') {
            data.dataMap.moduleName = "TRADE_EXPORT";
        }
        if (this._transactionAuthAvailable.value != null) {
            return this.ajaxService.sendAjaxRequest(this.DASHBOARD_CONST.GET_USERPERSONALIZATION_DETAILS, data);

        } else {
            return this.getTransactionCout().pipe(switchMap(sourceValue => {
                return this.ajaxService.sendAjaxRequest(this.DASHBOARD_CONST.GET_USERPERSONALIZATION_DETAILS, data);
            }));
        }
    }

    setUserPersonalizationDetails(widgtData, moduleId, tradeloginType?) {
        const widgetOrder = JSON.stringify(widgtData);
        const data = { dataMap: { widgetOrder, moduleId, moduleName: undefined } };

        if (tradeloginType === 'IMPORT') {
            data.dataMap.moduleName = "TRADE_IMPORT";
        } else if (tradeloginType === 'EXPORT') {
            data.dataMap.moduleName = "TRADE_EXPORT";
        }
        console.log('to server ', data);
        return this.ajaxService.sendAjaxRequest(this.DASHBOARD_CONST.SET_USERPERSONALIZATION_DETAILS, data);
    }

    getTransactionCout() {
        if (this.widgetEditMode && this.widgetsData['GET_TRANSACTION_COUNT']) {
            return of(this.widgetsData['GET_TRANSACTION_COUNT']);
        }
        return this.ajaxService.sendAjaxRequest(this.DASHBOARD_CONST.GET_TRANSACTION_COUNT, {}, 'POST', false)
        .pipe(map((response) => {
            this.widgetsData['GET_TRANSACTION_COUNT'] = response;
            if(response && response.pendingTxnCount && response.pendingTxnCount.length === 0){
                this._transactionAuthAvailable.next(false);
            }else{
                this._transactionAuthAvailable.next(true);
            }
            return response;
        }));
    }

    getProcessingTxnCount() {
        if (this.widgetEditMode && this.widgetsData['GET_PROCESSING_TXN_COUNT']) {
            return of(this.widgetsData['GET_PROCESSING_TXN_COUNT']);
        }
        return this.ajaxService.sendAjaxRequest(this.DASHBOARD_CONST.GET_PROCESSING_TXN_COUNT, {}, 'POST', false)
        .pipe(map((response) => {
            this.widgetsData['GET_PROCESSING_TXN_COUNT'] = response;
            return response;
        }));
    }

    getUpcomingEventsDetails() {
        if (this.widgetEditMode && this.widgetsData['GET_UPCOMING_EVENTS_DETAILS']) {
            return of(this.widgetsData['GET_UPCOMING_EVENTS_DETAILS']);
        }
        return this.ajaxService.sendAjaxRequest(this.DASHBOARD_CONST.GET_UPCOMING_EVENTS_DETAILS, {}, 'POST', false)
        .pipe(map((response) => {
            this.widgetsData['GET_UPCOMING_EVENTS_DETAILS'] = response;
            return response;
        }));
    }

    getProcessQueueCount() {
        if (this.widgetEditMode && this.widgetsData['GET_PROCESS_QUEUE_COUNT']) {
            return of(this.widgetsData['GET_PROCESS_QUEUE_COUNT']);
        }
        return this.ajaxService.sendAjaxRequest(this.DASHBOARD_CONST.GET_PROCESS_QUEUE_COUNT, {}, 'POST', false)
        .pipe(map((response) => {
            this.widgetsData['GET_PROCESS_QUEUE_COUNT'] = response;
            return response;
        }));
    }

    getAccountTypeWiseBalance(data) {
        if(data && data.dataMap && data.dataMap.cifNumber){
            if(this.widgetEditMode && this.widgetsData[data.dataMap.cifNumber]){
                return of(this.widgetsData[data.dataMap.cifNumber]);
            }
        }else if (this.widgetEditMode && this.widgetsData['GET_ACCOUNT_TYPE_WISE_BALANCE']) {
            return of(this.widgetsData['GET_ACCOUNT_TYPE_WISE_BALANCE']);
        }
        return this.ajaxService.sendAjaxRequest(this.DASHBOARD_CONST.GET_ACCOUNT_TYPE_WISE_BALANCE,data, 'POST', false)
            .pipe(map((response) => {
                this.widgetsData['GET_ACCOUNT_TYPE_WISE_BALANCE'] = response;
                if(data && data.dataMap && data.dataMap.cifNumber){
                    this.widgetsData[data.dataMap.cifNumber] = response;
                }
                return response;
            }));
    }

    getTransactionWiseSummary(type, frequency) {
        const data = { dataMap: { frequency } };
        const url = type === 'IMPORT' ? this.DASHBOARD_CONST.GET_TRANSACTION_WISE_SUMMARY_IMPORT :
                    this.DASHBOARD_CONST.GET_TRANSACTION_WISE_SUMMARY_EXPORT;
        if (this.widgetEditMode && this.widgetsData['GET_TRANSACTION_WISE_SUMMARY_' + type]) {
            return of(this.widgetsData['GET_TRANSACTION_WISE_SUMMARY_' + type]);
        }
        return this.ajaxService.sendAjaxRequest(url, data, 'POST', false)
        .pipe(map((response) => {
            this.widgetsData['GET_TRANSACTION_WISE_SUMMARY_' + type] = response;
            return response;
        }));
    }

    getTransactionStatusSummary(type, frequency) {
        const data = { dataMap: { frequency } };
        const url = type === 'IMPORT' ? this.DASHBOARD_CONST.GET_TRANSACTION_STATUS_SUMMARY_IMPORT :
                    this.DASHBOARD_CONST.GET_TRANSACTION_STATUS_SUMMARY_EXPORT;
        if (this.widgetEditMode && this.widgetsData['GET_TRANSACTION_STATUS_SUMMARY_' + type]) {
            return of(this.widgetsData['GET_TRANSACTION_STATUS_SUMMARY_' + type]);
        }
        return this.ajaxService.sendAjaxRequest(url, data, 'POST', false)
        .pipe(map((response) => {
            this.widgetsData['GET_TRANSACTION_STATUS_SUMMARY_' + type] = response;
            return response;
        }));
    }

    getApplicants(data) {
        if (this.widgetEditMode && this.widgetsData['GET_APPLICANTS']) {
            return of(this.widgetsData['GET_APPLICANTS']);
        }
        return this.ajaxService.sendAjaxRequest(this.DASHBOARD_CONST.GET_APPLICANTS, data, 'POST', false)
            .pipe(map((response) => {
                this.widgetsData['GET_APPLICANTS'] = response;
                return response;
            }));
    }
    
}

