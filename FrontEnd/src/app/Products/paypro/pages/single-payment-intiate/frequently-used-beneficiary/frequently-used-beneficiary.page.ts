import { Component } from "@angular/core";
import { SinglePaymentService } from "../single-payment.service";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import * as _ from "lodash";
import { Router, ActivatedRoute } from "@angular/router";
import { ObjTransferService } from 'src/app/services/aps-services/obj-transfer.service';

@Component({
  selector: "app-frequently-used-beneficiary",
  templateUrl: "./frequently-used-beneficiary.page.html",
  styleUrls: ["./frequently-used-beneficiary.page.scss"],
})
export class FrequentlyUsedBeneficiaryPage {
  beneficiaries$: Observable<any>;
  beneListLoaded = true;
  refreshTargetEvent;
  constructor(
    private singlePaymentService: SinglePaymentService,
    private router: Router,
    private route: ActivatedRoute,
    private objTransSrv: ObjTransferService
  ) {}

  getMostlyUsedBeneficiaries() {
    this.beneficiaries$ = this.singlePaymentService.getMostlyUsedBene().pipe(
      map((value) => {
        if (value) {
          this.beneListLoaded = true;
        } else {
          this.beneListLoaded = false;
        }
        if (this.refreshTargetEvent) {
          this.refreshTargetEvent.target.complete();
        }
        return _.orderBy(value.beneList, ["beneficiaryCode"], "asc");
      })
    );
  }
  ionViewDidEnter() {
    this.getMostlyUsedBeneficiaries();
  }
  onItemClickFunc(bene, event) {
    console.log(bene);
    this.objTransSrv.setObjData("beneData", {
      bene: bene,
      isFromFrequentlyUsedBeneficiary: true,
    });
    this.router.navigate(["../initiate"], { relativeTo: this.route });
  }
  doRefresh(event) {
    this.refreshTargetEvent = event;
    this.getMostlyUsedBeneficiaries();
  }
}
