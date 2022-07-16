import {
  Component,
  OnInit,
  Input, OnChanges
} from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { PaymentMethodsTemplateService } from '../payment-methods-template.service';
import {environment} from "../../../../../../../environments/environment";
import {PaymentRequestDetails, PaymentRequestView} from "../../../single-payment-intiate/single-payment.service";

@Component({
  selector: "app-ep3",
  templateUrl: "./ep3.component.html",
  styleUrls: ["./ep3.component.scss"],
})
export class EP3Component implements OnChanges {
  @Input() formGroup: FormGroup;
  @Input() formData: any;
  @Input() modeObj: { mode: string, viewData: PaymentRequestView};

  paymentReq: PaymentRequestView;
  paymentReqDet: PaymentRequestDetails;

  remittancePurpose: any[] = [];
  chargeTypes: any[] = [];
  environment = environment;
  constructor(
    private fb: FormBuilder,
    private paymentMethodSrv: PaymentMethodsTemplateService
  ) {
    console.log("controller", this.formData);
  }
  identify(index, item) {
    return item.id;
  }
  ngOnChanges() {

    if (this.modeObj.mode === "edit" && this.modeObj.viewData && this.modeObj.viewData.paymentRequestDetails
        && this.modeObj.viewData.paymentRequestDetails.length) {
      this.paymentReq = this.modeObj.viewData;
      this.paymentReqDet = this.paymentReq.paymentRequestDetails[0];
    }

    this.formGroup.addControl("selectedChargeTypes", this.fb.control(null, [Validators.required]));
    this.formGroup.addControl("selectedRemittancePurpose", this.fb.control(null, [Validators.required]));
    console.log("init ep3 ", this.formGroup, this.formData);
    this.getChargeTypes();
  }

  onChangeChargeType() {
    if (!this.formGroup.get("selectedChargeTypes").value){
      return;
    }
    const inputData = {
      filters: [
        {
          name: "charge",
          value: this.formGroup.get("selectedChargeTypes").value.displayName,
          type: "String",
        },
        {
          name: "accountLabel",
          value: "ACCOUNTNO",
          type: "String",
        },
      ],
    };
    this.paymentMethodSrv
      .getRemittancePurpose({url: this.formData.remittanceUrl, request: inputData})
      .subscribe((response) => {
        this.remittancePurpose = response.dataList;
        if (this.modeObj.mode === "edit" && this.paymentReqDet) {
          this.formGroup.controls.selectedRemittancePurpose
              .setValue(this.remittancePurpose.find(a => a.displayName === this.paymentReqDet.remittancePurpose));
        }
      });
  }

  getChargeTypes() {
    const inputData = {
      filters: [
        {
          name: "paymentMethod",
          value: "EP3",
          type: "String",
        },
      ],
    };
    this.paymentMethodSrv.getChargeTypes({url: this.formData.chargesUrl, request: inputData})
    .subscribe((response) => {
      this.chargeTypes = response.dataList;
      if (this.modeObj.mode === "edit" && this.paymentReqDet) {
        this.formGroup.get("selectedChargeTypes").setValue(this.chargeTypes.find(a => a.id === this.paymentReqDet.chargeTo));
        this.onChangeChargeType();
      }
    });
  }
  onChangeRemittance() {}
}
