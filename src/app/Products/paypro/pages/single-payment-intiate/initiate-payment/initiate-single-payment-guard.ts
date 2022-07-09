import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  CanDeactivate,
  UrlTree,
} from "@angular/router";
import { Injectable } from "@angular/core";
import { AlertController } from "@ionic/angular";
import { InitiatePaymentPage } from "./initiate-payment.page";
@Injectable({ providedIn: "root" })
export class InitiateSinglePaymentCanDeactivateGuardService
  implements CanDeactivate<InitiatePaymentPage> {
  clickedBack;
  constructor(private alertCtrl: AlertController) {
    this.clickedBack = false;
    console.log("inside authguard");
  }

  canDeactivate(
    component: InitiatePaymentPage,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState?: RouterStateSnapshot
  ): Promise<boolean | UrlTree> | boolean {
    if (component.recordSubmitted) {
      return true;
    }

    if (!this.clickedBack) {
      this.clickedBack = true;
      return new Promise((resolve) => {
        this.showConfirmAlert().then((data) => {
          console.log("canactive ", data);
          this.clickedBack = false;
          resolve(data);
        });
      });
    }
  }

  async showConfirmAlert() {
    let val;
    const confirmAlert = await this.alertCtrl.create({
      header: "Confirmation",
      message: "<p class='ion-margin-top ion-no-margin'>Are you sure you want to cancel payment?</p>",
      cssClass: "alert-subscribe",
      buttons: [
        {
          text: "Cancel",
          role: "cancel",
          handler: () => {
            confirmAlert.dismiss(false);
            return false;
          },
        },
        {
          text: "Ok",
          handler: () => {
            confirmAlert.dismiss(true);
            return false;
          },
        },
      ],
    });

    await confirmAlert.present();
    await confirmAlert.onDidDismiss().then((data) => {
      console.log(data);
      val = data.data;
    });
    console.log("return ", val);
    return val;
  }
}
