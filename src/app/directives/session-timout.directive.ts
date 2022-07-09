import {Directive, HostListener} from '@angular/core';
import {MenuService} from "../menu/menu-service";
import {AlertController, NavController} from "@ionic/angular";
import {TranslatePipe} from "@ngx-translate/core";
import {appConstants} from "../appConstants";

@Directive({
  selector: '[appSessionTimout]'
})
export class SessionTimoutDirective {

  idleTimeout = appConstants.idleTimeout;
  idleLogoutTimer;

  constructor(private menuService: MenuService,
              private alertCtrl: AlertController,
              private navController: NavController,
              private translate: TranslatePipe) {
    console.log('########  SessionTimoutDirective ######');
  }

  @HostListener('touchstart')
  onTouchStart() {
    this.restartIdleLogoutTimer();
  }


  OnInit() {
    this.restartIdleLogoutTimer();
  }

  restartIdleLogoutTimer() {
    console.log('restartIdleLogoutTimer');
    clearTimeout(this.idleLogoutTimer);
    this.idleLogoutTimer = setTimeout(() => {
      this.logoutUser();
    }, this.idleTimeout);
  }

  async logoutUser() {
    // your logout logic here
    const alert = await this.alertCtrl.create({
      header: this.translate.transform("lbl_session_timeout"),
      // subHeader: msg.generationDate,
      backdropDismiss: false,
      message: "<p class='ion-margin-top ion-no-margin'>" + this.translate.transform("lbl_session_timeout") + "</p>",
      buttons: [
        {
          text: this.translate.transform("lbl_ok"),
          handler: () => {
            console.log('Confirm Logout');
            this.navController.navigateRoot(['/logout']);
          }
        }
      ]
    });
    this.menuService.logout().subscribe(value => {
      console.log('logged out');
      alert.present();
    });
  }
}
