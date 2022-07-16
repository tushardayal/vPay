import { Component } from "@angular/core";
import { PopoverController, NavParams } from '@ionic/angular';
import { AccountSummaryService } from '../account-summary.service';

@Component({
  templateUrl: "./exchange-currency-popover.compoent.html",
})
export class ExchangeCurrencyPopoverComponent {
  searchItems = ["LKR"]; // , "USD", "GBP", "INR"
  exchangeCurrencyCode = "LKR";
  constructor(private popoverCtrl: PopoverController, private navParams: NavParams) {
    this.exchangeCurrencyCode = this.navParams.data.exchangeCurrencyCode;
  }

  onChangeCurrency() {
    console.log(this.exchangeCurrencyCode);
    this.popoverCtrl.dismiss({ exchangeCurrencyCode: this.exchangeCurrencyCode });
  }
}
