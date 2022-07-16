import { Component, OnInit, Input } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";

@Component({
  selector: "app-ep1",
  templateUrl: "./ep1.component.html",
  styleUrls: ["./ep1.component.scss"],
})
export class EP1Component implements OnInit {
  @Input() formGroup: FormGroup;
  @Input() formData: any;
  constructor(private fb: FormBuilder) {
    console.log("controller", this.formData);
  }

  ngOnInit() {
    const address = (this.formData.selectedBeneficiary.address1 || '-').concat(", ")
        .concat(this.formData.selectedBeneficiary.address2 || '-').concat(", ")
        .concat(this.formData.selectedBeneficiary.address3 || '-');
    this.formGroup.addControl(
        "selectedBeneficiary.address",
        this.fb.control(address)
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
