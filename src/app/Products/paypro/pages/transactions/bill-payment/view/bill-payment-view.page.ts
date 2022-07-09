import { Component, OnInit, OnDestroy } from "@angular/core";
import { ListingService } from "src/app/listing/listing.service";
import { ActivatedRoute } from "@angular/router";
import { Subscription } from 'rxjs';
import {TransactionCommonService} from "../../../../../transaction-common.service";

@Component({
  selector: "bill-payment-view",
  templateUrl: "./bill-payment-view.page.html",
  styleUrls: ["./bill-payment-view.page.scss"]
})
export class BillPaymentViewPage implements OnDestroy, OnInit {
  id: string;
  dataObj: any;
  unsub$: Subscription;
  constructor(
    private listingSrv: ListingService,
    private navParams: ActivatedRoute,
    public transactionsSrv: TransactionCommonService
  ) {
    /*navParams.paramMap.subscribe(val => {
      this.id = val.get("id");
      this.unsub$ = listingSrv.view(this.id).subscribe(data => {
        this.dataObj = data;
      });
    });*/
   }

  ngOnDestroy() {
    this.unsub$.unsubscribe();
  }
  ngOnInit() {
    this.unsub$ = this.listingSrv.view(this.id).subscribe(data => {
      this.dataObj = data;
    });
  }
}
