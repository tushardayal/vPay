import { ToastController } from '@ionic/angular';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ToastService {

  constructor(public toastController: ToastController) {}

  async presentToast(message, args?) {
    const toastObj: any = {message, duration: 2000, position : 'bottom'};
    if (args) {
      toastObj.duration = args.duration === undefined ? 2000 : args.duration;
      toastObj.color = args.color ? args.color : '';
      toastObj.cssClass = args.cssClass ? args.cssClass : '';
      toastObj.position = args.position ? args.position : 'bottom';
    }

    const toast = await this
        .toastController
        .create(toastObj);
    toast.present();
  }
}
