import {Component, Input, OnInit} from '@angular/core';
import {ModalController} from "@ionic/angular";
import {ApsTraslatePipe} from "../../../../../components/pipes/aps-traslate.pipe";

@Component({
  selector: 'app-view-deal',
  templateUrl: './view-deal.component.html',
  styleUrls: ['./view-deal.component.scss'],
})
export class ViewDealComponent implements OnInit {

  @Input() data;

  constructor(private modalCtrl: ModalController) {
  }

  ngOnInit() {
    console.log(this.data);
  }

  closeModal() {
    this.modalCtrl.dismiss();
  }
}
