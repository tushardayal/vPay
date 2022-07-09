import { Component, OnInit, Input } from "@angular/core";
import { FormGroup, FormBuilder } from "@angular/forms";

@Component({
  selector: "app-ep10",
  templateUrl: "./ep10.component.html",
  styleUrls: ["./ep10.component.scss"],
})
export class EP10Component implements OnInit {
  @Input() formGroup: FormGroup;
  @Input() formData: any;
  constructor(private fb: FormBuilder) {
    console.log("controller", this.formData);
  }

  ngOnInit() {
    this.formGroup.addControl(
      "beneficiaryPaymentMethodMapDetails.mobileNo",
      this.fb.control(
        this.formData.beneficiaryPaymentMethodMapDetails
          ? this.formData.beneficiaryPaymentMethodMapDetails.mobileNo
          : undefined
      )
    );
    this.formGroup.addControl(
      "beneficiaryPaymentMethodMapDetails.mmID",
      this.fb.control(
        this.formData.beneficiaryPaymentMethodMapDetails
          ? this.formData.beneficiaryPaymentMethodMapDetails.mmID
          : undefined
      )
    );
    this.formGroup.addControl(
      "beneficiaryPaymentMethodMapDetails.swiftCode",
      this.fb.control(
        this.formData.beneficiaryPaymentMethodMapDetails
          ? this.formData.beneficiaryPaymentMethodMapDetails.swiftCode
          : undefined
      )
    );
    this.formGroup.addControl(
      "beneficiaryPaymentMethodMapDetails.accountNo",
      this.fb.control(
        this.formData.beneficiaryPaymentMethodMapDetails
          ? this.formData.beneficiaryPaymentMethodMapDetails.accountNo
          : undefined
      )
    );
  }
}
