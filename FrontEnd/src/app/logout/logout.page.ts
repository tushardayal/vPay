import { Component, OnInit } from '@angular/core';
import {ModalController, NavController} from "@ionic/angular";
import {appConstants} from "../appConstants";
import {environment} from "../../environments/environment";

declare let window: any;
@Component({
  selector: 'app-logout',
  templateUrl: './logout.page.html',
  styleUrls: ['./logout.page.scss'],
  providers:[]
})
export class LogoutPage implements OnInit {
  environment = environment;

  constructor(private navCtrl: NavController,
              private modalCrl: ModalController) {
  }

  ngOnInit() {
    console.log('logout Page');
    console.log("add in en.json", appConstants.TEMP_VAR);
    try {
      this.modalCrl.dismiss();
    } catch (e) {
      console.log(e);
    }

  }

  redirectToLogin() {
    window.location="";
  }
}
