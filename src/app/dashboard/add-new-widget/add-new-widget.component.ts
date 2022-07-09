import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { DashboardService } from './../dashboard-service';
import {Component, OnInit} from '@angular/core';
import {ModalController} from "@ionic/angular";
import * as _ from 'lodash';
import {ToastService} from "../../services/aps-services/toast-service";
import {ALL_WIDGETS} from "../dashboard-service";

@Component({
    selector: 'app-add-new-widget',
    templateUrl: './add-new-widget.component.html',
    styleUrls: ['./add-new-widget.component.scss'],
})
export class AddNewWidgetComponent implements OnInit {

    applicableTabs;
    currentTab;
    allWidgetsList: any[];
    transactionAuthAvailable;
    unsub$ = new Subject();
    constructor(private modalController: ModalController,
                private toastCtrl: ToastService,
                private dashboardSrv: DashboardService) {

        this.dashboardSrv.transactionAuthAvailable$.
        pipe(takeUntil(this.unsub$))
        .subscribe(val=>{
            this.transactionAuthAvailable = val;
        })
    }
    ngOnDestroy(): void {
        this.unsub$.next();
        this.unsub$.complete();
        this.unsub$.unsubscribe();
    }
    ngOnInit() {
        this.applicableTabs = ALL_WIDGETS;
        const avaliableWidgetList = _.find(this.applicableTabs, ['moduleName', this.currentTab.moduleName]).widgetList;
        console.log('ngOnInit', avaliableWidgetList);
        if(!this.transactionAuthAvailable){
            for (const i in avaliableWidgetList) {
                if (avaliableWidgetList[i].widgetName === 'PENDINGTRANSACTIONCOUNT') {
                    avaliableWidgetList.splice(i,1);        
                }
            }
        }
        this.fillNewWidgetList(this.currentTab.widgetList, avaliableWidgetList);
    }

    fillNewWidgetList(usedWidgets, avaliableWidgetList) {
        this.allWidgetsList = [];
        for (const widget of avaliableWidgetList) {
            let isAvailable = false;
            for (const usedWidget of usedWidgets) {
                if (widget.widgetName === usedWidget.widgetName) {
                    isAvailable = true;
                }
            }
            if (!isAvailable) {
                this.allWidgetsList.push(widget);
            }
        }
    }

    addNewWidgets(widgetName) {
        let isPresent = false;
        isPresent = _.find(this.currentTab.widgetList, ['widgetName', widgetName]);
        if (isPresent !== undefined) {
            this.toastCtrl.presentToast('Widget Already Added');
        } else {
            // this.currentTab.widgetList.push();
            const widget = {
                widgetName,
                index: this.currentTab.widgetList.length + 1
            };
            this.closeModal(widget);
        }
    }

    closeModal(widget?) {
        this.modalController.dismiss(widget);
    }
}
