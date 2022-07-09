import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import * as _ from "lodash";
import {PayBillService} from "../pay-bill.service";
import { ObjTransferService } from 'src/app/services/aps-services/obj-transfer.service';


@Component({
  selector: 'app-biller-list',
  templateUrl: './biller-list.page.html',
  styleUrls: ['./biller-list.page.scss'],
})
export class BillerListPage implements OnInit {
  billerProductList: any[];
  refreshTargetEvent;
  billerFilterText;
  
  constructor(
    private paybillService: PayBillService,
    private router: Router,
    private route: ActivatedRoute,
    private objTransSrv: ObjTransferService, ) { }

  ngOnInit() {
  }

  ionViewDidEnter() {
    this.getBillersWithProducts();
  }
  getBillersWithProducts() {
    this.paybillService.getBillersWithProducts()
    .subscribe((response) => {
      this.billerProductList = response;
      if (this.refreshTargetEvent) {
        this.refreshTargetEvent.target.complete();
      }
    });
  }

  doRefresh(event) {
    this.refreshTargetEvent = event;
    this.getBillersWithProducts();
  }

  onItemClickFunc(billerData) {
    this.billerFilterText = "";
    this.objTransSrv.setObjData("billerData", {
      productDetails: billerData
    });
    this.router.navigate(["../list-of-bills"], { relativeTo: this.route });
  }
}
