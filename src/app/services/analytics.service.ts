import { Injectable } from '@angular/core';
// import {FirebaseX} from "@ionic-native/firebase-x/ngx";
import {Platform} from "@ionic/angular";

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {

  constructor(
      // private firebaseX: FirebaseX,
      private platform: Platform
  ) {}

  // Tracks a custom event in Firebase Analytics
  logEvent(name: string, properties: object) {
    this.platform.ready().then(() => {
      // this.firebaseX.logEvent(name, properties); // Ex: "select_content", {content_type: "page_view", item_id: "home"}
    });
  }

  setUserProperty(key: string, value: string) {
    this.platform.ready().then(() => {
      // this.firebaseX.setUserProperty(key, value);
    });
  }

  // Tracks an 'screen_view' event in Firebase Analytics
  trackScreen(name: string) {
    this.platform.ready().then(() => {
      // this.firebaseX.setScreenName(name);
    });
  }

  setUserId(uid: string) {
    this.platform.ready().then(() => {
      // this.firebaseX.setUserId(uid);
    });
  }
}
