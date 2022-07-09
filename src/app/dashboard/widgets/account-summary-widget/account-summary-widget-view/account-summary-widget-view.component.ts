import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-account-summary-widget-view',
  templateUrl: './account-summary-widget-view.component.html',
  styleUrls: ['./account-summary-widget-view.component.scss'],
})
export class AccountSummaryWidgetViewComponent implements OnInit {

  @Input() accounts;
  @Input() header;
  @Input() accType;

  constructor(private modalCtrl: ModalController) { }

  ngOnInit() {
  }

  closeModal() {
    this.modalCtrl.dismiss();
  }
}
