import {Component, OnInit, Input, OnChanges, DoCheck} from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { PaymentMethodsTemplateService } from '../payment-methods-template.service';
import { MenuController } from '@ionic/angular';
import { BicCodeSearchService } from 'src/app/components/bic-code-search/bic-code-search.service';
import {environment} from "../../../../../../../environments/environment";
import {PaymentRequestDetails, PaymentRequestView} from "../../../single-payment-intiate/single-payment.service";

@Component({
  selector: 'app-ep5',
  templateUrl: './ep5.component.html',
  styleUrls: ['./ep5.component.scss'],
})
export class EP5Component implements OnInit, OnChanges, DoCheck {

  @Input() formGroup: FormGroup;
  @Input() formData: any;
  @Input() modeObj: { mode: string, viewData: PaymentRequestView };

  paymentReq: PaymentRequestView;
  paymentReqDet: PaymentRequestDetails;

  remittancePurpose: any[] = [];
  chargeTypes: any[] = [];
  environment = environment;

  changeDetectionObj: any;

  constructor(
      private fb: FormBuilder,
      private paymentMethodSrv: PaymentMethodsTemplateService,
      private menu: MenuController,
      private bicCodeSrv: BicCodeSearchService
  ) {
    console.log("controller", this.formData);
  }

  identify(index, item) {
    return item.id;
  }

  getChargeTypes() {
    const inputData = {filters: [{name: "paymentMethod", value: "EP5", type: "String"}]};
    this.paymentMethodSrv.getChargeTypes({url: this.formData.chargesUrl, request: inputData})
        .subscribe((response) => {
          this.chargeTypes = response.dataList;
          if (this.modeObj.mode === "edit" && this.paymentReqDet) {
            this.formGroup.get("selectedChargeTypes").setValue(this.chargeTypes.find(a => a.id === this.paymentReqDet.chargeTo));
            this.onChangeChargeType();
          }
        });
  }

  ngDoCheck() {
    // console.log('Docheck', this.formData.beneficiaryPaymentMethodMapDetails);
    if (this.changeDetectionObj && this.formGroup.controls["beneficiaryPaymentMethodMapDetails.intermediaryBicCode"] &&
        this.changeDetectionObj.beneficiaryPaymentMethodMapDetails.intermediaryBicCode
          !== this.formGroup.controls["beneficiaryPaymentMethodMapDetails.intermediaryBicCode"].value) {
      this.ngOnChanges();
      // this.formData.beneficiaryPaymentMethodMapDetails.intermediaryBankName = this.formData.beneficiaryPaymentMethodMapDetails.intermediaryBank;
      // this.formData.beneficiaryPaymentMethodMapDetails.intermediaryBranchName = this.formData.beneficiaryPaymentMethodMapDetails.intermediaryBankBranch;
    }
  }

  ngOnChanges() {
    this.changeDetectionObj = this.formData;
    if (this.formData.beneficiaryPaymentMethodMapDetails) {
      let sortCode = this.formData.beneficiaryPaymentMethodMapDetails.sortCode;
      let intermediaryBicCode = this.formData.beneficiaryPaymentMethodMapDetails.intermediaryBicCode;
      let intermediarySortCode = this.formData.beneficiaryPaymentMethodMapDetails.intermediarySortCode;
      if (this.modeObj.mode === "edit" && this.modeObj.viewData && this.modeObj.viewData.paymentRequestDetails
          && this.modeObj.viewData.paymentRequestDetails.length) {
        this.paymentReq = this.modeObj.viewData;
        this.paymentReqDet = this.paymentReq.paymentRequestDetails[0];

        this.formData.beneficiaryPaymentMethodMapDetails.bank = this.paymentReqDet.paymentRequestAdditionalDetail.bankName;
        this.formData.beneficiaryPaymentMethodMapDetails.branch = this.paymentReqDet.paymentRequestAdditionalDetail.branchName;
        this.formData.beneficiaryPaymentMethodMapDetails.address1 = this.paymentReqDet.beneficiaryAddress1;
        this.formData.beneficiaryPaymentMethodMapDetails.address1 = this.paymentReqDet.beneficiaryAddress2;
        this.formData.beneficiaryPaymentMethodMapDetails.address1 = this.paymentReqDet.beneficiaryAddress3;
        sortCode = this.paymentReqDet.paymentRequestAdditionalDetail.bankSortCode;
        intermediaryBicCode = this.paymentReqDet.paymentRequestAdditionalDetail.intermediaryBankBicCode;
        intermediarySortCode = this.paymentReqDet.paymentRequestAdditionalDetail.sortCode;
        // tslint:disable-next-line:max-line-length
        // this.formData.beneficiaryPaymentMethodMapDetails.intermediaryBankName = this.paymentReqDet.paymentRequestAdditionalDetail.intermediaryBank;
        // tslint:disable-next-line:max-line-length
        // this.formData.beneficiaryPaymentMethodMapDetails.intermediaryBranchName = this.paymentReqDet.paymentRequestAdditionalDetail.intermediaryBankBranch;
      }

      this.formGroup.removeControl("beneficiaryPaymentMethodMapDetails.sortCode");
      this.formGroup.removeControl("beneficiaryPaymentMethodMapDetails.intermediaryBicCode");
      this.formGroup.removeControl("beneficiaryPaymentMethodMapDetails.intermediarySortCode");
      this.formGroup.addControl("beneficiaryPaymentMethodMapDetails.sortCode", this.fb.control(sortCode));
      this.formGroup.addControl("beneficiaryPaymentMethodMapDetails.intermediaryBicCode", this.fb.control(intermediaryBicCode));
      this.formGroup.addControl("beneficiaryPaymentMethodMapDetails.intermediarySortCode", this.fb.control(intermediarySortCode));

    }

  }

  ngOnInit() {
    this.formGroup.addControl("selectedChargeTypes", this.fb.control(null, [Validators.required]));
    this.formGroup.addControl("selectedRemittancePurpose", this.fb.control(null, [Validators.required]));
    this.getChargeTypes();
    this.bicCodeSrv.setBicCodeType("EP5");
  }

  onChangeChargeType() {
    if (!this.formGroup.get("selectedChargeTypes").value) {
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

  onChangeRemittance() {
  }

  openBicCode() {
    this.menu.open('bicCodeMenuId');
  }
}
