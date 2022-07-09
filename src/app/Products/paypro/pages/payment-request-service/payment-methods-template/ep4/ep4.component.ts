import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-ep4',
  templateUrl: './ep4.component.html',
  styleUrls: ['./ep4.component.scss'],
})
export class EP4Component implements OnInit {
  @Input() formGroup: FormGroup;
  @Input() formData: any;
  private remittancePurpose: any[] = [];
  constructor(
    private fb: FormBuilder
  ) {
    console.log("ep4 controller");
  }
  ngOnInit() {
    
    this.formGroup.addControl(
      "selectedBeneficiary.address",
      this.fb.control(
        this.formData.selectedBeneficiary.address1 || '-' +
          ", " +
          this.formData.selectedBeneficiary.address2 || '-' +
          ", " +
          this.formData.selectedBeneficiary.address3 || '-'
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
    this.formGroup.addControl(
      "beneficiaryPaymentMethodMapDetails.swiftCode",
      this.fb.control(
        this.formData.beneficiaryPaymentMethodMapDetails
          ? this.formData.beneficiaryPaymentMethodMapDetails.swiftCode
          : undefined
      )
    );
    this.formGroup.addControl(
      "beneficiaryPaymentMethodMapDetails.accountTypeName",
      this.fb.control(
        this.formData.beneficiaryPaymentMethodMapDetails
          ? this.formData.beneficiaryPaymentMethodMapDetails.accountTypeName
          : undefined
      )
    );
  }

}
