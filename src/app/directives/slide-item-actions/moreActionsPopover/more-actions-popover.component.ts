import { Component } from "@angular/core";
import { PopoverController, NavParams } from '@ionic/angular';

@Component({
  templateUrl: "./more-actions-popover.compoent.html",
})
export class MoreActionsPopoverComponent {
  moreActions = [];
  constructor(private popoverCtrl: PopoverController, private navParams: NavParams) {
    this.moreActions = this.navParams.data.moreActions;
  }

  actionClicked(fun , item) {
    this.popoverCtrl.dismiss({ item, fun});
  }
}
