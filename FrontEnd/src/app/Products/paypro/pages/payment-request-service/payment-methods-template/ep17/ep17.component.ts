import {Component, OnInit, Input, OnChanges} from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { PaymentMethodsTemplateService } from '../payment-methods-template.service';
import {environment} from "../../../../../../../environments/environment";
import {PaymentRequestDetails, PaymentRequestView} from "../../../single-payment-intiate/single-payment.service";

@Component({
  selector: "app-ep17",
  templateUrl: "./ep17.component.html",
  styleUrls: ["./ep17.component.scss"],
})
export class EP17Component implements OnChanges {
  @Input() formGroup: FormGroup;
  @Input() formData: any;
  @Input() modeObj: { mode: string, viewData: PaymentRequestView};

  paymentReq: PaymentRequestView;
  paymentReqDet: PaymentRequestDetails;

  remittancePurpose: any[] = [];
  environment = environment;
  constructor(private fb: FormBuilder, private paymentMethodSrv: PaymentMethodsTemplateService) {}

  ngOnChanges() {

    if (this.formData.beneficiaryPaymentMethodMapDetails) {
      if (this.modeObj.mode === "edit" && this.modeObj.viewData && this.modeObj.viewData.paymentRequestDetails
          && this.modeObj.viewData.paymentRequestDetails.length) {
        this.paymentReq = this.modeObj.viewData;
        this.paymentReqDet = this.paymentReq.paymentRequestDetails[0];
      }
    }
    this.getChargeTypes();
    this.formGroup.addControl("selectedRemittancePurpose", this.fb.control(null, [Validators.required]));
    this.getRemittancePurpose();
  }

  getChargeTypes() {
    const inputData = {filters: [{name: "paymentMethod", value: "EP5", type: "String"}]};
    this.paymentMethodSrv.getChargeTypes({url: this.formData.chargesUrl, request: inputData})
        .subscribe((response) => {
          const chargeTypes = response.dataList;
          if (chargeTypes) {
            chargeTypes.map(a => {
              if (a.displayName === "SHA") {
                this.formGroup.addControl("selectedChargeTypes", this.fb.control(a, [Validators.required]));
              }
            });
          }
        });
  }

  identify(index, item) {
    return item.id;
  }
getRemittancePurpose() {
  const inputData = {
    filters: [
      {
        name: "charge",
        value: 'SHA1',
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

  onChangeRemittance() {}
}
