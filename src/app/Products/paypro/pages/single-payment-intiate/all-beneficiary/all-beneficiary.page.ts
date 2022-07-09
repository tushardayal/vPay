import {Component, Input} from "@angular/core";
import { SinglePaymentService } from "../single-payment.service";
import {NavController, LoadingController, ModalController} from "@ionic/angular";
import { Router, ActivatedRoute } from "@angular/router";
import { ObjTransferService } from 'src/app/services/aps-services/obj-transfer.service';
import { ColorGenerator } from 'src/app/directives/text-avatar/color-generator';
import {FormGroup} from "@angular/forms";

@Component({
  selector: "app-all-beneficiary",
  templateUrl: "./all-beneficiary.page.html",
  styleUrls: ["./all-beneficiary.page.scss"],
})
export class AllBeneficiaryPage {

  @Input() modalView;

  beneList: Array<any> = [];
  currentPageClass = this;
  refreshTargetEvent;
  beneFilterText;
  constructor(
    public navCtrl: NavController,
    private loadingCtrl: LoadingController,
    private singlePaymentSrv: SinglePaymentService,
    private objTransSrv: ObjTransferService,
    private router: Router,
    private route: ActivatedRoute,
    public randomColor: ColorGenerator,
    private modalController: ModalController
  ) {}
  onItemClick(bene) {
    console.log(bene);
    this.objTransSrv.setObjData("beneData", {
      bene: bene,
      isFromFrequentlyUsedBeneficiary: false,
    });
    if (this.modalView) {
      this.modalController.dismiss();
    } else {
      this.router.navigate(["../initiate"], { relativeTo: this.route });
    }
  }

  ionViewDidEnter() {
    this.getBeneficiaries();
    console.log("ionViewDidLoad AlphaScrollPage");
  }

  getBeneficiaries() {
    this.singlePaymentSrv.getAllBene().subscribe((list) => {
      if (this.refreshTargetEvent) {
        this.refreshTargetEvent.target.complete();
      }
      this.beneList = list ? list.beneList : list;
    });
  }
  doRefresh(event) {
    this.refreshTargetEvent = event;
    this.getBeneficiaries();
  }
}
