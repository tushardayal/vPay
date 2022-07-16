import { Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren, ChangeDetectorRef } from '@angular/core';
import { IonItemSliding, MenuController, ModalController, NavController, PopoverController } from '@ionic/angular';
import { IntroPage } from '../pages/intro-page/intro-page.page';
import { DashboardService } from "./dashboard-service";
import { Chart } from "chart.js";
import { NotificationsComponent } from "./notifications/notificationPopover/notifications.component";
import * as _ from 'lodash';
import { AddNewWidgetComponent } from "./add-new-widget/add-new-widget.component";
import { SuperTabChangeEventDetail } from '@ionic-super-tabs/core';
import { NotificationService } from "./notifications/notification.service";
import { Observable } from "rxjs";
import { ObjTransferService } from '../services/aps-services/obj-transfer.service';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-dashboard',
    templateUrl: 'dashboard.page.html',
    styleUrls: ['dashboard.page.scss'],
    providers: [TranslatePipe]
})
export class DashboardPage implements OnInit {

    @ViewChild('dynamicList', { static: false }) dynamicList;
    // @ViewChild('sliding', {static: false}) sliding;
    @ViewChildren('sliding') itemSlidingList: QueryList<IonItemSliding>;
    widgetlist: any[];
    tabsArray: any[];
    originalTabsArray: any[];
    applicableTabs: any[];
    item = { background: 'assets/imgs/background/29.jpg' };
    activeTabIndex: number;

    disableReorder = true;
    disableDelete = true;
    showActionBtns = false;

    showSearch = false;
    notificationData$: Observable<any>;
    unreadNotificationCount$: Observable<any>;

    @ViewChild("barCanvas", { static: false }) barCanvas: ElementRef;
    @ViewChild("doughnutCanvas", { static: false }) doughnutCanvas: ElementRef;
    @ViewChild("lineCanvas", { static: false }) lineCanvas: ElementRef;

    private barChart: Chart;
    private doughnutChart: Chart;
    private lineChart: Chart;
    transactionAuthAvailable
    constructor(
        public modalController: ModalController,
        private navController: NavController,
        private menu: MenuController,
        private dashboardService: DashboardService,
        private popoverController: PopoverController,
        private notificationService: NotificationService,
        private objTransSrv: ObjTransferService,
        private translate: TranslatePipe,
        private changeDetector: ChangeDetectorRef
    ) {
        console.log("my DashboardPage");
        const showWizard = localStorage.getItem("SHOW_START_WIZARD");
        dashboardService.transactionAuthAvailable$.subscribe(value=>{
            this.transactionAuthAvailable = value;
        });
        // if (AppSettings.SHOW_START_WIZARD && !showWizard) {
            // this.openModal();
        // }
        menu.enable(true, 'first');
    }

    async openModal() {
        const modal = await this.modalController.create({ component: IntroPage });
        return await modal.present();
    }

    ngOnInit(): void {
        this.notificationService.getDashboardNotificationData();
        this.notificationData$ = this.notificationService.notificationData$;
        this.unreadNotificationCount$ = this.notificationService.unreadNotificationCount$;

        this.activeTabIndex = 0;
        // this.tabsArray = [];
        this.dashboardService.applicableModules$.subscribe(modules => {
            this.tabsArray = [];
            for (const module of modules) {
                const currentTab = {
                    moduleId: module.moduleId,
                    moduleName: module.moduleName,
                    displayName: module.displayName,
                    widgetList: []
                };
                this.tabsArray.push(currentTab);
            }
            this.getPersonalizationDetails();
        });
        /*this.dashboardService.tabsArray$.subscribe(tabs => {
            this.applicableTabs = tabs;
            console.log('tabsArray$ ', this.applicableTabs);
        });*/
        setTimeout(() => {
            // this.getChartData();
        }, 500);
    }

    getPersonalizationDetails() {
        let type;
        if (this.tabsArray[this.activeTabIndex].moduleName === 'ImportTrade') {
            type = "IMPORT";
        } else if (this.tabsArray[this.activeTabIndex].moduleName === 'ExportTrade') {
            type = "EXPORT";
        }
        this.objTransSrv.setObjData("type", {
            value: type
        });
        this.dashboardService.widgetEditMode = false;
        console.log("$$$$$$ getPersonalizationDetails");
        this.dashboardService.getUserPersonalizationDetails(this.tabsArray[this.activeTabIndex].moduleId, type)
            .subscribe(value => {
                if (value.dataList && value.dataList.length > 0 && value.dataList[0].displayName) {
                    console.log('widgetlist', JSON.parse(value.dataList[0].displayName));
                    const widgetlist = JSON.parse(value.dataList[0].displayName);
                    if(!this.transactionAuthAvailable && this.tabsArray[this.activeTabIndex] && this.tabsArray[this.activeTabIndex].moduleName === 'Payments') {
                        for (const index in widgetlist) {
                            if (widgetlist[index].widgetName === 'PENDINGTRANSACTIONCOUNT') {
                                widgetlist.splice(index,1);
                            }
                        }
                    }
                    this.tabsArray[this.activeTabIndex].widgetList = widgetlist;
                }
            });
    }

    onTabChange(ev: CustomEvent<SuperTabChangeEventDetail>) {
        if (ev.detail.changed) {
            this.activeTabIndex = ev.detail.index;
            this.getPersonalizationDetails();
            this.showActionBtns = false;
        }
    }

    refreshTabsArray(widgetList: any[]) {
        /*this.tabsArray = [];
        for (const tab of this.applicableTabs) {
            // for (const userTab of userTabs) {
                if (tab.moduleName === currentTab.moduleName) {
                    this.tabsArray.push(currentTab);
                    break;
                }
            // }
        }*/
        this.tabsArray[this.activeTabIndex].widgetList = widgetList;
        console.log('refreshTabsArray ', this.tabsArray);
    }

    createCopy() {
        this.originalTabsArray = JSON.parse(JSON.stringify(this.tabsArray));
    }

    deleteWidgets() {
        this.showActionBtns = true;
        // this.changeDetector.detectChanges();
        this.disableDelete = false;
        this.createCopy();
        this.itemSlidingList.forEach((itemSlide) => {
            itemSlide.open('start');
        });
        this.disableDelete = true;
        this.dashboardService.widgetEditMode = true;
    }

    reorderWidgets() {
        this.disableReorder = false;
        this.createCopy();
        this.showActionBtns = true;
        this.dashboardService.widgetEditMode = true;
        console.log('originalTabsArray', this.originalTabsArray);
    }

    deleteAction(moduleName, item) {
        console.log("deleteAction");
        const widgetList = _.find(this.tabsArray, ['moduleName', moduleName]).widgetList;
        widgetList.splice(widgetList.indexOf(item), 1);
        console.log(this.tabsArray);
    }

    ionItemReorder = (ev, moduleName): void => {
        const tempArray = _.find(this.tabsArray, ['moduleName', moduleName]).widgetList;
        tempArray.splice(ev.detail.to, 0, tempArray.splice(ev.detail.from, 1)[0]);
        console.log('After tabsArray', this.tabsArray);
        ev.detail.complete();
    }

    cancleAction() {
        // this.dynamicList.closeSlidingItems(); //not working
        this.itemSlidingList.forEach((itemSlide) => {
            itemSlide.close();
        });
        this.refreshTabsArray(this.originalTabsArray[this.activeTabIndex].widgetList);
        this.disableReorder = true;
        this.disableDelete = true;
        this.showActionBtns = false;
        this.dashboardService.widgetEditMode = true;
    }


    saveAction() {
        const widgetList = [];
        let index = 1;
        for (const widget of this.tabsArray[this.activeTabIndex].widgetList) {
            widgetList.push({
                widgetName: widget.widgetName,
                index
            });
            index++;
        }
        let type;
        if (this.tabsArray[this.activeTabIndex].moduleName === 'ImportTrade') {
            type = "IMPORT";
        } else if (this.tabsArray[this.activeTabIndex].moduleName === 'ExportTrade') {
            type = "EXPORT";
        }
        this.dashboardService.widgetEditMode = false;
        this.dashboardService.setUserPersonalizationDetails(widgetList, this.tabsArray[this.activeTabIndex].moduleId, type)
            .subscribe(value => {
                this.refreshTabsArray(widgetList);
                this.disableReorder = true;
                this.disableDelete = true;
                this.showActionBtns = false;
            });
    }

    async showAllWidgets() {
        const modal = await this.modalController.create({
            component: AddNewWidgetComponent,
            componentProps: {
                currentTab: this.tabsArray[this.activeTabIndex],
            },
        });

        modal.onDidDismiss().then((widgetData) => {
            if (widgetData && widgetData.data) {
                this.tabsArray[this.activeTabIndex].widgetList.push(widgetData.data);
                console.log('onDidDismiss ', this.tabsArray);
                this.saveAction();
            }
        });
        return await modal.present();
    }

    async showNotifications(ev: any) {
        const popover = await this.popoverController.create({
            component: NotificationsComponent,
            event: ev,
            translucent: true
        });
        return await popover.present();
    }

    /*getDisplayName(key) {
        const oldValue = key;
        key = "menu_" + key.replace(/\s/g, "_");
        key = key.toLowerCase();
        const newValue = this.translate.transform(key);
        const setValue = newValue === key ? key : newValue;
        return setValue;
    }*/
    
    getChartData() {
        this.barChart = new Chart(this.barCanvas.nativeElement, {
            type: "bar",
            data: {
                labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
                datasets: [
                    {
                        label: "# of Votes",
                        data: [12, 19, 3, 5, 2, 3],
                        backgroundColor: [
                            "rgba(42, 182, 233, 0.2)",
                            "rgba(17, 136, 79, 0.2)",
                            "rgba(117, 101, 192, 0.2)",
                            "rgba(80, 68, 134, 0.2)",
                            "rgba(136, 2, 141, 0.2)",
                            "rgba(236, 120, 186, 0.2)"
                        ],
                        borderColor: [
                            "rgba(42, 182, 233, 1)",
                            "rgba(136, 2, 141,  1)",
                            "rgba(117, 101, 192, 1)",
                            "rgba(80, 68, 134, 1)",
                            "rgba(136, 2, 141, 1)",
                            "rgb(179,130,156)"
                        ],
                        borderWidth: 1
                    }
                ]
            },
            options: {
                scales: {
                    yAxes: [
                        {
                            ticks: {
                                beginAtZero: true
                            }
                        }
                    ]
                }
            }
        });

        this.doughnutChart = new Chart(this.doughnutCanvas.nativeElement, {
            type: "doughnut",
            data: {
                labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
                datasets: [
                    {
                        label: "# of Votes",
                        data: [12, 19, 3, 5, 2, 3],
                        backgroundColor: [
                            "rgba(42, 182, 233, 0.2)",
                            "rgba(17, 136, 79, 0.2)",
                            "rgba(117, 101, 192, 0.2)",
                            "rgba(80, 68, 134, 0.2)",
                            "rgba(136, 2, 141, 0.2)",
                            "rgba(236, 120, 186, 0.2)"
                        ],
                        hoverBackgroundColor: ["#2adef0", "#11b1d5", "#759fd9", "#5075bf", "#ec82ba", "#FFCE56"]
                    }
                ]
            }
        });

        this.lineChart = new Chart(this.lineCanvas.nativeElement, {
            type: "line",
            data: {
                labels: ["January", "February", "March", "April", "May", "June", "July"],
                datasets: [
                    {
                        label: "My First dataset",
                        fill: false,
                        lineTension: 0.1,
                        backgroundColor: "rgba(75,192,192,0.4)",
                        borderColor: "rgba(75,192,192,1)",
                        borderCapStyle: "butt",
                        borderDash: [],
                        borderDashOffset: 0.0,
                        borderJoinStyle: "miter",
                        pointBorderColor: "rgba(75,192,192,1)",
                        pointBackgroundColor: "#fff",
                        pointBorderWidth: 1,
                        pointHoverRadius: 5,
                        pointHoverBackgroundColor: "rgba(75,192,192,1)",
                        pointHoverBorderColor: "rgba(220,220,220,1)",
                        pointHoverBorderWidth: 2,
                        pointRadius: 1,
                        pointHitRadius: 10,
                        data: [65, 59, 80, 81, 56, 55, 40],
                        spanGaps: false
                    }
                ]
            }
        });
    }
}
