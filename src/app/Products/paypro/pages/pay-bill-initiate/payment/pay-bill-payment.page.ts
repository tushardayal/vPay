import {Component, OnInit} from "@angular/core";
import {DatePipe} from '@angular/common';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {Router} from "@angular/router";
import {AlertController, NavController} from "@ionic/angular";
import {PayBillService} from "src/app/Products/paypro/pages/pay-bill-initiate/pay-bill.service";
import {RoutingStateService} from "../../../../../services/aps-services/routing-state.service";
import {ObjTransferService} from 'src/app/services/aps-services/obj-transfer.service';
import {PayBillRequestModel} from "../paybillRequestModel";
import {ToastService} from 'src/app/services/aps-services/toast-service';
import {environment} from "src/environments/environment";
import {UserService} from "src/app/services/aps-services/user.service";
import {TranslatePipe} from '@ngx-translate/core';
import {appConstants} from "../../../../../appConstants";

@Component({
  selector: "app-pay-bill-payment",
  templateUrl: "./pay-bill-payment.page.html",
  styleUrls: ["./pay-bill-payment.page.scss"],
  providers: [TranslatePipe]
})
export class PayBillPaymentPage implements OnInit {
  backUrl;
  selectedCorporateAccountBalance;
  corpCurrencyCode;
  summaryDetailsList: any = [];
  dataObj: any;
  payableAmount;
  debitAccountsList: any = [];
  valueDate;

  globalDateFormat = appConstants.dateFormat;
  minDate;
  payBillRequest: any = {};
  public paymentForm: FormGroup;
  private payBillRequestModel: PayBillRequestModel;
  environment = environment;
  constructor(
    public formBuilder: FormBuilder,
    private routingState: RoutingStateService,
    private payBillService: PayBillService,
    private objTransSrv: ObjTransferService,
    private alertCtrl: AlertController,
    private router: Router,
    private tostSrv: ToastService,
    private navCtrl: NavController,
    private userSrv: UserService,
    private datePipe: DatePipe,
    private translate: TranslatePipe
  ) {}
  ionViewWillEnter() {
  }

  ngOnInit() {
    this.paymentForm = this.formBuilder.group({
      valueDate: [null],
      payableAmount: [null,
        [
            Validators.required,
            Validators.pattern("^\\d+(,\\d+)*?(\\.\\d{1,2})?$"),
            Validators.maxLength(14),
        ],
      ],
      selectedCorporateCurrencyCode: [null],
      selectedCorporateAccount: [null],
    });
    this.backUrl = this.routingState.getPreviousUrl();
    const stateData =  this.objTransSrv.getObjData('summaryData');
    this.summaryDetailsList = stateData;
    this.getSelectedData(this.summaryDetailsList);
    this.objTransSrv.removeObj('summaryData');

    this.paymentForm.controls['valueDate'].setValue(this.userSrv.getPaymentApplicationDate());
  }

  getSelectedData(selectedData){
    this.dataObj = selectedData.summaryDetails;
    this.paymentForm.controls.payableAmount.setValue(this.dataObj.billAmount);
    if(this.dataObj.billerIntegration === 'Offline'){
      this.dataObj.billAmount = '-';
      this.dataObj.dueDate = this.userSrv.getPaymentApplicationDate();
      this.dataObj.billDate = null;
      this.paymentForm.controls.payableAmount.setValue(null);
    }
    this.getDebitAccountList();
  }
  getDebitAccountList() {
    this.payBillService.getDebitAccounts()
    .subscribe((response) => {
        this.debitAccountsList = response.dataList;
        // for (let i = 0; i < this.debitAccountsList.length; i++) {
        for (const debitAccount of this.debitAccountsList) {
          if (this.dataObj.debitAccountId == debitAccount.id) {
            this.paymentForm.controls['selectedCorporateAccount'].setValue(debitAccount);
          }
        }
        const setCorpAcc = this.paymentForm.controls['selectedCorporateAccount'].value;
        this.corpCurrencyCode = setCorpAcc.enrichments.currencyCode;
        this.paymentForm.controls['selectedCorporateCurrencyCode'].setValue(setCorpAcc.enrichments.currencyCode);

        this.getOnlineBalance();
    });
  }

  getOnlineBalance(){
    const accountdata = this.paymentForm.controls['selectedCorporateAccount'].value;
    this.payBillService.getOnlineBalance(accountdata)
    .subscribe((response) => {
      if(response.dataList !== undefined && response.dataList.length !== 0) {
        this.selectedCorporateAccountBalance = response.dataList[0].enrichments.balance;
      }
    });
  }

  onChangeDebitAccounts() {
    this.getOnlineBalance();
  }

  onPreviousFunc() {
    this.navCtrl.navigateBack(this.backUrl);
  }

  verifyDetails() {
    if (this.paymentForm.invalid) {
      this.tostSrv.presentToast("Invalid Data");
      this.paymentForm.markAllAsTouched();
      return;
    }
   let paybillRequest: any = {};
    this.paymentForm.value.valueDate = this.datePipe.transform(this.paymentForm.value.valueDate, 'dd-MMM-yyyy');
    const paybillRequestObj = {
      formData: {
        ...this.paymentForm.value,
      },
      debitAccount: this.paymentForm.controls.selectedCorporateAccount.value,
      getDataObj: this.dataObj,
      entityName: "BILLPAYMENT",
    };

    this.payBillRequestModel = new PayBillRequestModel({
      ...paybillRequestObj,
    });
    paybillRequest = this.payBillRequestModel.getOatRequestObj();
    this.payBillRequest = paybillRequest;
    this.showConfirmAlert();
  }

  async showConfirmAlert() {

    const cofirmAlert = await this.alertCtrl.create({
      header: this.translate.transform("lbl_confirm"),
      message: "<p class='ion-margin-top ion-no-margin'>" + this.translate.transform("lbl_do_you_want_to_proceed") + "</p>",
      cssClass: "alert-subscribe",
      backdropDismiss: false,
      buttons: [
        {
          text: this.translate.transform("lbl_cancel"),
          role: "cancel",
          handler: () => {},
        },
        {
          text: this.translate.transform("lbl_ok"),
          handler: (data) => {
            this.payBillService
            .submitToServer(this.payBillRequest)
            .subscribe((response) => {
              if (response.responseStatus.status === "0") {
                this.successAlert({
                  responseData: response
                });
              }
            });
          },
        },
      ],
    });
    await cofirmAlert.present();
  }
  async successAlert(data) {
    const alert = await this.alertCtrl.create({
      header: this.translate.transform("lbl_successfully_initiated"),
      message: "<p class='ion-margin-top ion-no-margin'>Bill payment of " +
          data.responseData.dataMap.payableCurrencyName + " " + data.responseData.dataMap.payableAmount + " for " + data.responseData.dataMap.subscriberName + "</p>",
      buttons: [
        {
          text: this.translate.transform("lbl_ok"),
          handler: () => {
            this.alertCtrl.dismiss({ successResponse: data });
          }
        },
      ],
    });

    alert.onWillDismiss().then((res) => {
      const navigateLink = [
          "/",
          "menu",
          "paypro",
          "pay-bill-initiate",
          ];
      this.router.navigate(navigateLink);

    });

    await alert.present();

  }
}

