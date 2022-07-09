import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { DashboardPage } from './dashboard.page';
import { SharedModule } from '../components/shared.module';
import { IntroPage } from '../pages/intro-page/intro-page.page';
import { ProcessQueueComponent } from './widgets/process-queue/process-queue.component';
import { SuperTabsModule } from "@ionic-super-tabs/angular";
import { PendingAuthorizationPage } from "./widgets/pending-authorization/pending-authorization.page";
import { NotificationsComponent } from "./notifications/notificationPopover/notifications.component";
import { NotificationListComponent } from "./notifications/notification-list/notification-list.component";
import { NotificationTimelineComponent } from "./notifications/notification-timeline/notification-timeline.component";
import { AddNewWidgetComponent } from "./add-new-widget/add-new-widget.component";
import { TranslateModule } from '@ngx-translate/core';
import { ProcessingPage } from "./widgets/processing/processing.page";
import { CalenderEventsPage } from "./widgets/calender-events/calender-events.page";
import { AccountSummaryWidgetComponent } from "./widgets/account-summary-widget/account-summary-widget.component";
import { TransactionWiseSummaryPage } from './widgets/transaction-wise-summary/transaction-wise-summary.page';
import { TransactionStatusSummaryPage } from './widgets/transaction-status-summary/transaction-status-summary.page';
import { AccountSummaryWidgetViewComponent } from './widgets/account-summary-widget/account-summary-widget-view/account-summary-widget-view.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        // IntroPageModule,
        SharedModule,
        TranslateModule,
        RouterModule.forChild([
            {
                path: '',
                component: DashboardPage,
            },
            {
                path: 'allNotifications',
                component: NotificationListComponent
            },
            {
                path: 'notificationsTimeline',
                component: NotificationTimelineComponent
            }

        ]),
        SuperTabsModule
    ],
    declarations: [
        DashboardPage,
        IntroPage,
        PendingAuthorizationPage,
        ProcessQueueComponent,
        ProcessingPage,

        NotificationsComponent,
        NotificationListComponent,
        NotificationTimelineComponent,
        AddNewWidgetComponent,
        CalenderEventsPage,
        AccountSummaryWidgetComponent,
        TransactionWiseSummaryPage,
        TransactionStatusSummaryPage,
        AccountSummaryWidgetViewComponent
    ],
    entryComponents: [
        IntroPage,
        NotificationsComponent,
        AddNewWidgetComponent,
        AccountSummaryWidgetViewComponent
    ],
    exports: [IntroPage, DashboardPage],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class DashboardPageModule { }
