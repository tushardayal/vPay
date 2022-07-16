import {Component, Input, OnChanges, OnInit} from '@angular/core';
import {DashboardService} from "../../dashboard-service";
import {ObjTransferService} from "../../../services/aps-services/obj-transfer.service";
import {NavController} from "@ionic/angular";

@Component({
  selector: 'pending-authorization',
  templateUrl: 'pending-authorization.page.html',
  styleUrls: ['pending-authorization.page.scss'],
})
export class PendingAuthorizationPage implements OnInit{

  // @Output() onItemClick = new EventEmitter();
  data;
  isLoading = false;
  constructor(private dashboardService: DashboardService,
              private navCtrl: NavController,
              private objTransSrv: ObjTransferService) {}

  ngOnInit(): void {
    this.getTransactionCout();
  }

  getTransactionCout() {
    this.isLoading = true;
    this.dashboardService.getTransactionCout().subscribe(value => {
      this.data = value.pendingTxnCount;
      this.isLoading = false;
    });
  }

  refreshPage() {
    this.dashboardService.widgetEditMode = false;
    this.getTransactionCout();
  }

    goToPendingList(moduleData) {
      this.objTransSrv.setObjData('state', { page: { entityName: "TRANSACTIONS"} });
      this.objTransSrv.setObjData('tabEntityName', moduleData.moduleName);
      this.navCtrl.navigateRoot("menu/paypro/listing/paypro");
    }
}
