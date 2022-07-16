import {Component, OnInit, Input, OnChanges} from "@angular/core";
import { FormGroup, FormBuilder } from "@angular/forms";
import {PaymentRequestDetails, PaymentRequestView} from "../../../single-payment-intiate/single-payment.service";

@Component({
  selector: "app-ep18",
  templateUrl: "./ep18.component.html",
  styleUrls: ["./ep18.component.scss"],
})
export class EP18Component implements OnChanges {
  @Input() formGroup: FormGroup;
  @Input() formData: any;
  @Input() modeObj: { mode: string, viewData: PaymentRequestView};

  paymentReq: PaymentRequestView;
  paymentReqDet: PaymentRequestDetails;

  constructor(private fb: FormBuilder) {}

  ngOnChanges() {
    if (this.formData.beneficiaryPaymentMethodMapDetails) {
      if (this.modeObj.mode === "edit" && this.modeObj.viewData && this.modeObj.viewData.paymentRequestDetails
          && this.modeObj.viewData.paymentRequestDetails.length) {
        this.paymentReq = this.modeObj.viewData;
        this.paymentReqDet = this.paymentReq.paymentRequestDetails[0];
      }
    }
  }
}
