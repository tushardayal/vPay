import { Component } from '@angular/core';
import { NavController, ModalController } from '@ionic/angular';
import { IntroService } from '../../services/aps-services/intro-service';

@Component({
    templateUrl: 'intro-page.page.html',
    styleUrls: ['intro-page.page.scss'],
    providers:[IntroService]
})
export class IntroPage {

    data = {};

    constructor(
        private modalController: ModalController,
        public navCtrl: NavController,
        private service: IntroService) {
        this.service.load().subscribe(d => {
            this.data = d;
        });
    }

     closeModal(e) {
         localStorage.setItem("SHOW_START_WIZARD", 'true');
        this.modalController.dismiss();
    }
}
